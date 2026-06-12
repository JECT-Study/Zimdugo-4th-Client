import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import { m } from "@repo/i18n";
import { getCurrentMapCoordinates } from "#/entities/map/model/current-location";

export type NavigationPlatform = "kakao" | "google";

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
    };
  } catch (error) {
    return {
      origin: getDefaultNavigationOrigin(),
      permissionDenied: isGeolocationPermissionDenied(error),
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
    label: locker.address?.trim() || locker.title,
  };
};

const formatNavigationCoordinate = (value: number): string =>
  value.toFixed(5);

const buildKakaoRoutePoint = (point: NavigationPoint): string =>
  [
    encodeURIComponent(point.label),
    formatNavigationCoordinate(point.lat),
    formatNavigationCoordinate(point.lng),
  ].join(",");

/** 카카오맵 웹 길찾기 — 모바일·데스크톱 공통 */
const buildKakaoWebLinkUrl = (
  origin: NavigationPoint,
  destination: NavigationPoint,
): string =>
  `https://map.kakao.com/link/from/${buildKakaoRoutePoint(origin)}/to/${buildKakaoRoutePoint(destination)}`;

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

  if (platform === "kakao") {
    return {
      webUrl: buildKakaoWebLinkUrl(navigationOrigin, destination),
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
