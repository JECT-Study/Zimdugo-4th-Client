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

export const shouldClearViewportUserAlignment = ({
  isDragging,
  didFitBounds,
  mapCenter,
  userLocation,
  thresholdMeters = VIEWPORT_USER_ALIGNMENT_THRESHOLD_M,
}: {
  isDragging: boolean;
  didFitBounds: boolean;
  mapCenter: MapViewportCoord | null;
  userLocation: MapViewportCoord | null;
  thresholdMeters?: number;
}): boolean => {
  if (isDragging || didFitBounds) return true;
  if (!mapCenter || !userLocation) return true;

  return !isMapCenterNearCoordinates(mapCenter, userLocation, thresholdMeters);
};
