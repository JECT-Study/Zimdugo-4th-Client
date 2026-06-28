import type { MapCoordinates } from "#/entities/map/model/current-location";

export const MY_LIST_LOCATION_STALE_TIME_MS = 10 * 60 * 1000;
export const MY_HISTORY_LIST_STALE_TIME_MS = 5 * 60 * 1000;
const MY_LIST_COORDINATE_PRECISION = 4;

export const normalizeMyListCoordinate = (coordinate: number) =>
  Number(coordinate.toFixed(MY_LIST_COORDINATE_PRECISION));

export const normalizeMyListLocation = ({
  lat,
  lng,
}: MapCoordinates): MapCoordinates => ({
  lat: normalizeMyListCoordinate(lat),
  lng: normalizeMyListCoordinate(lng),
});
