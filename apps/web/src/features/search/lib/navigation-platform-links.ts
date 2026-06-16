import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import { m } from "@repo/i18n";
import { getCurrentMapCoordinates } from "#/entities/map/model/current-location";

export type NavigationPlatform = "naver" | "google";

export type NavigationPoint = {
  lat: number;
  lng: number;
  label: string;
};

export type NavigationPlatformLinks = {
  webUrl: string;
};

/** 위치 미동의·미수신 시 길찾기 출발지 폴백 (좌표 고정, 라벨은 i18n) */
export const getDefaultNavigationOrigin = (): NavigationPoint => ({
  lat: 37.498095,
  lng: 127.02761,
  label: m.navigation_default_origin(),
});

/** @deprecated 테스트 고정값용. 런타임에는 getDefaultNavigationOrigin() 사용 */
export const DEFAULT_NAVIGATION_ORIGIN: NavigationPoint = {
  lat: 37.498095,
  lng: 127.02761,
  label: "강남역 11번 출구",
};

/** 길찾기 출발지 결정용 GPS 옵션 (모바일 콜드 스타트 고려) */
export const NAVIGATION_ORIGIN_POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 60_000,
  timeout: 5_000,
};

export const hasNavigationDestination = (
  locker: LockerDetailItem,
): locker is LockerDetailItem & { latitude: number; longitude: number } =>
  locker.latitude !== undefined &&
  locker.longitude !== undefined &&
  Number.isFinite(locker.latitude) &&
  Number.isFinite(locker.longitude);

export const resolveNavigationOrigin = (
  location: { lat: number; lng: number } | null | undefined,
): NavigationPoint =>
  location
    ? {
        lat: location.lat,
        lng: location.lng,
        label: m.navigation_current_location(),
      }
    : getDefaultNavigationOrigin();

export type ResolveNavigationOriginResult = {
  origin: NavigationPoint;
  permissionDenied: boolean;
  usedCurrentLocation: boolean;
};

const isGeolocationPermissionDenied = (error: unknown): boolean => {
  if (
    typeof GeolocationPositionError !== "undefined" &&
    error instanceof GeolocationPositionError
  ) {
    return error.code === error.PERMISSION_DENIED;
  }

  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as GeolocationPositionError).code === 1
  );
};

type ResolveNavigationOriginOptions = {
  knownLocation?: { lat: number; lng: number } | null;
  getCurrentCoordinates?: (
    positionOptions?: PositionOptions,
  ) => Promise<{ lat: number; lng: number }>;
  positionOptions?: PositionOptions;
};

/** 길찾기 직전에 위치 권한을 한 번 더 요청하고 출발지를 결정한다. */
export const resolveNavigationOriginWithPermissionRequest = async (
  options?: ResolveNavigationOriginOptions,
): Promise<ResolveNavigationOriginResult> => {
  if (options?.knownLocation) {
    return {
      origin: resolveNavigationOrigin(options.knownLocation),
      permissionDenied: false,
      usedCurrentLocation: true,
    };
  }

  const getCurrentCoordinates =
    options?.getCurrentCoordinates ?? getCurrentMapCoordinates;
  const positionOptions =
    options?.positionOptions ?? NAVIGATION_ORIGIN_POSITION_OPTIONS;

  try {
    const coordinates = await getCurrentCoordinates(positionOptions);
    return {
      origin: resolveNavigationOrigin(coordinates),
      permissionDenied: false,
      usedCurrentLocation: true,
    };
  } catch (error) {
    return {
      origin: getDefaultNavigationOrigin(),
      permissionDenied: isGeolocationPermissionDenied(error),
      usedCurrentLocation: false,
    };
  }
};

export const getLockerNavigationDestination = (
  locker: LockerDetailItem,
): NavigationPoint | null => {
  if (!hasNavigationDestination(locker)) {
    return null;
  }

  return {
    lat: locker.latitude,
    lng: locker.longitude,
    label: locker.title?.trim() || locker.address,
  };
};

const NAVER_COORD_PRECISION = 7;
const NAVER_COORD_SCALE = 10 ** NAVER_COORD_PRECISION;
const NAVER_COORD_OFFSET = 200 * NAVER_COORD_SCALE;
const NAVER_BASE62_ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const toNaverBase62 = (value: number): string => {
  if (value === 0) {
    return NAVER_BASE62_ALPHABET[0];
  }

  let remaining = value;
  let encoded = "";

  while (remaining > 0) {
    encoded = NAVER_BASE62_ALPHABET[remaining % 62] + encoded;
    remaining = Math.floor(remaining / 62);
  }

  return encoded;
};

/** WGS84 경위도를 네이버 웹 지도 길찾기 URL용 단축 좌표 문자열로 변환한다. */
export const encodeNaverCoordinate = (coordinate: number): string => {
  const scaled = Math.round(coordinate * NAVER_COORD_SCALE) + NAVER_COORD_OFFSET;
  return toNaverBase62(scaled);
};

/** 길찾기 path 세그먼트 구분자(`,`)를 깨는 문자를 정리한다. */
export const sanitizeNaverNavigationLabel = (label: string): string =>
  label
    .trim()
    .replace(/[[\]]/g, "")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildNaverRoutePath = (point: NavigationPoint): string =>
  [
    encodeNaverCoordinate(point.lng),
    encodeNaverCoordinate(point.lat),
    encodeURIComponent(sanitizeNaverNavigationLabel(point.label)),
    "",
    "ADDRESS_POI",
  ].join(",");

/**
 * 네이버맵 웹 길찾기 URL을 생성한다.
 *
 * NOTE: 아래 URL 형식은 네이버에서 공식 문서로 제공하는 URL Scheme(`nmap://` 등)이 아니라,
 * 웹 지도 주소창에서 관찰된 비공식 패턴을 따른다. 네이버 측 UI/URL 구조 변경 시
 * 동작이 깨지거나 추후 수정이 필요할 수 있다. PC 환경에서는 특히 불안정하거나
 * 기대한 길찾기 화면이 열리지 않는 경우가 있다.
 */
const buildNaverWebDirectionsUrl = (
  origin: NavigationPoint,
  destination: NavigationPoint,
): string => {
  const startPath = buildNaverRoutePath(origin);
  const destinationPath = buildNaverRoutePath(destination);

  return `https://map.naver.com/p/directions/${startPath}/${destinationPath}/-`;
};

const buildGoogleWebUrl = (
  origin: NavigationPoint,
  destination: NavigationPoint,
): string => {
  const params = new URLSearchParams({
    api: "1",
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: "transit",
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

export type NavigationPlatformLinkOptions = {
  navigationOrigin: NavigationPoint;
  webOrigin?: string;
};

export const getNavigationPlatformLinks = (
  platform: NavigationPlatform,
  locker: LockerDetailItem,
  options: NavigationPlatformLinkOptions,
): NavigationPlatformLinks | null => {
  const destination = getLockerNavigationDestination(locker);
  if (!destination) {
    return null;
  }

  const { navigationOrigin } = options;

  if (platform === "naver") {
    return {
      webUrl: buildNaverWebDirectionsUrl(navigationOrigin, destination),
    };
  }

  return {
    webUrl: buildGoogleWebUrl(navigationOrigin, destination),
  };
};

export const getNavigationPlatformUrl = (
  platform: NavigationPlatform,
  locker: LockerDetailItem,
  options: NavigationPlatformLinkOptions,
): string | null =>
  getNavigationPlatformLinks(platform, locker, options)?.webUrl ?? null;

type OpenNavigationOptions = {
  assign?: (url: string) => void;
};

/** 모바일·데스크톱 모두 웹 길찾기 URL로 이동한다. */
export const openNavigationPlatformLinks = (
  links: NavigationPlatformLinks,
  options: OpenNavigationOptions = {},
): void => {
  const assign =
    options.assign ??
    ((url: string) => {
      window.location.href = url;
    });

  assign(links.webUrl);
};
