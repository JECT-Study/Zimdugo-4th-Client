import { useMemo, useRef } from "react";

export interface LocationIntent {
  /** 사용자가 눌러서 켠 요청인지. 실패했을 때 조용히 넘길지 알릴지를 가른다. */
  isUserInitiated: () => boolean;
  /** 사용자의 요청이 끝났다고 표시한다. */
  clearUserInitiated: () => void;
  /** GPS 를 켜서 위치를 한 번 비춘다. */
  requestCenterOnce: () => void;
  /** GPS 를 켜서 방향 추적까지 시작한다. */
  requestOrientationStart: () => void;
  /** 한 번 비추기 요청을 꺼내 쓴다. 한 번만 참이다. */
  consumeCenterOnce: () => boolean;
  /** 방향 추적 요청을 꺼내 쓴다. 한 번만 참이다. */
  consumeOrientationStart: () => boolean;
  /** 모든 요청을 지운다. */
  clear: () => void;
}

/**
 * GPS 를 켠 이유를 기억하는 자리.
 *
 * 위치는 비동기로 온다. 사용자가 "내 위치" 를 눌렀을 때 GPS 가 꺼져 있으면 켜 두고
 * 기다렸다가, 첫 위치가 도착했을 때 **무엇을 하려고 켰는지**에 따라 다르게 움직인다.
 * 그 사이를 잇는 것이 이 요청들이다.
 *
 * 원래는 `boolean` ref 셋이 각자 놓여 스물네 곳에서 직접 켜고 꺼졌다. 셋이 늘 짝지어
 * 움직이는데 — 예를 들어 "켜서 한 번 비춘다" 는 `hasPendingMyLocationRequest` 와
 * `hasPendingOneTimeLocationCenter` 를 함께 세우는 것이라 — 조합을 읽어야 의도를 알 수
 * 있었다. 이름을 붙여 조합이 아니라 뜻을 쓰게 한다.
 *
 * state 가 아니라 ref 인 이유는 이 값이 화면을 바꾸지 않기 때문이다. 다시 그릴 이유가
 * 없고, 위치 콜백은 deps 가 빈 채로 최신 값을 읽어야 한다.
 */
export function useLocationIntent(): LocationIntent {
  const userInitiatedRef = useRef(false);
  const centerOnceRef = useRef(false);
  const orientationStartRef = useRef(false);

  return useMemo(
    () => ({
      isUserInitiated: () => userInitiatedRef.current,
      clearUserInitiated: () => {
        userInitiatedRef.current = false;
      },
      requestCenterOnce: () => {
        userInitiatedRef.current = true;
        centerOnceRef.current = true;
      },
      requestOrientationStart: () => {
        userInitiatedRef.current = true;
        orientationStartRef.current = true;
      },
      consumeCenterOnce: () => {
        if (!centerOnceRef.current) return false;
        centerOnceRef.current = false;
        return true;
      },
      consumeOrientationStart: () => {
        if (!orientationStartRef.current) return false;
        orientationStartRef.current = false;
        return true;
      },
      clear: () => {
        userInitiatedRef.current = false;
        centerOnceRef.current = false;
        orientationStartRef.current = false;
      },
    }),
    [],
  );
}
