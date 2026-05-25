import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_CURRENT_LOCATION_OPTIONS,
  focusNaverMapOnCoordinates,
  getCurrentMapCoordinates,
  type GeolocationPermission,
  type MapCoordinates,
  watchCurrentLocationPermission,
} from "./current-location";
import { useNaverMapSdk } from "./NaverMapProvider";

const isPermissionDeniedError = (
  error: unknown,
): error is GeolocationPositionError =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === 1;

export interface UseCurrentLocationFocusOptions {
  map?: naver.maps.Map | null;
  maps?: typeof naver.maps | null;
  positionOptions?: PositionOptions;
}

export interface UseCurrentLocationFocusResult {
  coordinates: MapCoordinates | null;
  error: GeolocationPositionError | Error | null;
  isCentered: boolean;
  isRequesting: boolean;
  permission: GeolocationPermission;
  focusCachedLocation: () => boolean;
  requestCurrentLocation: () => Promise<MapCoordinates | null>;
}

export function useCurrentLocationFocus({
  map = null,
  maps,
  positionOptions = DEFAULT_CURRENT_LOCATION_OPTIONS,
}: UseCurrentLocationFocusOptions = {}): UseCurrentLocationFocusResult {
  const { maps: sdkMaps } = useNaverMapSdk();
  const resolvedMaps = maps ?? sdkMaps;

  const [coordinates, setCoordinates] = useState<MapCoordinates | null>(null);
  const [error, setError] = useState<GeolocationPositionError | Error | null>(
    null,
  );
  const [isCentered, setIsCentered] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [permission, setPermission] =
    useState<GeolocationPermission>("prompt");

  const focusCachedLocation = useCallback(() => {
    const didFocus = focusNaverMapOnCoordinates({
      map,
      maps: resolvedMaps,
      coordinates,
    });
    setIsCentered(didFocus);
    return didFocus;
  }, [coordinates, map, resolvedMaps]);

  const requestCurrentLocation = useCallback(async () => {
    setIsRequesting(true);
    setError(null);

    try {
      const nextCoordinates = await getCurrentMapCoordinates(positionOptions);
      setCoordinates(nextCoordinates);
      setPermission("granted");
      setIsCentered(
        focusNaverMapOnCoordinates({
          map,
          maps: resolvedMaps,
          coordinates: nextCoordinates,
        }),
      );
      return nextCoordinates;
    } catch (nextError) {
      setIsCentered(false);
      setError(
        nextError instanceof Error ? nextError : new Error("Unknown error."),
      );

      if (isPermissionDeniedError(nextError)) {
        setPermission("denied");
      }

      return null;
    } finally {
      setIsRequesting(false);
    }
  }, [map, resolvedMaps, positionOptions]);

  useEffect(() => {
    return watchCurrentLocationPermission((nextPermission) => {
      setPermission(nextPermission);
      if (nextPermission === "denied") {
        setIsCentered(false);
      }
    });
  }, []);

  return {
    coordinates,
    error,
    isCentered,
    isRequesting,
    permission,
    focusCachedLocation,
    requestCurrentLocation,
  };
}
