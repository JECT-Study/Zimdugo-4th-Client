import type { LockerBoundsRaw } from "#/shared/api/lockers";

export const SEARCH_MAP_TOP_PADDING_PX = 136;
export const MIN_FIT_BOUNDS_RADIUS_METERS = 250;

const METERS_PER_LATITUDE_DEGREE = 111_320;

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
  const minLngDelta =
    minRadiusMeters / getLongitudeMetersPerDegree(centerLat);
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
