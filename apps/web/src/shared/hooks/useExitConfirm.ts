import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import {
  EXIT_SENTINEL_STATE,
  isExitSentinelEntry,
} from "#/shared/lib/history-entry-state";

/** 두 번째 누름을 "종료 의사"로 받아 주는 시간. 토스트가 떠 있는 동안이다. */
const EXIT_CONFIRM_WINDOW_MS = 2_000;

/**
 * 홈 첫 화면에서 뒤로가기를 한 번은 흘려보내고 토스트를 띄운다.
 *
 * 브라우저는 문서를 떠나는 뒤로가기를 스크립트로 막을 수 없다. `popstate` 는
 * 같은 문서 안에서 움직일 때만 오기 때문이다. 그래서 홈이 히스토리의 첫 자리면
 * 같은 URL 로 자리를 하나 만들어 둔다. 그 자리 덕분에 첫 뒤로가기가 문서 안에서
 * 일어나고 — 화면은 그대로인 채 — 그때 토스트를 띄울 수 있다.
 *
 * 첫 누름을 막지 않고 흘려보내는 것이 핵심이다. 막아서 자리에 붙잡아 두면 두 번째
 * 누름도 그 자리에서 한 칸 물러날 뿐이라, 설치형 앱처럼 앞선 기록이 없는 곳에서는
 * 한 번 더 눌러야 나가진다. 흘려보내면 첫 자리로 내려앉으므로 두 번째 누름은
 * 브라우저가 직접 처리해 문서를 떠난다.
 *
 * 두 번째 누름이 없으면 토스트가 사라질 때 자리를 다시 만들어 되묻기를 되살린다.
 *
 * @param enabled 홈 첫 화면일 때만 켠다. 시트가 열려 있으면 뒤로가기는 그 시트를
 * 닫아야 하고, 그 몫은 시트를 열 때 쌓아 둔 히스토리 한 칸이 맡는다.
 */
export const useExitConfirm = (enabled: boolean) => {
  const router = useRouter();
  const [isPrompting, setIsPrompting] = useState(false);
  const hasSentinelRef = useRef(false);

  useEffect(() => {
    // 되묻는 동안에는 만들지 않는다. 여기서 자리를 다시 놓으면 두 번째 누름도
    // 문서 안에서 일어나 앱을 나가지 못한다.
    if (!enabled || isPrompting || hasSentinelRef.current) return;

    // 화면을 오가다 이 자리로 되돌아왔을 수도 있다. 그때 또 만들면 자리만 늘고,
    // 알아보지 못하면 종료를 되묻지 못한다.
    if (isExitSentinelEntry(router.history.location.state)) {
      hasSentinelRef.current = true;
      return;
    }

    // 뒤에 화면이 있으면 뒤로가기는 앱을 벗어나는 동작이 아니다. 그대로 둔다.
    if (router.history.canGoBack()) return;

    hasSentinelRef.current = true;
    router.history.push(router.history.location.href, EXIT_SENTINEL_STATE);
  }, [enabled, isPrompting, router]);

  useEffect(
    () =>
      router.history.subscribe(({ action }) => {
        if (action.type !== "BACK" || !hasSentinelRef.current) return;

        // 자리에서 물러났다. 다음 뒤로가기는 브라우저가 문서 밖으로 데려간다.
        hasSentinelRef.current = false;
        setIsPrompting(true);
      }),
    [router],
  );

  // 시트가 열려 종료 확인이 꺼지면 되묻던 상태도 흘려보낸다. 남겨 두면 시트를
  // 여닫는 사이에 시간만 지나, 다시 홈으로 돌아온 첫 뒤로가기가 "두 번째 누름"
  // 으로 처리돼 확인 없이 앱을 벗어난다.
  useEffect(() => {
    if (enabled) return;

    setIsPrompting(false);
  }, [enabled]);

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
