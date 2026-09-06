import { useCallback, useMemo, useRef } from "react";
import type {
  LocationData,
  LocationRequestOutcome,
} from "./useLocationTracking";

export interface LocationEventBus {
  /** 첫 위치가 왔다고 알린다. 위치 추적을 쥔 쪽이 부른다. */
  notifyFirstLocation: (location: LocationData) => void;
  /** 첫 위치를 듣는다. 반환값으로 정리한다. */
  subscribeFirstLocation: (
    handler: (location: LocationData) => void,
  ) => () => void;
  /** 위치 요청이 끝났다고 알린다. 위치 추적을 쥔 쪽이 부른다. */
  notifyRequestSettled: (outcome: LocationRequestOutcome) => void;
  /** 위치 요청의 결말을 듣는다. 반환값으로 정리한다. */
  subscribeRequestSettled: (
    handler: (outcome: LocationRequestOutcome) => void,
  ) => () => void;
}

/**
 * 듣는 쪽을 모아 두고 한 번에 부르는 자리. 듣는 도중 구독이 바뀔 수 있어 복사본을
 * 돈다. 원본을 돌면 순회 중 추가·삭제가 조용히 건너뛰거나 두 번 불린다.
 */
const useHandlerSet = <T>() => {
  const handlersRef = useRef<Set<(payload: T) => void>>(new Set());

  const notify = useCallback((payload: T) => {
    for (const handler of [...handlersRef.current]) {
      handler(payload);
    }
  }, []);

  const subscribe = useCallback((handler: (payload: T) => void) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  return { notify, subscribe };
};

/**
 * 위치 추적이 내는 알림을 듣는 자리.
 *
 * `useLocationTracking` 은 첫 위치와 요청의 결말을 콜백으로 돌려준다. 그런데 그 콜백이
 * 하는 일은 화면의 일이다 — 시트가 보는 카메라를 옮기고, 오류 팝업을 열고, 복구 안내를
 * 띄운다. 콜백을 그대로 건네면 **위치 추적이 화면 상태에 묶인다.** 경로 라우트
 * 전환(#215)에서 위치 추적은 레이아웃 라우트로 올라가고 팝업은 `<Outlet>` 자식에
 * 남는데, 그때 레이아웃은 자식의 핸들러를 받을 길이 없다.
 *
 * 그래서 #236 이 지도 누름에 한 것과 같은 방향 전환을 한다. 위치 추적은 **알리기만**
 * 하고, 반응할 쪽이 듣는다. 위치 추적이 받는 것은 언제나 같은 `notify` 둘이라 화면이
 * 무엇을 하든 그쪽 인자는 그대로다.
 *
 * 두 알림을 한 훅에 두는 이유는 출처가 하나라서다. 듣는 쪽은 대개 둘 다 듣는다.
 */
export function useLocationEventBus(): LocationEventBus {
  const firstLocation = useHandlerSet<LocationData>();
  const requestSettled = useHandlerSet<LocationRequestOutcome>();

  return useMemo(
    () => ({
      notifyFirstLocation: firstLocation.notify,
      subscribeFirstLocation: firstLocation.subscribe,
      notifyRequestSettled: requestSettled.notify,
      subscribeRequestSettled: requestSettled.subscribe,
    }),
    [
      firstLocation.notify,
      firstLocation.subscribe,
      requestSettled.notify,
      requestSettled.subscribe,
    ],
  );
}
