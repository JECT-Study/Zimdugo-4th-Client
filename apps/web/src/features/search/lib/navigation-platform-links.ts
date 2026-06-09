import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import { getCurrentMapCoordinates } from "#/entities/map/model/current-location";

export type NavigationPlatform = "naver" | "google";

export type NavigationPoint = {
  lat: number;
  lng: number;
  label: string;
};

export type NavigationPlatformLinks = {
  appUrl: string;
  webUrl: string;
};

/** 위치 미동의·미수신 시 길찾기 출발지 폴백 */
export const DEFAULT_NAVIGATION_ORIGIN: NavigationPoint = {
  lat: 37.498095,
  lng: 127.02761,
  label: "강남역 11번 출구",
};

const NAVER_MAP_ANDROID_PACKAGE = "com.nhn.android.nmap";
const DEFAULT_WEB_ORIGIN = "https://zimdugo.com";
const APP_FALLBACK_DELAY_MS = 1500;

/** 길찾기 출발지 결정용 GPS 옵션 (모바일 콜드 스타트 고려) */
export const NAVIGATION_ORIGIN_POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 60_000,
  timeout: 5_000,
};

const isAndroidUserAgent = (userAgent: string): boolean =>
  /Android/i.test(userAgent);

const isMobileUserAgent = (userAgent: string): boolean =>
  /Android|iPhone|iPad|iPod/i.test(userAgent);

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
        label: "현재 위치",
      }
    : DEFAULT_NAVIGATION_ORIGIN;

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
      origin: DEFAULT_NAVIGATION_ORIGIN,
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

const resolveWebOrigin = (webOrigin?: string): string => {
  if (webOrigin) {
    return webOrigin;
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return DEFAULT_WEB_ORIGIN;
};

const NAVER_WEB_COORDINATE_SCALE = 20037508.342789244;
const NAVER_WEB_LATITUDE_LIMIT = 85.05112878;

const formatNavigationCoordinate = (value: number): string =>
  value.toFixed(7);

/** 네이버 지도 웹 길찾기 URL은 WGS84가 아닌 EPSG:3857 좌표를 사용한다. */
export const wgs84ToEpsg3857 = (
  lat: number,
  lng: number,
): { x: number; y: number } => {
  const clampedLat = Math.max(
    Math.min(lat, NAVER_WEB_LATITUDE_LIMIT),
    -NAVER_WEB_LATITUDE_LIMIT,
  );
  const x = (lng * NAVER_WEB_COORDINATE_SCALE) / 180;
  const y =
    (Math.log(Math.tan(((90 + clampedLat) * Math.PI) / 360)) *
      NAVER_WEB_COORDINATE_SCALE) /
    Math.PI;

  return { x, y };
};

const buildNaverRouteQuery = (
  origin: NavigationPoint,
  destination: NavigationPoint,
  appName: string,
): string =>
  [
    `slat=${formatNavigationCoordinate(origin.lat)}`,
    `slng=${formatNavigationCoordinate(origin.lng)}`,
    `sname=${encodeURIComponent(origin.label)}`,
    `dlat=${formatNavigationCoordinate(destination.lat)}`,
    `dlng=${formatNavigationCoordinate(destination.lng)}`,
    `dname=${encodeURIComponent(destination.label)}`,
    `appname=${encodeURIComponent(appName)}`,
  ].join("&");

const buildNaverAppPath = (
  origin: NavigationPoint,
  destination: NavigationPoint,
  appName: string,
): string => `route/public?${buildNaverRouteQuery(origin, destination, appName)}`;

const buildNaverAppUrl = (appPath: string): string => `nmap://${appPath}`;

const buildNaverAndroidIntentUrl = (
  appPath: string,
  webUrl: string,
): string => {
  const fallback = encodeURIComponent(webUrl);
  return `intent://${appPath}#Intent;scheme=nmap;package=${NAVER_MAP_ANDROID_PACKAGE};S.browser_fallback_url=${fallback};end`;
};

const buildNaverWebDirectionsSegment = (point: NavigationPoint): string => {
  const { x, y } = wgs84ToEpsg3857(point.lat, point.lng);

  return [String(x), String(y), encodeURIComponent(point.label), "", "ADDRESS"].join(
    ",",
  );
};

const buildNaverWebUrl = (
  origin: NavigationPoint,
  destination: NavigationPoint,
): string =>
  `https://map.naver.com/p/directions/${buildNaverWebDirectionsSegment(origin)}/${buildNaverWebDirectionsSegment(destination)}/-/transit`;

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
  const webOrigin = resolveWebOrigin(options.webOrigin);
  const userAgent =
    options.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "");
  const webUrl =
    platform === "naver"
      ? buildNaverWebUrl(navigationOrigin, destination)
      : buildGoogleWebUrl(navigationOrigin, destination);

  if (platform === "google") {
    return { appUrl: webUrl, webUrl };
  }

  const appPath = buildNaverAppPath(navigationOrigin, destination, webOrigin);
  const appUrl = isAndroidUserAgent(userAgent)
    ? buildNaverAndroidIntentUrl(appPath, webUrl)
    : buildNaverAppUrl(appPath);

  return { appUrl, webUrl };
};

export const getNavigationPlatformUrl = (
  platform: NavigationPlatform,
  locker: LockerDetailItem,
  options: NavigationPlatformLinkOptions,
): string | null =>
  getNavigationPlatformLinks(platform, locker, options)?.webUrl ?? null;

type OpenNavigationOptions = {
  platform: NavigationPlatform;
  userAgent?: string;
  assign?: (url: string) => void;
  setTimeoutFn?: typeof setTimeout;
  clearTimeoutFn?: typeof clearTimeout;
  isDocumentHidden?: () => boolean;
  addVisibilityListener?: (
    listener: () => void,
  ) => (() => void) | undefined;
};

export const openNavigationPlatformLinks = (
  links: NavigationPlatformLinks,
  options: OpenNavigationOptions,
): void => {
  const assign =
    options.assign ??
    ((url: string) => {
      window.location.href = url;
    });
  const userAgent =
    options.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "");

  if (options.platform === "google" || !isMobileUserAgent(userAgent)) {
    assign(links.webUrl);
    return;
  }

  if (isAndroidUserAgent(userAgent)) {
    assign(links.appUrl);
    return;
  }

  const setTimeoutFn =
    options.setTimeoutFn ??
    (typeof window !== "undefined"
      ? window.setTimeout.bind(window)
      : setTimeout);
  const clearTimeoutFn =
    options.clearTimeoutFn ??
    (typeof window !== "undefined"
      ? window.clearTimeout.bind(window)
      : clearTimeout);

  let didHide = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const isDocumentHidden =
    options.isDocumentHidden ??
    (() =>
      typeof document !== "undefined" && document.visibilityState === "hidden");

  let removeVisibilityListener = () => undefined;

  const handleVisibilityChange = () => {
    if (!isDocumentHidden()) {
      return;
    }

    didHide = true;
    if (timeoutId !== undefined) {
      clearTimeoutFn(timeoutId);
    }
    removeVisibilityListener();
  };

  const defaultRemoveVisibilityListener = () => {
    if (typeof document === "undefined") {
      return;
    }

    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };

  const customRemoveVisibilityListener =
    options.addVisibilityListener?.(handleVisibilityChange);
  removeVisibilityListener =
    customRemoveVisibilityListener ?? defaultRemoveVisibilityListener;

  if (!options.addVisibilityListener && typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  assign(links.appUrl);

  timeoutId = setTimeoutFn(() => {
    removeVisibilityListener();
    if (!didHide) {
      assign(links.webUrl);
    }
  }, APP_FALLBACK_DELAY_MS);
};
