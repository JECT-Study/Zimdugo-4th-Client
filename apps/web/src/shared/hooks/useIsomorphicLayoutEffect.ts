import { useEffect, useLayoutEffect } from "react";

/**
 * 서버에서는 layout effect 를 돌릴 수 없어 useEffect 로 떨어진다.
 *
 * 첫 페인트 전에 알아야 하는 측정(안전 영역, 시트 콘텐츠 높이)에 쓴다. useEffect 로
 * 재면 브라우저가 이미 한 번 그린 뒤라, 잘못된 자리에서 출발한 시트가 측정 후 옮겨
 * 앉는 게 눈에 보인다.
 */
export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
