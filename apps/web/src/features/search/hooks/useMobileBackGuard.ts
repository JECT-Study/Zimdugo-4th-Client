import { useEffect, useRef } from "react";

const MOBILE_BACK_HISTORY_STATE_KEY = "__zimdugoMobileBackEntry";

const isSyntheticEntry = (state: unknown): boolean =>
  typeof state === "object" &&
  state !== null &&
  (state as Record<string, unknown>)[MOBILE_BACK_HISTORY_STATE_KEY] === true;

/**
 * 모바일 하드웨어/브라우저 back 입력을 가로채 transient UI를 먼저 닫습니다.
 *
 * - onBack이 있으면 같은 URL의 synthetic history entry를 한 장 추가합니다.
 *   사용자가 back을 누르면 popstate가 발생하고 onBack이 실행됩니다.
 * - onBack이 없어지면 synthetic entry를 조용히 제거합니다.
 * - pushState state는 Router 내부 state와 독립적으로 관리합니다.
 */
export function useMobileBackGuard(onBack: (() => void) | undefined): void {
  const armedRef = useRef(false);
  const handlerRef = useRef(onBack);
  const ignoreNextPopRef = useRef(false);

  useEffect(() => {
    handlerRef.current = onBack;
  }, [onBack]);

  useEffect(() => {
    const handlePopState = () => {
      if (ignoreNextPopRef.current) {
        ignoreNextPopRef.current = false;
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
      if (armedRef.current && hasEntry) {
        armedRef.current = false;
        ignoreNextPopRef.current = true;
        window.history.back();
      } else {
        armedRef.current = false;
      }
      return;
    }

    if (armedRef.current) {
      return;
    }

    if (hasEntry) {
      armedRef.current = true;
      return;
    }

    window.history.pushState(
      { [MOBILE_BACK_HISTORY_STATE_KEY]: true },
      "",
      window.location.href,
    );
    armedRef.current = true;
  }, [onBack]);
}
