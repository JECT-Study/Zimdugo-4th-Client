import { useState } from "react";
import { useIsomorphicLayoutEffect } from "#/shared/hooks/useIsomorphicLayoutEffect";

/**
 * 시트가 자리를 잡을 때 기준으로 삼는 뷰포트 높이.
 *
 * 서버는 창 크기를 알 수 없으므로 첫 렌더는 설계 기준 높이로 시작하고, 그리기 전에
 * 실제 값으로 맞춘다. `useEffect` 로 재면 브라우저가 이미 812 기준으로 한 번 그린
 * 뒤라, 화면이 낮은 기기에서 시트가 뷰포트 밖까지 올라간 프레임이 잠깐 보인다.
 * 이 조건은 `useSafeAreaInsetTop` 과 같아서 재는 방식도 같이 둔다.
 *
 * 세 시트가 각자 이 값을 window 에서 읽고 있었다. 경로 라우트 전환(#215)에서 시트는
 * `<Outlet>` 의 자식이 되고, "얼마나 쓸 수 있는가" 는 창이 아니라 레이아웃이 정한다.
 * 창구가 하나여야 그때 한 곳만 고친다.
 */
export const VIEWPORT_HEIGHT_FALLBACK_PX = 812;

export const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(
    VIEWPORT_HEIGHT_FALLBACK_PX,
  );

  useIsomorphicLayoutEffect(() => {
    const measure = () => setViewportHeight(window.innerHeight);

    measure();
    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, []);

  return viewportHeight;
};
