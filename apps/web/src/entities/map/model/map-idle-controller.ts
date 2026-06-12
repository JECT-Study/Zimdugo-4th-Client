/**
 * 네이버 지도 `idle` 이벤트를 구독해 안정화된 시점의 viewport 스냅샷을
 * 발행한다. idle 자체가 드래그/줌 종료 후 호출되므로, 직전 발행 viewport와
 * 비교해 변화가 유의미할 때만 onSettle을 호출한다.
 *
 * 유의미한 변화 기준:
 *   - 줌 레벨이 달라진 경우 → 항상 발행
 *   - 같은 줌 레벨에서 bounds span 또는 map size가 달라진 경우 → 발행
 *   - 같은 줌 레벨에서 중심 이동이 현재 bounds 범위의
 *     VIEWPORT_SETTLE_THRESHOLD(20%) 이상인 경우 → 발행
 *
 * 이 모듈은 스냅샷 발행까지만 책임진다. 페이로드 변환,
 * nearby lockers API 호출 등은 본 단계의 범위가 아니다.
 */

export interface MapViewportCoord {
  lat: number;
  lng: number;
}

export interface MapViewportBounds {
  northEast: MapViewportCoord;
  southWest: MapViewportCoord;
}

export interface MapViewportSize {
  width: number;
  height: number;
}

export interface MapViewport {
  center: MapViewportCoord;
  zoom: number;
  bounds: MapViewportBounds;
  size?: MapViewportSize;
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

export const readViewport = (map: naver.maps.Map): MapViewport => {
  const center = map.getCenter();
  const bounds = map.getBounds();
  const size = map.getSize?.();
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
    size: size ? { width: size.width, height: size.height } : undefined,
  };
};

/**
 * 직전 발행 viewport 대비 현재 viewport가 API 재요청이 필요할 만큼
 * 충분히 변했는지 판단한다.
 *
 * - 줌이 달라지면 즉시 true
 * - 동일 줌에서는 bounds span/size 변화 또는 bounds 범위 대비 중심 이동 비율로 판단
 */
const VIEWPORT_SETTLE_THRESHOLD = 0.2;

const getBoundsSpan = (bounds: MapViewportBounds) => ({
  lat: bounds.northEast.lat - bounds.southWest.lat,
  lng: bounds.northEast.lng - bounds.southWest.lng,
});

const isViewportChangedSignificantly = (
  prev: MapViewport,
  curr: MapViewport,
): boolean => {
  if (prev.zoom !== curr.zoom) return true;

  const prevSpan = getBoundsSpan(prev.bounds);
  const currSpan = getBoundsSpan(curr.bounds);

  // bounds가 유효하지 않은 엣지 케이스엔 항상 발행
  if (prevSpan.lat <= 0 || prevSpan.lng <= 0) return true;
  if (currSpan.lat <= 0 || currSpan.lng <= 0) return true;

  // 리사이즈/레이아웃 변화로 표시 범위가 달라지면 재발행
  if (prevSpan.lat !== currSpan.lat || prevSpan.lng !== currSpan.lng) {
    return true;
  }

  if (
    prev.size?.width !== curr.size?.width ||
    prev.size?.height !== curr.size?.height
  ) {
    return true;
  }

  const latDelta = Math.abs(curr.center.lat - prev.center.lat);
  const lngDelta = Math.abs(curr.center.lng - prev.center.lng);

  return (
    latDelta > prevSpan.lat * VIEWPORT_SETTLE_THRESHOLD ||
    lngDelta > prevSpan.lng * VIEWPORT_SETTLE_THRESHOLD
  );
};

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
    if (lastViewport !== null && !isViewportChangedSignificantly(lastViewport, viewport)) {
      return;
    }
    lastViewport = viewport;
    onSettle(viewport);
  };

  const listener = maps.Event.addListener(map, "idle", handler);
  handler();

  return () => {
    isCancelled = true;
    maps.Event.removeListener(listener);
  };
};
