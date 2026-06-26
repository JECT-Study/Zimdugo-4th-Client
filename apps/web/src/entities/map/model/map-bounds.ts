import type { LockerBoundsRaw } from "#/shared/api/lockers";

export const SEARCH_MAP_TOP_PADDING_PX = 136;
export const CLUSTER_FIT_BOUNDS_TOP_PADDING_PX = 144;
export const CLUSTER_FIT_BOUNDS_HORIZONTAL_PADDING_PX = 56;
export const CLUSTER_FIT_BOUNDS_BOTTOM_PADDING_PX = 144;
export const MIN_FIT_BOUNDS_RADIUS_METERS = 250;
export const MIN_CLUSTER_FIT_BOUNDS_RADIUS_METERS = 500;

const METERS_PER_LATITUDE_DEGREE = 111_320;
const WEB_MERCATOR_TILE_SIZE_PX = 256;
const MAX_MERCATOR_LATITUDE = 85.05112878;

export interface FitNaverMapBoundsOptions {
  map: naver.maps.Map | null | undefined;
  bounds: LockerBoundsRaw | null | undefined;
  maps?: typeof naver.maps | null;
  minRadiusMeters?: number;
  topPadding?: number;
  rightPadding?: number;
  bottomPadding?: number;
  leftPadding?: number;
}

export interface FocusNaverMapClusterBoundsOptions {
  map: naver.maps.Map | null | undefined;
  bounds: LockerBoundsRaw | null | undefined;
  maps?: typeof naver.maps | null;
  minZoom?: number;
  maxZoom?: number;
  minZoomStep?: number;
  maxZoomStep?: number;
  minRadiusMeters?: number;
  topPadding?: number;
  rightPadding?: number;
  bottomPadding?: number;
  leftPadding?: number;
  duration?: number;
}

const getLongitudeMetersPerDegree = (latitude: number) =>
  Math.max(
    METERS_PER_LATITUDE_DEGREE * Math.cos((latitude * Math.PI) / 180),
    1,
  );

export const normalizeLockerBounds = (
  bounds: LockerBoundsRaw,
  minRadiusMeters = MIN_FIT_BOUNDS_RADIUS_METERS,
): LockerBoundsRaw => {
  const swLat = Math.min(bounds.swLat, bounds.neLat);
  const neLat = Math.max(bounds.swLat, bounds.neLat);
  const swLng = Math.min(bounds.swLng, bounds.neLng);
  const neLng = Math.max(bounds.swLng, bounds.neLng);
  const centerLat = (swLat + neLat) / 2;
  const centerLng = (swLng + neLng) / 2;
  const minLatDelta = minRadiusMeters / METERS_PER_LATITUDE_DEGREE;
  const minLngDelta = minRadiusMeters / getLongitudeMetersPerDegree(centerLat);
  const latDelta = Math.max((neLat - swLat) / 2, minLatDelta);
  const lngDelta = Math.max((neLng - swLng) / 2, minLngDelta);

  return {
    swLat: centerLat - latDelta,
    swLng: centerLng - lngDelta,
    neLat: centerLat + latDelta,
    neLng: centerLng + lngDelta,
  };
};

export const fitNaverMapToBounds = ({
  map,
  bounds,
  maps = typeof window !== "undefined" ? window.naver?.maps : null,
  minRadiusMeters = MIN_FIT_BOUNDS_RADIUS_METERS,
  topPadding = SEARCH_MAP_TOP_PADDING_PX,
  rightPadding = 48,
  bottomPadding = 120,
  leftPadding = 48,
}: FitNaverMapBoundsOptions): boolean => {
  if (!map || !bounds || !maps?.LatLng || !maps.LatLngBounds) {
    return false;
  }

  const normalizedBounds = normalizeLockerBounds(bounds, minRadiusMeters);
  const sw = new maps.LatLng(normalizedBounds.swLat, normalizedBounds.swLng);
  const ne = new maps.LatLng(normalizedBounds.neLat, normalizedBounds.neLng);
  const latLngBounds = new maps.LatLngBounds(sw, ne);

  if (typeof map.fitBounds === "function") {
    map.fitBounds(latLngBounds, {
      top: topPadding,
      right: rightPadding,
      bottom: bottomPadding,
      left: leftPadding,
    });
    return true;
  }

  return false;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getMercatorY = (latitude: number): number => {
  const clampedLatitude = clamp(
    latitude,
    -MAX_MERCATOR_LATITUDE,
    MAX_MERCATOR_LATITUDE,
  );
  const sin = Math.sin((clampedLatitude * Math.PI) / 180);
  return 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI);
};

const getMercatorX = (longitude: number): number => (longitude + 180) / 360;

export const getFitBoundsZoom = ({
  bounds,
  mapSize,
  topPadding = SEARCH_MAP_TOP_PADDING_PX,
  rightPadding = 48,
  bottomPadding = 120,
  leftPadding = 48,
}: {
  bounds: LockerBoundsRaw;
  mapSize: { width: number; height: number };
  topPadding?: number;
  rightPadding?: number;
  bottomPadding?: number;
  leftPadding?: number;
}): number => {
  const swLat = Math.min(bounds.swLat, bounds.neLat);
  const neLat = Math.max(bounds.swLat, bounds.neLat);
  const swLng = Math.min(bounds.swLng, bounds.neLng);
  const neLng = Math.max(bounds.swLng, bounds.neLng);
  const latSpan = Math.abs(getMercatorY(swLat) - getMercatorY(neLat));
  const lngSpan = Math.abs(getMercatorX(neLng) - getMercatorX(swLng));
  const availableWidth = Math.max(
    mapSize.width - leftPadding - rightPadding,
    1,
  );
  const availableHeight = Math.max(
    mapSize.height - topPadding - bottomPadding,
    1,
  );
  const lngZoom =
    lngSpan > 0
      ? Math.log2(availableWidth / (WEB_MERCATOR_TILE_SIZE_PX * lngSpan))
      : Number.POSITIVE_INFINITY;
  const latZoom =
    latSpan > 0
      ? Math.log2(availableHeight / (WEB_MERCATOR_TILE_SIZE_PX * latSpan))
      : Number.POSITIVE_INFINITY;
  const fitZoom = Math.floor(Math.min(lngZoom, latZoom));

  return Number.isFinite(fitZoom) ? fitZoom : 0;
};

export const focusNaverMapOnClusterBounds = ({
  map,
  bounds,
  maps = typeof window !== "undefined" ? window.naver?.maps : null,
  minZoom,
  maxZoom = 16,
  minZoomStep = 2,
  maxZoomStep = 4,
  minRadiusMeters = MIN_CLUSTER_FIT_BOUNDS_RADIUS_METERS,
  topPadding = CLUSTER_FIT_BOUNDS_TOP_PADDING_PX,
  rightPadding = CLUSTER_FIT_BOUNDS_HORIZONTAL_PADDING_PX,
  bottomPadding = CLUSTER_FIT_BOUNDS_BOTTOM_PADDING_PX,
  leftPadding = CLUSTER_FIT_BOUNDS_HORIZONTAL_PADDING_PX,
  duration = 800,
}: FocusNaverMapClusterBoundsOptions): boolean => {
  if (!map || !bounds || !maps?.LatLng) {
    return false;
  }

  const normalizedBounds = normalizeLockerBounds(bounds, minRadiusMeters);
  const centerLat = (normalizedBounds.swLat + normalizedBounds.neLat) / 2;
  const centerLng = (normalizedBounds.swLng + normalizedBounds.neLng) / 2;
  const currentZoom = map.getZoom?.() ?? 0;
  const mapSize = map.getSize?.();
  const minimumZoom = minZoom ?? Math.min(currentZoom + minZoomStep, maxZoom);
  const maximumZoom = Math.min(currentZoom + maxZoomStep, maxZoom);
  const fitZoom = mapSize
    ? getFitBoundsZoom({
        bounds: normalizedBounds,
        mapSize,
        topPadding,
        rightPadding,
        bottomPadding,
        leftPadding,
      })
    : minimumZoom;
  const targetZoom = clamp(fitZoom, minimumZoom, maximumZoom);
  const targetLatLng = new maps.LatLng(centerLat, centerLng);

  if (typeof map.morph === "function") {
    map.morph(targetLatLng, targetZoom, {
      duration,
      easing: "easeOutCubic",
    });
    return true;
  }

  if (
    typeof map.setCenter === "function" &&
    typeof map.setZoom === "function"
  ) {
    map.setCenter(targetLatLng);
    map.setZoom(targetZoom);
    return true;
  }

  return false;
};

export const focusNaverMapOnBoundsCenter = focusNaverMapOnClusterBounds;
