import { getRadiusFromZoom } from "#/shared/api/lockers";
import type { MapViewport } from "./map-idle-controller";

const EARTH_RADIUS_METERS = 6_371_000;
const LOCKER_PIN_COORDINATE_PRECISION = 4;
const LOCKER_PIN_RADIUS_BUCKET_METERS = 50;
export const MAX_LOCKER_PIN_RADIUS_METERS = 10_000;
const SEARCH_BAR_RESERVED_TOP_PX = 136;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const roundCoordinate = (value: number): number =>
  Number(value.toFixed(LOCKER_PIN_COORDINATE_PRECISION));

const roundRadius = (value: number): number =>
  Math.min(
    Math.ceil(value / LOCKER_PIN_RADIUS_BUCKET_METERS) *
      LOCKER_PIN_RADIUS_BUCKET_METERS,
    MAX_LOCKER_PIN_RADIUS_METERS,
  );

const getDistanceMeters = (
  from: MapViewport["center"],
  to: MapViewport["center"],
): number => {
  const latDelta = toRadians(to.lat - from.lat);
  const lngDelta = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const haversine = Math.min(
    1,
    Math.max(
      0,
      Math.sin(latDelta / 2) ** 2 +
        Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) ** 2,
    ),
  );

  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
};

export interface LockerPinQueryViewport {
  lat: number;
  lng: number;
  radius: number;
}

export const getLockerPinQueryFromViewport = (
  viewport: MapViewport,
): LockerPinQueryViewport => {
  const fallbackRadius = getRadiusFromZoom(viewport.zoom);
  const { northEast, southWest } = viewport.bounds;
  const topInsetRatio =
    viewport.size && viewport.size.height > 0
      ? Math.min(SEARCH_BAR_RESERVED_TOP_PX / viewport.size.height, 0.45)
      : 0;
  const effectiveNorthEast = {
    lat: northEast.lat - (northEast.lat - southWest.lat) * topInsetRatio,
    lng: northEast.lng,
  };
  const queryCenter = {
    lat: (effectiveNorthEast.lat + southWest.lat) / 2,
    lng: (effectiveNorthEast.lng + southWest.lng) / 2,
  };
  const radiusFromBounds = Math.ceil(
    Math.max(
      getDistanceMeters(queryCenter, effectiveNorthEast),
      getDistanceMeters(queryCenter, {
        lat: effectiveNorthEast.lat,
        lng: southWest.lng,
      }),
      getDistanceMeters(queryCenter, {
        lat: southWest.lat,
        lng: effectiveNorthEast.lng,
      }),
      getDistanceMeters(queryCenter, southWest),
    ),
  );

  return {
    lat: roundCoordinate(queryCenter.lat),
    lng: roundCoordinate(queryCenter.lng),
    radius: roundRadius(
      radiusFromBounds > 0
        ? Math.max(radiusFromBounds, fallbackRadius)
        : fallbackRadius,
    ),
  };
};

export const getRadiusFromViewport = (viewport: MapViewport): number => {
  return getLockerPinQueryFromViewport(viewport).radius;
};
