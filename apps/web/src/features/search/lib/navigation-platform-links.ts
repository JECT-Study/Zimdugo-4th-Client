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
  /** 앱 직접 호출용 (카카오: kakaomap://) */
  appUrl: string;
  /** 데스크톱·최종 폴백 웹 URL */
  webUrl: string;
  /** 모바일웹 스킴 폴백 (카카오: m.map.kakao.com/scheme/route) */
  mobileWebUrl?: string;
  /** Android intent 폴백 (kakaomap:// + browser_fallback_url) */
  androidIntentUrl?: string;
};

const KAKAO_MAP_ANDROID_PACKAGE = "net.daum.android.map";
const KAKAO_ROUTE_TRAVEL_MODE = "publictransit";
const APP_DEEP_LINK_FALLBACK_MS = 1_500;

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

const formatKakaoRouteCoordinatePair = (point: NavigationPoint): string =>
  `${formatNavigationCoordinate(point.lat)},${formatNavigationCoordinate(point.lng)}`;

const buildKakaoRouteSearchParams = (
  origin: NavigationPoint,
  destination: NavigationPoint,
): URLSearchParams =>
  new URLSearchParams({
    sp: formatKakaoRouteCoordinatePair(origin),
    ep: formatKakaoRouteCoordinatePair(destination),
    by: KAKAO_ROUTE_TRAVEL_MODE,
  });

const buildKakaoRoutePoint = (point: NavigationPoint): string =>
  [
    encodeURIComponent(point.label),
    formatNavigationCoordinate(point.lat),
    formatNavigationCoordinate(point.lng),
  ].join(",");

/** 데스크톱·라벨 포함 웹 길찾기 */
const buildKakaoWebLinkUrl = (
  origin: NavigationPoint,
  destination: NavigationPoint,
): string =>
  `https://map.kakao.com/link/from/${buildKakaoRoutePoint(origin)}/to/${buildKakaoRoutePoint(destination)}`;

/** 카카오 공식 앱 스킴 — kakaomap://route */
const buildKakaoAppSchemeUrl = (routeParams: URLSearchParams): string =>
  `kakaomap://route?${routeParams.toString()}`;

/** 카카오 공식 모바일웹 스킴 — m.map.kakao.com/scheme/route */
const buildKakaoMobileWebSchemeUrl = (routeParams: URLSearchParams): string =>
  `https://m.map.kakao.com/scheme/route?${routeParams.toString()}`;

const buildKakaoAndroidIntentUrl = (
  routeParams: URLSearchParams,
  fallbackUrl: string,
): string => {
  const encodedFallback = encodeURIComponent(fallbackUrl);

  return `intent://route?${routeParams.toString()}#Intent;scheme=kakaomap;package=${KAKAO_MAP_ANDROID_PACKAGE};S.browser_fallback_url=${encodedFallback};end`;
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
    const routeParams = buildKakaoRouteSearchParams(
      navigationOrigin,
      destination,
    );
    const mobileWebUrl = buildKakaoMobileWebSchemeUrl(routeParams);
    const webUrl = buildKakaoWebLinkUrl(navigationOrigin, destination);

    return {
      appUrl: buildKakaoAppSchemeUrl(routeParams),
      mobileWebUrl,
      androidIntentUrl: buildKakaoAndroidIntentUrl(routeParams, mobileWebUrl),
      webUrl,
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

const getDefaultUserAgent = (): string =>
  typeof navigator !== "undefined" ? navigator.userAgent : "";

const isMobileUserAgent = (userAgent: string): boolean =>
  /Android|iPhone|iPad|iPod/i.test(userAgent);

const isAndroidUserAgent = (userAgent: string): boolean =>
  /Android/i.test(userAgent);

type OpenNavigationOptions = {
  assign?: (url: string) => void;
  userAgent?: string;
};

/**
 * 모바일: kakaomap://(Android는 intent) → m.map.kakao.com/scheme/route 폴백.
 * 데스크톱: map.kakao.com/link.
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
  const userAgent = options.userAgent ?? getDefaultUserAgent();
  const mobileFallbackUrl = links.mobileWebUrl ?? links.webUrl;
  const shouldTryKakaoDeepLink =
    links.appUrl.startsWith("kakaomap://") &&
    isMobileUserAgent(userAgent) &&
    Boolean(links.mobileWebUrl);

  if (!shouldTryKakaoDeepLink) {
    assign(links.webUrl);
    return;
  }

  const deepLinkUrl =
    isAndroidUserAgent(userAgent) && links.androidIntentUrl
      ? links.androidIntentUrl
      : links.appUrl;

  const timerId = window.setTimeout(() => {
    assign(mobileFallbackUrl);
  }, APP_DEEP_LINK_FALLBACK_MS);

  const clearFallback = () => {
    window.clearTimeout(timerId);
  };

  window.addEventListener("pagehide", clearFallback, { once: true });
  window.addEventListener("blur", clearFallback, { once: true });

  assign(deepLinkUrl);
};
