import { type NavigateOptions, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";

/**
 * 헤더 뒤로가기 동작.
 *
 * `navigate` 로 되돌리면 뒤로 가는 것이 아니라 화면을 새로 밀어 넣어 히스토리가
 * 쌓인다. 설정을 몇 번 오가면 그만큼 스택이 자라, 브라우저나 OS 뒤로가기로는
 * 앱을 빠져나가려면 여러 번 눌러야 한다.
 *
 * 앱 안에서 들어왔으면 직전 화면으로 돌아가고, 링크나 새로고침으로 바로 들어와
 * 돌아갈 곳이 없을 때만 지정한 화면으로 보낸다.
 */
export const useBackNavigation = (fallbackTo: NavigateOptions["to"]) => {
  const router = useRouter();

  return useCallback(() => {
    if (router.history.canGoBack()) {
      router.history.back();
      return;
    }

    void router.navigate({ to: fallbackTo, replace: true });
  }, [router, fallbackTo]);
};
