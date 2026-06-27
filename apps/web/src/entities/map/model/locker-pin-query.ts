import type { MapViewport } from "./map-idle-controller";

const LOCKER_PIN_COORDINATE_PRECISION = 4;
const SEARCH_BAR_RESERVED_TOP_PX = 68;

export interface LockerPinQueryViewport {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
  zoom: number;
}

const roundCoordinate = (value: number): number =>
  Number(value.toFixed(LOCKER_PIN_COORDINATE_PRECISION));

export const isLockerPinQueryWithinCapacity = (
  query: LockerPinQueryViewport,
): boolean => {
  const latSpan = query.neLat - query.swLat;
  const lngSpan = query.neLng - query.swLng;
  return latSpan > 0 && lngSpan > 0;
};

export const getLockerPinQueryFromViewport = (
  viewport: MapViewport,
): LockerPinQueryViewport => {
  const { northEast, southWest } = viewport.bounds;
  const topInsetRatio =
    viewport.size && viewport.size.height > 0
      ? Math.min(SEARCH_BAR_RESERVED_TOP_PX / viewport.size.height, 0.45)
      : 0;
  const effectiveNeLat =
    northEast.lat - (northEast.lat - southWest.lat) * topInsetRatio;

  return {
    swLat: roundCoordinate(southWest.lat),
    swLng: roundCoordinate(southWest.lng),
    neLat: roundCoordinate(effectiveNeLat),
    neLng: roundCoordinate(northEast.lng),
    zoom: viewport.zoom,
  };
};
