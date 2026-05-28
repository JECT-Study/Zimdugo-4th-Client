/**
 * 네이버 지도 `idle` 이벤트를 구독해 안정화된 시점의 viewport 스냅샷을
 * 발행한다. idle 자체가 드래그/줌 종료 후 호출되므로 별도의 이동 임계값을
 * 두지 않고, 대신 직전 발행값과 동일한 viewport는 dedup으로 차단한다.
 *
 * 이 모듈은 스냅샷 발행까지만 책임진다. 줌 임계값 필터링, 페이로드 변환,
 * nearby lockers API 호출 등은 본 단계의 범위가 아니다. TODO(ZIM-19).
 */

export interface MapViewportCoord {
  lat: number;
  lng: number;
}

export interface MapViewportBounds {
  northEast: MapViewportCoord;
  southWest: MapViewportCoord;
}

export interface MapViewport {
  center: MapViewportCoord;
  zoom: number;
  bounds: MapViewportBounds;
}

export interface SubscribeMapIdleOptions {
  map: naver.maps.Map;
  maps: typeof naver.maps;
  /**
   * idle 시점의 viewport가 직전 발행값과 다를 때만 호출된다.
   * TODO(ZIM-19): 향후 viewport 기반 nearby lockers 요청과 연결한다.
   */
  onSettle: (viewport: MapViewport) => void;
}

const readViewport = (map: naver.maps.Map): MapViewport => {
  const center = map.getCenter();
  const bounds = map.getBounds();
  const ne = bounds?.getNE?.();
  const sw = bounds?.getSW?.();
  const centerLat = center.lat();
  const centerLng = center.lng();
  return {
    center: { lat: centerLat, lng: centerLng },
    zoom: map.getZoom(),
    bounds: {
      northEast: { lat: ne?.lat?.() ?? centerLat, lng: ne?.lng?.() ?? centerLng },
      southWest: { lat: sw?.lat?.() ?? centerLat, lng: sw?.lng?.() ?? centerLng },
    },
  };
};

const isSameViewport = (a: MapViewport, b: MapViewport): boolean =>
  a.zoom === b.zoom &&
  a.center.lat === b.center.lat &&
  a.center.lng === b.center.lng &&
  a.bounds.northEast.lat === b.bounds.northEast.lat &&
  a.bounds.northEast.lng === b.bounds.northEast.lng &&
  a.bounds.southWest.lat === b.bounds.southWest.lat &&
  a.bounds.southWest.lng === b.bounds.southWest.lng;

/**
 * `idle` 이벤트를 구독해 viewport 스냅샷을 dedup 후 발행한다.
 * 반환 함수는 listener를 정리하며 이후 핸들러 호출도 무시한다.
 */
export const subscribeMapIdle = ({
  map,
  maps,
  onSettle,
}: SubscribeMapIdleOptions): (() => void) => {
  let lastViewport: MapViewport | null = null;
  let isCancelled = false;

  const handler = () => {
    if (isCancelled) return;
    const viewport = readViewport(map);
    if (lastViewport !== null && isSameViewport(viewport, lastViewport)) {
      return;
    }
    lastViewport = viewport;
    onSettle(viewport);
  };

  const listener = maps.Event.addListener(map, "idle", handler);

  return () => {
    isCancelled = true;
    maps.Event.removeListener(listener);
  };
};
