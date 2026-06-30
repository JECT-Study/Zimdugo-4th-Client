import { useEffect, useRef } from "react";

const MOBILE_BACK_HISTORY_STATE_KEY = "__zimdugoMobileBackEntry";

const isSyntheticEntry = (state: unknown): boolean =>
  typeof state === "object" &&
  state !== null &&
  (state as Record<string, unknown>)[MOBILE_BACK_HISTORY_STATE_KEY] === true;

const buildSyntheticHistoryState = (): Record<string, unknown> => {
  const currentState = window.history.state;

  if (typeof currentState !== "object" || currentState === null) {
    return { [MOBILE_BACK_HISTORY_STATE_KEY]: true };
  }

  const { key: _routerKey, [MOBILE_BACK_HISTORY_STATE_KEY]: _, ...rest } =
    currentState as Record<string, unknown>;

  return {
    ...rest,
    [MOBILE_BACK_HISTORY_STATE_KEY]: true,
  };
};

const stripSyntheticHistoryState = (state: unknown): unknown => {
  if (typeof state !== "object" || state === null) {
    return state;
  }

  const { [MOBILE_BACK_HISTORY_STATE_KEY]: _, ...rest } = state as Record<
    string,
    unknown
  >;

  return Object.keys(rest).length > 0 ? rest : null;
};

/**
 * 모바일 하드웨어/브라우저 back 입력을 가로채 transient UI를 먼저 닫습니다.
 *
 * - onBack이 있으면 같은 URL의 synthetic history entry를 한 장 추가합니다.
 *   사용자가 back을 누르면 popstate가 발생하고 onBack이 실행됩니다.
 * - onBack이 없어지면 현재 entry가 synthetic인 경우 replaceState로 키를 제거합니다.
 *   history.back() 대신 replaceState를 사용해 popstate를 발생시키지 않으므로
 *   TanStack Router routing loop와 필터 첫 클릭 레이스를 방지합니다.
 * - pushState state는 TanStack Router key를 복제하지 않고 나머지 필드만 유지합니다.
 */
export function useMobileBackGuard(onBack: (() => void) | undefined): void {
  const armedRef = useRef(false);
  const handlerRef = useRef(onBack);

  useEffect(() => {
    handlerRef.current = onBack;
  }, [onBack]);

  useEffect(() => {
    const handlePopState = () => {
      if (!armedRef.current) {
        return;
      }

      armedRef.current = false;
      handlerRef.current?.();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const currentState = window.history.state;
    const hasEntry = isSyntheticEntry(currentState);

    if (!onBack) {
      armedRef.current = false;

      if (hasEntry) {
        window.history.replaceState(
          stripSyntheticHistoryState(currentState),
          "",
          window.location.href,
        );
      }

      return;
    }

    if (armedRef.current) {
      if (!hasEntry) {
        armedRef.current = false;
      } else {
        return;
      }
    }

    if (hasEntry) {
      armedRef.current = true;
      return;
    }

    window.history.pushState(
      buildSyntheticHistoryState(),
      "",
      window.location.href,
    );
    armedRef.current = true;
  }, [onBack]);
}
