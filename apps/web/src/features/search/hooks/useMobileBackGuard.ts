import { useEffect, useRef } from "react";

const MOBILE_BACK_HISTORY_STATE_KEY = "__zimdugoMobileBackEntry";

const isSyntheticEntry = (state: unknown): boolean =>
  typeof state === "object" &&
  state !== null &&
  (state as Record<string, unknown>)[MOBILE_BACK_HISTORY_STATE_KEY] === true;

/**
 * 모바일 하드웨어/브라우저 back 입력을 가로채 transient UI를 먼저 닫습니다.
 *
 * ### 동작 원리
 * - `onBack`이 있으면 같은 URL의 synthetic history entry를 추가합니다.
 *   사용자가 back을 누르면 popstate가 발생하고 `onBack`이 실행됩니다.
 * - `onBack`이 사라지면 `replaceState`로 push 이전의 원본 state를 복원합니다.
 *   `history.back()` 대신 `replaceState`를 사용하므로 popstate가 발생하지 않아
 *   TanStack Router가 반응하지 않습니다.
 * - synthetic entry의 state는 push 직전의 원본 state(TanStack Router key 포함)에
 *   flag 필드만 추가해 생성하며, 이를 `prePushStateRef`에 보관합니다.
 *   cleanup 시 원본 state 그대로 복원하므로 키 불일치로 인한 라우터 오동작을 막습니다.
 */
export function useMobileBackGuard(onBack: (() => void) | undefined): void {
  const armedRef = useRef(false);
  const handlerRef = useRef(onBack);
  const prePushStateRef = useRef<unknown>(null);

  useEffect(() => {
    handlerRef.current = onBack;
  }, [onBack]);

  useEffect(() => {
    const handlePopState = () => {
      if (!armedRef.current) {
        return;
      }

      armedRef.current = false;
      prePushStateRef.current = null;
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
        // replaceState는 popstate를 발생시키지 않으므로 TanStack Router가 반응하지 않습니다.
        // push 전 원본 state를 복원해 TanStack Router key 불일치로 인한 오동작을 방지합니다.
        window.history.replaceState(
          prePushStateRef.current,
          "",
          window.location.href,
        );
        prePushStateRef.current = null;
      }

      return;
    }

    if (armedRef.current) {
      if (!hasEntry) {
        armedRef.current = false;
        prePushStateRef.current = null;
      } else {
        return;
      }
    }

    if (hasEntry) {
      armedRef.current = true;
      return;
    }

    // push 직전 state를 보관 후 flag를 추가한 synthetic entry를 쌓습니다.
    prePushStateRef.current = currentState;
    window.history.pushState(
      {
        ...(typeof currentState === "object" && currentState !== null
          ? (currentState as Record<string, unknown>)
          : {}),
        [MOBILE_BACK_HISTORY_STATE_KEY]: true,
      },
      "",
      window.location.href,
    );
    armedRef.current = true;
  }, [onBack]);
}
