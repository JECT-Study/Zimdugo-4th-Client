import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

/** 두 번째 누름을 "종료 의사"로 받아 주는 시간. 토스트가 떠 있는 동안이다. */
const EXIT_CONFIRM_WINDOW_MS = 2_000;

/** 우리가 종료를 가로채려고 만든 자리라는 표시. */
const EXIT_SENTINEL_STATE_KEY = "zimdugoExitSentinel";

const isExitSentinelLocation = (state: unknown) =>
  typeof state === "object" &&
  state !== null &&
  (state as Record<string, unknown>)[EXIT_SENTINEL_STATE_KEY] === true;

/**
 * 홈 첫 화면에서 뒤로가기를 한 번은 잡아 두고 토스트를 띄운다.
 *
 * 브라우저는 문서를 떠나는 뒤로가기를 스크립트로 막을 수 없다. `popstate` 는
 * 같은 문서 안에서 움직일 때만 오기 때문이다. 그래서 홈이 히스토리의 첫 자리면
 * 같은 URL 로 자리를 하나 만들어 둔다. 그 자리 덕분에 첫 뒤로가기가 문서 안에서
 * 일어나고, 그때 가로채 토스트를 띄울 수 있다.
 *
 * 우리가 만든 자리에서는 통과시켜도 한 칸 앞의 홈으로 갈 뿐이라 앱을 벗어나지
 * 않는다. 그래서 통과시킨 뒤 한 번 더 물러나 실제로 나가게 한다. 원래 앞선
 * 기록이 있었다면 그 화면으로 돌아가면 되므로 그럴 필요가 없다.
 *
 * @param enabled 홈 첫 화면일 때만 켠다. 시트가 열려 있으면 뒤로가기는 그 시트를
 * 닫아야 하고, 그 몫은 시트를 열 때 쌓아 둔 히스토리 한 칸이 맡는다.
 */
export const useExitConfirm = (enabled: boolean) => {
  const router = useRouter();
  const [isPrompting, setIsPrompting] = useState(false);
  const promptedAtRef = useRef(0);
  const hasSentinelRef = useRef(false);
  const shouldLeaveAfterPopRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasSentinelRef.current) return;

    // 화면을 오가다 이 자리로 되돌아왔을 수도 있다. 그때 또 만들면 자리만 늘고,
    // 알아보지 못하면 종료를 되묻지 못한다.
    if (isExitSentinelLocation(router.history.location.state)) {
      hasSentinelRef.current = true;
      return;
    }

    // 뒤에 화면이 있으면 뒤로가기는 앱을 벗어나는 동작이 아니다. 그대로 둔다.
    if (router.history.canGoBack()) return;

    hasSentinelRef.current = true;
    router.history.push(router.history.location.href, {
      [EXIT_SENTINEL_STATE_KEY]: true,
    });
  }, [enabled, router]);

  useEffect(() => {
    if (!enabled) return;

    return router.history.block({
      blockerFn: ({ action }) => {
        // 우리가 만든 자리에 서 있을 때만 종료를 되묻는다. 뒤에 앱 화면이 있으면
        // 그 화면으로 돌아가는 동작이라 막으면 안 된다.
        if (action !== "BACK" || !hasSentinelRef.current) return false;

        const isConfirming =
          Date.now() - promptedAtRef.current <= EXIT_CONFIRM_WINDOW_MS;
        if (isConfirming) {
          shouldLeaveAfterPopRef.current = hasSentinelRef.current;
          return false;
        }

        promptedAtRef.current = Date.now();
        setIsPrompting(true);
        return true;
      },
      // 새로고침이나 탭 닫기까지 붙잡으면 브라우저 기본 경고창이 뜬다.
      enableBeforeUnload: false,
    });
  }, [enabled, router]);

  useEffect(
    () =>
      router.history.subscribe(({ action }) => {
        if (action.type !== "BACK" || !shouldLeaveAfterPopRef.current) return;

        shouldLeaveAfterPopRef.current = false;
        window.history.back();
      }),
    [router],
  );

  useEffect(() => {
    if (!isPrompting) return;

    const timerId = window.setTimeout(
      () => setIsPrompting(false),
      EXIT_CONFIRM_WINDOW_MS,
    );
    return () => window.clearTimeout(timerId);
  }, [isPrompting]);

  return isPrompting;
};
