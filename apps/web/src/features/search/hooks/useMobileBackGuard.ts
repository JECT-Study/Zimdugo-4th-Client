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

/**
 * 모바일 하드웨어/브라우저 back 입력을 가로채 transient UI를 먼저 닫습니다.
 *
 * - onBack이 있으면 같은 URL의 synthetic history entry를 한 장 추가합니다.
 *   사용자가 back을 누르면 popstate가 발생하고 onBack이 실행됩니다.
 * - onBack이 없어지면 history.back()으로 synthetic entry를 스택에서 제거합니다.
 *   이 cleanup popstate는 ignoreNextPopRef로 무시해 onBack이 실행되지 않습니다.
 * - cleanup back 진행 중 새 onBack이 들어오면 pendingArmRef에 보류 후
 *   popstate 완료 시점에 실행해 레이스 컨디션을 방지합니다.
 * - pushState state는 TanStack Router key를 복제하지 않고 나머지 필드만 유지합니다.
 */
export function useMobileBackGuard(onBack: (() => void) | undefined): void {
  const armedRef = useRef(false);
  const handlerRef = useRef(onBack);
  const ignoreNextPopRef = useRef(false);
  const pendingArmRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    handlerRef.current = onBack;
  }, [onBack]);

  useEffect(() => {
    const handlePopState = () => {
      if (ignoreNextPopRef.current) {
        ignoreNextPopRef.current = false;

        if (pendingArmRef.current) {
          pendingArmRef.current();
          pendingArmRef.current = null;
        }

        return;
      }

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
        ignoreNextPopRef.current = true;
        window.history.back();
      }

      return;
    }

    // cleanup back 진행 중이면 popstate 완료 후 arming
    if (ignoreNextPopRef.current) {
      pendingArmRef.current = () => {
        window.history.pushState(
          buildSyntheticHistoryState(),
          "",
          window.location.href,
        );
        armedRef.current = true;
      };
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
