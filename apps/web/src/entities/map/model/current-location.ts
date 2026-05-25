export interface MapCoordinates {
  lat: number;
  lng: number;
}

export type GeolocationPermission = "prompt" | "granted" | "denied";

export interface FocusNaverMapOptions {
  map: naver.maps.Map | null | undefined;
  coordinates: MapCoordinates | null | undefined;
  maps?: typeof naver.maps | null;
}

export const DEFAULT_CURRENT_LOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 60_000,
  timeout: 2_000,
};

export const isGeolocationSupported = () =>
  typeof navigator !== "undefined" && "geolocation" in navigator;

export const getCurrentMapCoordinates = (
  options: PositionOptions = DEFAULT_CURRENT_LOCATION_OPTIONS,
) =>
  new Promise<MapCoordinates>((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error("Geolocation API is not available."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          lat: coords.latitude,
          lng: coords.longitude,
        });
      },
      reject,
      options,
    );
  });

export const getCurrentLocationPermission =
  async (): Promise<GeolocationPermission | null> => {
    if (
      typeof navigator === "undefined" ||
      !navigator.permissions?.query
    ) {
      return null;
    }

    try {
      const status = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      });
      return status.state;
    } catch {
      return null;
    }
  };

export const watchCurrentLocationPermission = (
  onChange: (permission: GeolocationPermission) => void,
) => {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return () => {};
  }

  let isDisposed = false;
  let permissionStatus: PermissionStatus | null = null;

  const handleChange = () => {
    if (!permissionStatus) return;
    onChange(permissionStatus.state);
  };

  navigator.permissions
    .query({ name: "geolocation" as PermissionName })
    .then((status) => {
      if (isDisposed) return;
      permissionStatus = status;
      onChange(status.state);
      status.addEventListener("change", handleChange);
    })
    .catch(() => {});

  return () => {
    isDisposed = true;
    permissionStatus?.removeEventListener("change", handleChange);
  };
};

export const focusNaverMapOnCoordinates = ({
  map,
  coordinates,
  maps = typeof window !== "undefined" ? window.naver?.maps : null,
}: FocusNaverMapOptions) => {
  if (!map || !coordinates || !maps) {
    return false;
  }

  map.panTo(new maps.LatLng(coordinates.lat, coordinates.lng));
  return true;
};
