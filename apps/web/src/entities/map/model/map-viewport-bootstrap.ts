import type { LocationPermissionState } from "./useLocationTracking";

export const DEFAULT_MAP_CENTER = {
  lat: 37.4979,
  lng: 127.0276,
} as const;

export const DEFAULT_MAP_ZOOM = 15;

export const MAP_VIEWPORT_STALE_MS = 30 * 60 * 1000;
export const MAP_VIEWPORT_STALE_DISTANCE_M = 2000;

export interface MapViewportCoord {
  lat: number;
  lng: number;
}

export interface MapViewportCache {
  center: MapViewportCoord;
  zoom: number;
  savedAt: number;
  wasCameraCentered: boolean;
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
    haversineDistanceM(cache.center, options.gps) > MAP_VIEWPORT_STALE_DISTANCE_M
  ) {
    return true;
  }

  return false;
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
  restoreCameraCentered: boolean;
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
      restoreCameraCentered: false,
    };
  }

  const cacheIsFresh =
    cache != null &&
    !isMapViewportCacheStale(cache, { now, gps, permission });

  if (cacheIsFresh && cache.wasCameraCentered) {
    if (permission === "granted" && gps != null) {
      return {
        center: gps,
        zoom: cache.zoom,
        restoreCameraCentered: true,
      };
    }

    return {
      center: cache.center,
      zoom: cache.zoom,
      restoreCameraCentered: true,
    };
  }

  if (cacheIsFresh) {
    return {
      center: cache.center,
      zoom: cache.zoom,
      restoreCameraCentered: false,
    };
  }

  if (permission === "granted" && gps != null) {
    return {
      center: gps,
      zoom: defaultZoom,
      restoreCameraCentered: false,
    };
  }

  return {
    center: defaultCenter,
    zoom: defaultZoom,
    restoreCameraCentered: false,
  };
};
