import { DEFAULT_SEARCH_COORDINATES } from "#/features/search/model/useMapSheetSession";
import { getLockerDetail } from "#/shared/api/lockers";

const NAVER_STATIC_MAP_ENDPOINT =
  "https://maps.apigw.ntruss.com/map-static/v2/raster";
const DEFAULT_OG_IMAGE_PATH = "/images/og-default.png";
const REQUEST_TIMEOUT_MS = 5_000;
const SUCCESS_CACHE_CONTROL =
  "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000";
const FALLBACK_CACHE_CONTROL = "public, max-age=300, s-maxage=300";

interface LockerOgImageEnv {
  NAVER_MAP_CLIENT_ID?: string;
  NAVER_MAP_CLIENT_SECRET?: string;
  VITE_NAVER_MAP_CLIENT_ID?: string;
}

interface LockerOgImageDetail {
  latitude?: number;
  longitude?: number;
}

export interface LockerOgImageDependencies {
  env: LockerOgImageEnv;
  getDetail: (
    lockerId: number,
    signal: AbortSignal,
  ) => Promise<LockerOgImageDetail>;
  fetchMap: typeof fetch;
  createAbortSignal: () => AbortSignal;
}

interface CreateLockerOgImageResponseOptions {
  rawLockerId: string;
  requestUrl: string;
  dependencies?: LockerOgImageDependencies;
}

const DEFAULT_DEPENDENCIES: LockerOgImageDependencies = {
  env: process.env,
  getDetail: (lockerId, signal) =>
    getLockerDetail({
      lockerId,
      lat: DEFAULT_SEARCH_COORDINATES.lat,
      lng: DEFAULT_SEARCH_COORDINATES.lng,
      signal,
    }),
  fetchMap: (input, init) => fetch(input, init),
  createAbortSignal: () => AbortSignal.timeout(REQUEST_TIMEOUT_MS),
};

const parseLockerId = (rawLockerId: string): number | null => {
  if (!/^\d+$/.test(rawLockerId)) return null;

  const lockerId = Number(rawLockerId);
  return Number.isSafeInteger(lockerId) && lockerId > 0 ? lockerId : null;
};

const isValidLatitude = (latitude: number | undefined): latitude is number =>
  Number.isFinite(latitude) &&
  latitude !== undefined &&
  latitude >= -90 &&
  latitude <= 90;

const isValidLongitude = (longitude: number | undefined): longitude is number =>
  Number.isFinite(longitude) &&
  longitude !== undefined &&
  longitude >= -180 &&
  longitude <= 180;

const createStaticMapUrl = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): URL => {
  const url = new URL(NAVER_STATIC_MAP_ENDPOINT);
  url.search = new URLSearchParams({
    crs: "EPSG:4326",
    w: "600",
    h: "315",
    center: `${longitude},${latitude}`,
    level: "16",
    maptype: "basic",
    format: "png",
    scale: "2",
    lang: "ko",
    markers: `type:d|size:mid|color:0x3BD569|pos:${longitude} ${latitude}|viewSizeRatio:1.5`,
  }).toString();
  return url;
};

const createFallbackResponse = (requestUrl: string): Response =>
  new Response(null, {
    status: 302,
    headers: {
      Location: new URL(DEFAULT_OG_IMAGE_PATH, requestUrl).toString(),
      "Cache-Control": FALLBACK_CACHE_CONTROL,
    },
  });

export const createLockerOgImageResponse = async ({
  rawLockerId,
  requestUrl,
  dependencies = DEFAULT_DEPENDENCIES,
}: CreateLockerOgImageResponseOptions): Promise<Response> => {
  const lockerId = parseLockerId(rawLockerId);
  const clientId =
    dependencies.env.NAVER_MAP_CLIENT_ID?.trim() ||
    dependencies.env.VITE_NAVER_MAP_CLIENT_ID?.trim();
  const clientSecret = dependencies.env.NAVER_MAP_CLIENT_SECRET?.trim();

  if (lockerId === null || !clientId || !clientSecret) {
    return createFallbackResponse(requestUrl);
  }

  try {
    const detail = await dependencies.getDetail(
      lockerId,
      dependencies.createAbortSignal(),
    );
    const { latitude, longitude } = detail;

    if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
      return createFallbackResponse(requestUrl);
    }

    const mapResponse = await dependencies.fetchMap(
      createStaticMapUrl({ latitude, longitude }),
      {
        headers: {
          "x-ncp-apigw-api-key-id": clientId,
          "x-ncp-apigw-api-key": clientSecret,
        },
        signal: dependencies.createAbortSignal(),
      },
    );
    const contentType = mapResponse.headers.get("Content-Type");

    if (
      !mapResponse.ok ||
      !contentType?.startsWith("image/") ||
      !mapResponse.body
    ) {
      throw new Error(
        `Static Map responded with ${mapResponse.status} ${contentType ?? "without content type"}.`,
      );
    }

    const imageBytes = await mapResponse.arrayBuffer();

    return new Response(imageBytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": SUCCESS_CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error(`Failed to create locker ${lockerId} OG image:`, error);
    return createFallbackResponse(requestUrl);
  }
};
