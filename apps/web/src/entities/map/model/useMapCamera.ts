import { useCallback, useMemo, useRef } from "react";
import {
  type FocusNaverMapOptions,
  focusNaverMapOnCoordinates,
  type MapCoordinates,
} from "./current-location";
import {
  type FitNaverMapBoundsOptions,
  fitNaverMapToBounds,
} from "./map-bounds";

type FocusOptions = Omit<FocusNaverMapOptions, "map" | "coordinates">;
type FitBoundsOptions = Omit<FitNaverMapBoundsOptions, "map" | "bounds">;

interface UseMapCameraOptions {
  /**
   * 명령을 내리는 시점에 지도를 꺼내 오는 길.
   *
   * state 가 아니라 함수를 받는 이유는 #229 의 `useMapViewportPersistence` 와 같다.
   * 명령 함수가 지도에 묶이면 지도가 바뀔 때마다 새로 만들어지고, 이것을 의존성으로
   * 쥔 콜백과 이펙트가 줄줄이 다시 돈다.
   */
  getMap: () => naver.maps.Map | null;
}

/**
 * 지도 카메라에 내리는 명령을 한곳에 모은 자리.
 *
 * 지금은 카메라를 옮기는 열몇 곳이 저마다 `mapInstanceRef.current` 를 꺼내 가드를 세우고
 * `map:` 으로 넘긴다. 화면이 하려는 말은 "여기를 비춰라" 하나인데, 지도를 손에 쥐어야만
 * 그 말을 할 수 있는 모양이다.
 *
 * 경로 라우트 전환(#215)에서 지도는 레이아웃 라우트로 올라간다. 그때 자식 라우트는
 * 지도를 손에 쥘 수 없고 명령만 내릴 수 있어야 하므로, 그 통로를 미리 이 모양으로
 * 세워 둔다. 지도를 옮기는 일은 이 훅이 레이아웃으로 따라가는 것으로 끝난다.
 *
 * 반환하는 함수들은 지도가 없으면 아무것도 하지 않고 `false` 를 준다. 원래 헬퍼가
 * 그렇게 동작해서 호출부의 가드가 대부분 불필요했다.
 */
export function useMapCamera({ getMap }: UseMapCameraOptions) {
  const getMapRef = useRef(getMap);
  getMapRef.current = getMap;

  /** 좌표를 비춘다. 지도가 없거나 좌표가 없으면 false. */
  const focusOn = useCallback(
    (
      coordinates: MapCoordinates | null | undefined,
      options?: FocusOptions,
    ): boolean =>
      focusNaverMapOnCoordinates({
        map: getMapRef.current(),
        coordinates,
        ...options,
      }),
    [],
  );

  /** 범위에 맞춘다. 지도가 없거나 범위가 없으면 false. */
  const fitBounds = useCallback(
    (
      bounds: FitNaverMapBoundsOptions["bounds"],
      options?: FitBoundsOptions,
    ): boolean =>
      fitNaverMapToBounds({
        map: getMapRef.current(),
        bounds,
        ...options,
      }),
    [],
  );

  /**
   * 지금 줌. 지도가 없거나 SDK 가 값을 주지 않으면 `null` 이다.
   *
   * `0` 이 아니라 `null` 인 이유는, 줌 0 이 실제로 있을 수 있는 값이라서다. 없다는 뜻과
   * 가장 멀리 물러난 상태를 같은 값으로 두면 호출부가 둘을 가르지 못한다.
   */
  const getZoom = useCallback((): number | null => {
    const zoom = getMapRef.current()?.getZoom?.();
    return typeof zoom === "number" ? zoom : null;
  }, []);

  /**
   * 묶어서 돌려주되 identity 를 고정한다. 매 렌더 새 객체를 주면 이것을 의존성으로 쥔
   * 콜백과 이펙트가 전부 다시 만들어진다.
   */
  return useMemo(
    () => ({ focusOn, fitBounds, getZoom }),
    [focusOn, fitBounds, getZoom],
  );
}
