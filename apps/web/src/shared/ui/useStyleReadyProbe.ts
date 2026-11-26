import { useEffect, useRef, useState } from "react";
import { useIsHydrating } from "#/shared/hooks/useIsHydrating";

const DEFAULT_STYLE_READY_CHECK_LIMIT = 20;
const STYLE_READY_PROBE_STYLE =
  "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none";

export interface StyleReadyProbe {
  className: string;
  isReady: (element: HTMLElement) => boolean;
  tagName?: keyof HTMLElementTagNameMap;
}

interface UseStyleReadyProbeOptions {
  enabled?: boolean;
  probes: StyleReadyProbe[];
  checkLimit?: number;
}

export function useStyleReadyProbe({
  enabled = true,
  probes,
  checkLimit = DEFAULT_STYLE_READY_CHECK_LIMIT,
}: UseStyleReadyProbeOptions) {
  const isHydrating = useIsHydrating();
  const isProbeNeeded = enabled && probes.length > 0;
  /*
   * 서버 렌더에서는 스켈레톤 대신 실제 UI 를 그린다.
   *
   * SSR 문서는 라우트 CSS 를 <head> 의 스타일시트로 걸어 두어 첫 페인트 전에 CSS 가
   * 붙는다. 여기서 스켈레톤을 그리면 CSS 가 이미 있는데도 첫 페인트가 스켈레톤이 되고,
   * 하이드레이션 뒤 실제 UI 로 갈아끼우며 화면이 한 번 바뀐다. 스켈레톤의 인라인
   * 폴백은 미디어 쿼리를 못 써서 데스크톱에서는 자리까지 달라 레이아웃이 밀린다.
   *
   * 확인은 마운트 뒤에 그대로 한다. CSS 가 끝내 없으면 시간 초과로 폴백을 얹는다.
   */
  const isAssumedReadyRef = useRef(isProbeNeeded && isHydrating);
  const [isStyleReady, setIsStyleReady] = useState(
    !isProbeNeeded || isHydrating,
  );
  const [isStyleVerified, setIsStyleVerified] = useState(!isProbeNeeded);
  const [isStyleTimedOut, setIsStyleTimedOut] = useState(false);

  useEffect(() => {
    const isAssumedReady = isAssumedReadyRef.current;
    isAssumedReadyRef.current = false;

    if (!enabled || probes.length === 0) {
      setIsStyleReady(true);
      setIsStyleVerified(true);
      setIsStyleTimedOut(false);
      return;
    }

    // 하이드레이션으로 이미 실제 UI 를 그렸다면 스켈레톤으로 되돌리지 않는다.
    if (!isAssumedReady) {
      setIsStyleReady(false);
    }
    setIsStyleVerified(false);
    setIsStyleTimedOut(false);

    let frameId = 0;
    let checkCount = 0;

    const probeElements = probes.map((probe) => {
      const element = document.createElement(probe.tagName ?? "div");
      element.className = probe.className;
      element.style.cssText = STYLE_READY_PROBE_STYLE;
      document.body.appendChild(element);

      return { element, isReady: probe.isReady };
    });

    const checkStyleReady = () => {
      if (probeElements.every(({ element, isReady }) => isReady(element))) {
        setIsStyleReady(true);
        setIsStyleVerified(true);
        return;
      }

      if (checkCount >= checkLimit) {
        setIsStyleTimedOut(true);
        setIsStyleReady(true);
        return;
      }

      checkCount += 1;
      frameId = window.requestAnimationFrame(checkStyleReady);
    };

    frameId = window.requestAnimationFrame(checkStyleReady);

    return () => {
      window.cancelAnimationFrame(frameId);
      for (const { element } of probeElements) {
        element.remove();
      }
    };
  }, [enabled, probes, checkLimit]);

  /**
   * - isStyleReady: 실제 UI 를 그려도 되는지. false 면 스켈레톤을 그린다.
   * - isStyleVerified: 프로브가 CSS 를 실제로 확인했는지. 세션 캐시는 이것으로 건다.
   *   하이드레이션에서는 isStyleReady 가 확인 전부터 true 라 그것으로 캐시하면 안 된다.
   * - isStyleTimedOut: 끝내 CSS 를 못 찾아 인라인 폴백을 얹어야 하는지.
   */
  return { isStyleReady, isStyleVerified, isStyleTimedOut };
}
