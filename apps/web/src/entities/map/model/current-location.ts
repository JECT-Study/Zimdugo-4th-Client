export interface MapCoordinates {
  lat: number;
  lng: number;
}

export type GeolocationPermission = "prompt" | "granted" | "denied";

export interface FocusNaverMapOptions {
  map: naver.maps.Map | null | undefined;
  coordinates: MapCoordinates | null | undefined;
  maps?: typeof naver.maps | null;
  bottomInsetPx?: number;
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
  bottomInsetPx = 0,
}: FocusNaverMapOptions) => {
  if (!map || !coordinates || !maps) {
    return false;
  }

  const size = map.getSize?.();
  const bounds = map.getBounds?.();
  const ne = bounds?.getNE?.();
  const sw = bounds?.getSW?.();
  const viewportHeight = size?.height ?? 0;
  const latitudeSpan =
    ne && sw ? Math.abs(ne.lat() - sw.lat()) : 0;
  const verticalOffsetRatio =
    bottomInsetPx > 0 && viewportHeight > 0
      ? Math.min(bottomInsetPx / 2 / viewportHeight, 0.35)
      : 0;
  const adjustedLatitude =
    latitudeSpan > 0
      ? coordinates.lat - latitudeSpan * verticalOffsetRatio
      : coordinates.lat;

  map.panTo(new maps.LatLng(adjustedLatitude, coordinates.lng));
  return true;
};
