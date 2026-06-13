import type { MapViewportCoord } from "./map-idle-controller";
import type { LocationPermissionState } from "./useLocationTracking";

export type { MapViewportCoord };

export const DEFAULT_MAP_CENTER = {
  lat: 37.4979,
  lng: 127.0276,
} as const;

export const DEFAULT_MAP_ZOOM = 15;

export const MAP_VIEWPORT_STALE_MS = 30 * 60 * 1000;
export const MAP_VIEWPORT_STALE_DISTANCE_M = 2000;
export const GPS_BOOTSTRAP_WAIT_MS = 3_000;

export type MapBootstrapSource = "deeplink" | "cache" | "gps" | "default";

export interface MapViewportCache {
  center: MapViewportCoord;
  zoom: number;
  savedAt: number;
  /** 캐시 저장 시점의 사용자 GPS. 탭 복귀 시 이동 거리 판정에만 사용한다. */
  gpsAtSave?: MapViewportCoord | null;
}

const EARTH_RADIUS_M = 6_371_000;

export const haversineDistanceM = (
  a: MapViewportCoord,
  b: MapViewportCoord,
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
};

export const isMapViewportCacheStale = (
  cache: MapViewportCache,
  options: {
    now?: number;
    gps?: MapViewportCoord | null;
    permission?: LocationPermissionState;
  } = {},
): boolean => {
  const now = options.now ?? Date.now();
  if (now - cache.savedAt > MAP_VIEWPORT_STALE_MS) {
    return true;
  }

  if (
    options.permission === "granted" &&
    options.gps != null &&
    cache.gpsAtSave != null &&
    haversineDistanceM(cache.gpsAtSave, options.gps) >
      MAP_VIEWPORT_STALE_DISTANCE_M
  ) {
    return true;
  }

  return false;
};

export const hasFreshMapViewportCache = (
  cache: MapViewportCache | null | undefined,
  options: {
    now?: number;
    gps?: MapViewportCoord | null;
    permission?: LocationPermissionState;
  } = {},
): boolean => {
  return (
    cache != null && !isMapViewportCacheStale(cache, { ...options, now: options.now })
  );
};

export interface ShouldWaitForGpsBootstrapInput {
  deepLinkCenter?: MapViewportCoord | null;
  cache?: MapViewportCache | null;
  permission?: LocationPermissionState;
  gps?: MapViewportCoord | null;
  now?: number;
  timedOut?: boolean;
}

/** GPS fix 전 기본 좌표로 지도를 만들지 않도록, cold start 시 짧게 대기한다. */
export const shouldWaitForGpsBootstrap = ({
  deepLinkCenter = null,
  cache = null,
  permission = "prompt",
  gps = null,
  now = Date.now(),
  timedOut = false,
}: ShouldWaitForGpsBootstrapInput): boolean => {
  if (timedOut) return false;
  if (deepLinkCenter != null) return false;
  if (hasFreshMapViewportCache(cache, { now, gps, permission })) return false;
  if (permission !== "granted") return false;
  return gps == null;
};

export interface ResolveMapBootstrapViewportInput {
  deepLinkCenter?: MapViewportCoord | null;
  cache?: MapViewportCache | null;
  permission?: LocationPermissionState;
  gps?: MapViewportCoord | null;
  defaultCenter?: MapViewportCoord;
  defaultZoom?: number;
  now?: number;
}

export interface ResolvedMapBootstrapViewport {
  center: MapViewportCoord;
  zoom: number;
  source: MapBootstrapSource;
}

export const resolveMapBootstrapViewport = ({
  deepLinkCenter = null,
  cache = null,
  permission = "prompt",
  gps = null,
  defaultCenter = DEFAULT_MAP_CENTER,
  defaultZoom = DEFAULT_MAP_ZOOM,
  now = Date.now(),
}: ResolveMapBootstrapViewportInput): ResolvedMapBootstrapViewport => {
  if (deepLinkCenter != null) {
    return {
      center: deepLinkCenter,
      zoom: defaultZoom,
      source: "deeplink",
    };
  }

  const cacheIsFresh = hasFreshMapViewportCache(cache, { now, gps, permission });

  if (cacheIsFresh && cache != null) {
    return {
      center: cache.center,
      zoom: cache.zoom,
      source: "cache",
    };
  }

  if (permission === "granted" && gps != null) {
    return {
      center: gps,
      zoom: defaultZoom,
      source: "gps",
    };
  }

  return {
    center: defaultCenter,
    zoom: defaultZoom,
    source: "default",
  };
};
