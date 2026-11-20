import { desktopMediaQuery } from "@repo/ui/tokens/layout/layout.css";
import { useState } from "react";
import { useIsomorphicLayoutEffect } from "#/shared/hooks/useIsomorphicLayoutEffect";

/**
 * 데스크톱 레이아웃(1200px~)으로 그리는 중인지.
 *
 * 배치는 CSS 미디어 쿼리가 정한다. 이 훅은 JS 가 숫자로 잡는 값(시트 스냅 경계 등)을
 * 같은 기준에 맞추는 데만 쓴다.
 *
 * 첫 렌더는 false 로 시작하고 그리기 전에 실제 값으로 맞춘다. 서버는 화면 폭을 몰라
 * 늘 모바일로 그리므로, 첫 렌더부터 다르게 쓰면 하이드레이션이 갈린다.
 * (useSafeAreaInsetTop 과 같은 방식)
 */
export const useIsDesktopLayout = () => {
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const query = window.matchMedia(desktopMediaQuery);
    const sync = () => setIsDesktopLayout(query.matches);

    sync();
    query.addEventListener("change", sync);

    return () => query.removeEventListener("change", sync);
  }, []);

  return isDesktopLayout;
};
