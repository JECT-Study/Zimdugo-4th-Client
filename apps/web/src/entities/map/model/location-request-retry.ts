import type {
  LocationData,
  LocationRequestStatus,
} from "./useLocationTracking";

interface CanStartFreshLocationRequestOptions {
  isTracking: boolean;
  location: LocationData | null;
  status: LocationRequestStatus;
}

export const canStartFreshLocationRequest = ({
  isTracking,
  location,
  status,
}: CanStartFreshLocationRequestOptions) =>
  location === null &&
  (!isTracking || status === "delayed" || status === "interrupted");
