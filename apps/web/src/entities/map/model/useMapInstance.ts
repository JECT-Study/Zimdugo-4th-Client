import { type RefObject, useCallback, useState } from "react";

interface UseMapInstanceOptions {
  /**
   * 지도를 즉시 읽어야 하는 자리를 위한 ref. 훅이 만들지 않고 호출자에게 받는다.
   *
   * 이유가 둘이다. 하나는 #229 의 `useMapViewportPersistence` 가 이미 같은 모양으로
   * 지도를 받아 간다는 것. 다른 하나는 훅이 만들어 돌려주면 정적 분석이 그것을 ref 로
   * 알아보지 못해, ref 를 읽을 뿐인 콜백 서른 곳이 전부 의존성 경고를 받는다는 것이다.
   */
  mapRef: RefObject<naver.maps.Map | null>;
}

/**
 * 지도 인스턴스와 그에 딸린 표시 상태를 쥐는 자리.
 *
 * 지금은 인스턴스 state, SDK 로딩·오류, 지도를 다시 만들 때 쓰는 리마운트 키가
 * `index.tsx` 안에 흩어져 있다. 넷 다 "지도가 지금 어떤 상태인가" 하나를 말하는 값이라
 * 한 덩어리로 모은다.
 *
 * 경로 라우트 전환(#215)에서 지도는 레이아웃 라우트로 올라간다. 이 훅이 그대로 올라갈
 * 몫이고, 화면에 남을 몫(딥링크 포커스처럼 "무엇을 보고 있나"에 딸린 일)은 호출자가
 * `attach` 뒤에 이어서 한다. 둘을 한 함수에 두면 지도를 올릴 때 화면의 일까지 끌려
 * 올라간다.
 */
export function useMapInstance({ mapRef }: UseMapInstanceOptions) {
  /**
   * 렌더에 반영되어야 하는 곳(마커 레이어의 `map` prop 등)이 보는 값.
   * 콜백 안에서 지금 지도를 꺼내 쓰는 곳은 `mapRef` 를 본다.
   */
  const [map, setMap] = useState<naver.maps.Map | null>(null);

  /**
   * SDK 로딩·오류 상태. `NaverMapCanvas` 안에서 일어나는 일이라 그쪽이 끌어올려 준다.
   * 로딩 중에는 실제 컨트롤 대신 같은 위치·계층의 스켈레톤을 보여준다.
   */
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  /**
   * 지도를 다시 만들 때 올리는 키. 본문에서 읽지 않고 `key` 로만 쓴다.
   * 초기 카메라를 새로 계산하게 만드는 트리거이기도 하다.
   */
  const [remountKey, setRemountKey] = useState(0);

  /** 지도가 생기거나(map) 사라질 때(null) 배선만 한다. 화면의 일은 호출자가 이어서 한다. */
  const attach = useCallback(
    (nextMap: naver.maps.Map | null) => {
      mapRef.current = nextMap;
      setMap(nextMap);
    },
    [mapRef],
  );

  const remount = useCallback(() => {
    setRemountKey((key) => key + 1);
  }, []);

  return {
    map,
    isLoading,
    hasError,
    remountKey,
    attach,
    remount,
    setIsLoading,
    setHasError,
  };
}
