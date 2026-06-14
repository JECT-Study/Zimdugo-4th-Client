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
  zoom?: number;
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
  zoom,
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

  const currentZoom = map.getZoom();
  let adjustedLatitude = coordinates.lat;

  const isZoomingIn = zoom !== undefined && currentZoom < zoom;
  const targetZoom = isZoomingIn ? zoom : currentZoom;

  if (latitudeSpan > 0) {
    let targetSpan = latitudeSpan;
    if (isZoomingIn) {
      const zoomDiff = zoom - currentZoom;
      targetSpan = latitudeSpan / Math.pow(2, zoomDiff);
    }

    const verticalOffsetRatio =
      bottomInsetPx > 0 && viewportHeight > 0
        ? Math.min(bottomInsetPx / 2 / viewportHeight, 0.35)
        : 0;
    adjustedLatitude = coordinates.lat - targetSpan * verticalOffsetRatio;
  }

  const targetLatLng = new maps.LatLng(adjustedLatitude, coordinates.lng);

  if (isZoomingIn) {
    map.morph(targetLatLng, targetZoom, {
      duration: 800,
      easing: "easeOutCubic",
    });
  } else {
    map.panTo(targetLatLng);
  }

  return true;
};
