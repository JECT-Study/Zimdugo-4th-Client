import { DEFAULT_SEARCH_COORDINATES } from "#/features/search/model/useMapSheetSession";
import { getLockerDetail } from "#/shared/api/lockers";
import { SITE_ORIGIN } from "#/shared/lib/site-url";

const NAVER_STATIC_MAP_ENDPOINT =
  "https://maps.apigw.ntruss.com/map-static/v2/raster";
/*
 * 커스텀 마커 아이콘은 64×64px 이하여야 한다. 넘으면 Static Map 이 이미지 대신 빈 403 을
 * 준다. 문서는 `scale=2` 면 128×128 까지 된다고 하지만 실제로는 scale 과 무관하게 64px 을
 * 넘으면 거절한다(2026-11 확인: 60·64px 200, 76·96·114·128px 403).
 *
 * 마커는 scale=2 지도 위에 픽셀 그대로 찍혀서, 1200×630 이미지에서 64px 로 보인다.
 * Static Map 은 같은 아이콘 주소를 하루까지 캐시하므로 그림을 바꾸면 파일 이름도 바꾼다.
 */
const NAVER_STATIC_MAP_MARKER_URL = `${SITE_ORIGIN}/icons/map-marker-64x64.png`;
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
    markers: `type:e|anchor:center|icon:${NAVER_STATIC_MAP_MARKER_URL}|pos:${longitude} ${latitude}`,
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
