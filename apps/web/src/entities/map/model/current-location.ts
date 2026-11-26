export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface FocusNaverMapOptions {
  map: naver.maps.Map | null | undefined;
  coordinates: MapCoordinates | null | undefined;
  maps?: typeof naver.maps | null;
  bottomInsetPx?: number;
  /**
   * 지도 왼쪽이 가려진 폭. 데스크톱 왼쪽 카드처럼 옆에서 가리는 것이 있으면, 좌표를
   * 화면 가운데가 아니라 남은 오른쪽 지도의 가운데에 놓는다.
   */
  leftInsetPx?: number;
  zoom?: number;
}

const DEFAULT_CURRENT_LOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 60_000,
  timeout: 2_000,
};

const isGeolocationSupported = () =>
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

export const focusNaverMapOnCoordinates = ({
  map,
  coordinates,
  maps = typeof window !== "undefined" ? window.naver?.maps : null,
  bottomInsetPx = 0,
  leftInsetPx = 0,
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
  const viewportWidth = size?.width ?? 0;
  const latitudeSpan = ne && sw ? Math.abs(ne.lat() - sw.lat()) : 0;
  const longitudeSpan = ne && sw ? Math.abs(ne.lng() - sw.lng()) : 0;

  const currentZoom = map.getZoom();
  let adjustedLatitude = coordinates.lat;
  let adjustedLongitude = coordinates.lng;

  const isZoomingIn = zoom !== undefined && currentZoom < zoom;
  const targetZoom = isZoomingIn ? zoom : currentZoom;

  if (latitudeSpan > 0) {
    let targetSpan = latitudeSpan;
    if (isZoomingIn) {
      const zoomDiff = zoom - currentZoom;
      targetSpan = latitudeSpan / 2 ** zoomDiff;
    }

    const verticalOffsetRatio =
      bottomInsetPx > 0 && viewportHeight > 0
        ? Math.min(bottomInsetPx / 2 / viewportHeight, 0.35)
        : 0;
    adjustedLatitude = coordinates.lat - targetSpan * verticalOffsetRatio;
  }

  /*
   * 왼쪽이 가려지면 남은 지도의 가운데는 화면 가운데보다 leftInset/2 만큼 오른쪽이다.
   * 좌표가 그 자리에 오도록 카메라 중심을 같은 거리만큼 서쪽으로 옮긴다.
   * 세로와 같은 방식으로, 줌인할 때는 목표 줌의 폭으로 환산한다.
   */
  if (longitudeSpan > 0 && leftInsetPx > 0 && viewportWidth > 0) {
    const targetSpan =
      zoom !== undefined && currentZoom < zoom
        ? longitudeSpan / 2 ** (zoom - currentZoom)
        : longitudeSpan;
    const horizontalOffsetRatio = Math.min(
      leftInsetPx / 2 / viewportWidth,
      0.35,
    );
    adjustedLongitude = coordinates.lng - targetSpan * horizontalOffsetRatio;
  }

  const targetLatLng = new maps.LatLng(adjustedLatitude, adjustedLongitude);

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
