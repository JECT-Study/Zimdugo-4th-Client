import { useCallback, useEffect, useRef } from "react";
import { subscribeMapIdle } from "./map-idle-controller";
import { useMapViewportStore } from "./map-viewport-store";

/**
 * 지도 카메라를 잃지 않게 붙잡아 두는 자리.
 *
 * 저장해야 할 순간이 넷인데 서로 다른 곳에서 온다. 사용자가 지도를 옮기고 멈췄을 때
 * (idle), 탭을 가리거나 페이지를 떠날 때, 리프레시로 지도를 다시 만들기 직전, 그리고
 * 지도가 곧 버려질 때다. 넷 다 목적이 같은데 index.tsx 안에 흩어져 있어 하나로 모은다.
 *
 * 앞의 셋은 훅이 직접 붙잡고, 리프레시는 호출자가 자기 흐름 안에서 saveMapViewport 를
 * 부른다. 저장하는 코드가 한 벌이면 지도가 옮겨갈 때 함께 따라간다.
 *
 * 경로 라우트 전환(#215)에서 지도는 레이아웃 라우트로 올라간다. 카메라를 지키는 일도
 * 지도와 함께 움직여야 하므로, 옮길 것을 미리 한 덩어리로 묶어 둔다.
 */
interface UseMapViewportPersistenceOptions {
  /** 지금 떠 있는 지도. idle 구독을 붙일 대상이다. */
  map: naver.maps.Map | null;
  /**
   * 저장할 순간에 지도를 꺼내 오는 길.
   *
   * state 가 아니라 이 함수를 받는 이유는, 페이지 이탈 핸들러가 한 번만 붙고
   * 그 뒤로 바뀐 지도까지 보아야 하기 때문이다. state 를 직접 읽으면 지도가 바뀔
   * 때마다 리스너를 다시 붙이게 된다.
   */
  getMap: () => naver.maps.Map | null;
}

export function useMapViewportPersistence({
  map,
  getMap,
}: UseMapViewportPersistenceOptions) {
  const getMapRef = useRef(getMap);
  getMapRef.current = getMap;

  /** 지도를 직접 받아 저장한다. 곧 버려질 지도를 넘길 때 쓴다. */
  const persistMapViewport = useCallback((targetMap: naver.maps.Map) => {
    useMapViewportStore.getState().saveFromMap(targetMap);
  }, []);

  /** 지금 지도를 찾아 저장한다. 지도가 없으면 아무것도 하지 않는다. */
  const saveMapViewport = useCallback(() => {
    const currentMap = getMapRef.current();
    if (currentMap) {
      persistMapViewport(currentMap);
    }
  }, [persistMapViewport]);

  // 탭 전환·백그라운드 이탈 직전 viewport 저장
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveMapViewport();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", saveMapViewport);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", saveMapViewport);
    };
  }, [saveMapViewport]);

  useEffect(() => {
    if (!map) return;

    const maps = window.naver?.maps;
    if (!maps) return;

    return subscribeMapIdle({
      map,
      maps,
      onSettle: saveMapViewport,
    });
  }, [map, saveMapViewport]);

  return { persistMapViewport, saveMapViewport };
}
