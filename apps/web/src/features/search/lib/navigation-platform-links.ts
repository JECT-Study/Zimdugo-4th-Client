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
    label: locker.title,
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

const buildNaverAppName = (webOrigin: string): string =>
  encodeURIComponent(webOrigin);

const buildNaverAppPath = (
  origin: NavigationPoint,
  destination: NavigationPoint,
  appName: string,
): string =>
  [
    "route/public",
    `slat=${origin.lat}`,
    `slng=${origin.lng}`,
    `sname=${encodeURIComponent(origin.label)}`,
    `dlat=${destination.lat}`,
    `dlng=${destination.lng}`,
    `dname=${encodeURIComponent(destination.label)}`,
    `appname=${appName}`,
  ].join("?");

const buildNaverAppUrl = (appPath: string): string => `nmap://${appPath}`;

const buildNaverAndroidIntentUrl = (
  appPath: string,
  webUrl: string,
): string => {
  const fallback = encodeURIComponent(webUrl);
  return `intent://${appPath}#Intent;scheme=nmap;package=${NAVER_MAP_ANDROID_PACKAGE};S.browser_fallback_url=${fallback};end`;
};

const buildNaverMobileWebUrl = (
  origin: NavigationPoint,
  destination: NavigationPoint,
): string => {
  const params = new URLSearchParams({
    menu: "route",
    sname: origin.label,
    sx: String(origin.lng),
    sy: String(origin.lat),
    ename: destination.label,
    ex: String(destination.lng),
    ey: String(destination.lat),
    pathType: "0",
    showMap: "true",
  });

  return `https://m.map.naver.com/route.nhn?${params.toString()}`;
};

const buildNaverDesktopWebUrl = (
  origin: NavigationPoint,
  destination: NavigationPoint,
): string => {
  const params = new URLSearchParams({
    slng: String(origin.lng),
    slat: String(origin.lat),
    stext: origin.label,
    elng: String(destination.lng),
    elat: String(destination.lat),
    etext: destination.label,
    menu: "route",
    pathType: "1",
  });

  return `https://map.naver.com/index.nhn?${params.toString()}`;
};

const buildNaverWebUrl = (
  origin: NavigationPoint,
  destination: NavigationPoint,
  userAgent: string,
): string =>
  isMobileUserAgent(userAgent)
    ? buildNaverMobileWebUrl(origin, destination)
    : buildNaverDesktopWebUrl(origin, destination);

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
      ? buildNaverWebUrl(navigationOrigin, destination, userAgent)
      : buildGoogleWebUrl(navigationOrigin, destination);

  if (platform === "google") {
    return { appUrl: webUrl, webUrl };
  }

  const appPath = buildNaverAppPath(
    navigationOrigin,
    destination,
    buildNaverAppName(webOrigin),
  );
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
  ) => (() => void) | void;
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

  removeVisibilityListener =
    options.addVisibilityListener?.(handleVisibilityChange) ??
    (() => {
      if (typeof document === "undefined") {
        return;
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });

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
