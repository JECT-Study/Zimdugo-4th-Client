import { useEffect, useState } from "react";

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
  const [isStyleReady, setIsStyleReady] = useState(!enabled);
  const [isStyleTimedOut, setIsStyleTimedOut] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsStyleReady(true);
      setIsStyleTimedOut(false);
      return;
    }

    if (probes.length === 0) {
      setIsStyleReady(true);
      setIsStyleTimedOut(false);
      return;
    }

    setIsStyleReady(false);
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

  return { isStyleReady, isStyleTimedOut };
}
