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
  appUrl: string;
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

const buildKakaoAppUrl = (
  origin: NavigationPoint,
  destination: NavigationPoint,
): string => {
  const params = new URLSearchParams({
    sp: `${formatNavigationCoordinate(origin.lat)},${formatNavigationCoordinate(origin.lng)}`,
    ep: `${formatNavigationCoordinate(destination.lat)},${formatNavigationCoordinate(destination.lng)}`,
  });

  return `http://m.map.kakao.com/scheme/route?${params.toString()}`;
};

const buildKakaoWebUrl = (
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
  userAgent?: string;
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
      appUrl: buildKakaoAppUrl(navigationOrigin, destination),
      webUrl: buildKakaoWebUrl(navigationOrigin, destination),
    };
  }

  const webUrl = buildGoogleWebUrl(navigationOrigin, destination);
  return { appUrl: webUrl, webUrl };
};

export const getNavigationPlatformUrl = (
  platform: NavigationPlatform,
  locker: LockerDetailItem,
  options: NavigationPlatformLinkOptions,
): string | null =>
  getNavigationPlatformLinks(platform, locker, options)?.webUrl ?? null;

const APP_DEEP_LINK_FALLBACK_MS = 1_500;

const isMobileUserAgent = (userAgent?: string): boolean => {
  const ua =
    userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "");

  return /Android|iPhone|iPad|iPod/i.test(ua);
};

type OpenNavigationOptions = {
  assign?: (url: string) => void;
  userAgent?: string;
};

/**
 * 모바일에서는 앱 딥링크를 먼저 시도하고, 앱 미설치 시 웹 지도 URL로 폴백한다.
 * scheme/route 페이지를 웹 URL로 직접 열면 앱 설치 안내가 뜨기 때문에 webUrl은 map.kakao.com/link를 사용한다.
 */
export const openNavigationPlatformLinks = (
  links: NavigationPlatformLinks,
  options: OpenNavigationOptions = {},
): void => {
  const assign =
    options.assign ??
    ((url: string) => {
      window.location.href = url;
    });

  const shouldTryAppDeepLink =
    links.appUrl !== links.webUrl && isMobileUserAgent(options.userAgent);

  if (!shouldTryAppDeepLink) {
    assign(links.webUrl);
    return;
  }

  const timerId = window.setTimeout(() => {
    assign(links.webUrl);
  }, APP_DEEP_LINK_FALLBACK_MS);

  const clearFallback = () => {
    window.clearTimeout(timerId);
  };

  window.addEventListener("pagehide", clearFallback, { once: true });
  window.addEventListener("blur", clearFallback, { once: true });

  assign(links.appUrl);
};
