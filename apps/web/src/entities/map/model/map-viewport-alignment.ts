import type { MapViewportCoord } from "./map-idle-controller";
import { haversineDistanceM } from "./map-viewport-bootstrap";

export const VIEWPORT_USER_ALIGNMENT_THRESHOLD_M = 80;

export const isMapCenterNearCoordinates = (
  mapCenter: MapViewportCoord,
  target: MapViewportCoord,
  thresholdMeters = VIEWPORT_USER_ALIGNMENT_THRESHOLD_M,
): boolean => {
  return haversineDistanceM(mapCenter, target) <= thresholdMeters;
};
