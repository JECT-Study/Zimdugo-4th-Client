import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

/** 두 번째 누름을 "종료 의사"로 받아 주는 시간. 토스트가 떠 있는 동안이다. */
const EXIT_CONFIRM_WINDOW_MS = 2_000;

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
    if (router.history.canGoBack()) return;

    hasSentinelRef.current = true;
    router.history.push(router.history.location.href);
  }, [enabled, router]);

  useEffect(() => {
    if (!enabled) return;

    return router.history.block({
      blockerFn: ({ action }) => {
        if (action !== "BACK") return false;

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
