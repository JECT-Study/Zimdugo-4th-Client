/**
 * 지도 드래그/확대축소로 인해 `bounds_changed`가 빈번히 발생할 수 있으므로,
 * 이 모듈은 향후 nearby lockers API 호출을 위한 throttle 경계만 정의한다.
 * 실제 fetch 로직과 서버 DTO는 ZIM-19에서 확정하지 않는다.
 */

export interface LockerMarkerBoundsCoord {
  lat: number;
  lng: number;
}

export interface LockerMarkerBounds {
  northEast: LockerMarkerBoundsCoord;
  southWest: LockerMarkerBoundsCoord;
}

export interface SubscribeNearbyLockersBoundsOptions {
  map: naver.maps.Map;
  maps: typeof naver.maps;
  /**
   * 지도 bounds가 throttle 경계를 넘어 안정화된 시점에 호출되는 콜백.
   * TODO(ZIM-19): 서버의 nearby lockers API 계약이 확정되면 bounds 기반
   * 요청으로 연결한다. 이 단계에서는 임의 fetch를 만들지 않는다.
   */
  onRequestNearbyLockers: (bounds: LockerMarkerBounds) => void;
  /**
   * leading 호출 이후 trailing 호출까지의 최소 간격(ms).
   * 기본값 300ms는 드래그/줌 중 과도한 호출을 막으면서도 응답성을 유지한다.
   */
  throttleMs?: number;
}

const DEFAULT_THROTTLE_MS = 300;

const readBounds = (map: naver.maps.Map): LockerMarkerBounds => {
  const raw = map.getBounds();
  const ne = raw.getNE();
  const sw = raw.getSW();
  return {
    northEast: { lat: ne.lat(), lng: ne.lng() },
    southWest: { lat: sw.lat(), lng: sw.lng() },
  };
};

/**
 * `bounds_changed`에 leading + trailing throttle을 적용해 구독한다.
 * 반환 함수는 listener와 pending timer 모두를 정리한다.
 */
export const subscribeNearbyLockersBounds = ({
  map,
  maps,
  onRequestNearbyLockers,
  throttleMs = DEFAULT_THROTTLE_MS,
}: SubscribeNearbyLockersBoundsOptions): (() => void) => {
  let lastInvokeAt = 0;
  let trailingTimer: ReturnType<typeof setTimeout> | null = null;
  let isCancelled = false;

  const invoke = () => {
    if (isCancelled) return;
    lastInvokeAt = Date.now();
    trailingTimer = null;
    onRequestNearbyLockers(readBounds(map));
  };

  const handler = () => {
    if (isCancelled) return;

    const remaining = throttleMs - (Date.now() - lastInvokeAt);

    if (remaining <= 0) {
      if (trailingTimer !== null) {
        clearTimeout(trailingTimer);
        trailingTimer = null;
      }
      invoke();
      return;
    }

    if (trailingTimer === null) {
      trailingTimer = setTimeout(invoke, remaining);
    }
  };

  const listener = maps.Event.addListener(map, "bounds_changed", handler);

  return () => {
    isCancelled = true;
    if (trailingTimer !== null) {
      clearTimeout(trailingTimer);
      trailingTimer = null;
    }
    maps.Event.removeListener(listener);
  };
};
