import { useCallback, useMemo, useRef } from "react";

export interface MapPressBus {
  /** 지도를 눌렀다고 알린다. 지도를 쥔 쪽이 부른다. */
  notify: () => void;
  /** 누름을 듣는다. 반환값으로 정리한다. */
  subscribe: (handler: () => void) => () => void;
}

/**
 * 지도 누름을 알리는 자리.
 *
 * 지도를 누르면 시트가 내려간다. 그런데 그 반응은 화면의 일이라, 지도에게 `onMapPress`
 * 로 화면의 핸들러를 건네면 **지도가 시트 상태에 묶인다.** 경로 라우트 전환(#215)에서
 * 지도는 레이아웃 라우트로 올라가고 시트는 `<Outlet>` 자식에 남는데, 그때 레이아웃은
 * 자식의 핸들러를 받을 길이 없다.
 *
 * 그래서 방향을 뒤집는다. 지도는 눌렸다고 **알리기만** 하고, 반응할 쪽이 듣는다. 지도가
 * 받는 것은 언제나 같은 `notify` 하나라 화면이 무엇을 하든 지도의 prop 은 그대로다.
 *
 * 듣는 쪽이 여럿일 수 있어 Set 으로 둔다. 지금은 시트 하나지만, 전환 뒤에는 라우트마다
 * 다른 것이 들을 수 있다.
 */
export function useMapPressBus(): MapPressBus {
  const handlersRef = useRef<Set<() => void>>(new Set());

  const notify = useCallback(() => {
    // 듣는 도중 구독이 바뀔 수 있어 복사본을 돈다. 원본을 돌면 순회 중 추가·삭제가
    // 조용히 건너뛰거나 두 번 불린다.
    for (const handler of [...handlersRef.current]) {
      handler();
    }
  }, []);

  const subscribe = useCallback((handler: () => void) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  return useMemo(() => ({ notify, subscribe }), [notify, subscribe]);
}
