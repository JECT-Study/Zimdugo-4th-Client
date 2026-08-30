import { useEffect, useLayoutEffect, useState } from "react";
import { readSafeAreaInsetTopPx } from "#/shared/lib/safe-area-inset";

/**
 * 서버에서는 layout effect 를 돌릴 수 없다. 그쪽은 어차피 프로브를 띄울 DOM 이
 * 없어 재지 않는다.
 */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * 노치에 덮이는 높이.
 *
 * 첫 렌더는 0 으로 시작하되 그리기 전에 실제 값으로 맞춘다. `useEffect` 로 재면
 * 브라우저가 이미 0 기준으로 한 번 그린 뒤라, full 로 열린 시트가 검색 바를 덮은
 * 프레임이 잠깐 보인다.
 *
 * 렌더 중에 바로 재지 않는 이유는 하이드레이션이다. 서버는 안전 영역을 알 수 없어
 * 늘 0 을 그리는데, 클라이언트가 첫 렌더부터 다른 값을 쓰면 마크업이 갈린다.
 */
export const useSafeAreaInsetTop = () => {
  const [safeAreaInsetTop, setSafeAreaInsetTop] = useState(0);

  useIsomorphicLayoutEffect(() => {
    // 화면을 돌리면 안전 영역도 바뀐다.
    const measure = () => setSafeAreaInsetTop(readSafeAreaInsetTopPx());

    measure();
    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, []);

  return safeAreaInsetTop;
};
