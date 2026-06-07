import {
  type RefObject,
  useLayoutEffect,
  useState,
} from "react";

/** ~3s @ 60fps — CSS 청크 지연 대비 */
const STYLE_READY_CHECK_LIMIT = 180;
/** CSS가 즉시 준비돼도 스피너가 너무 짧게 깜빡이지 않도록 */
const MIN_SPINNER_MS = 280;

const isReportContainerReady = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);

  return style.position === "relative" && style.overflow === "hidden";
};

const isReportContentAreaReady = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);

  return (
    style.display === "flex" &&
    style.flexDirection === "column" &&
    style.overflowY === "auto"
  );
};

const isReportBottomBarReady = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);

  return style.position === "fixed" && parseInt(style.zIndex, 10) >= 100;
};

const isReportStepWrapperReady = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);

  return (
    style.display === "flex" &&
    style.flexDirection === "column" &&
    style.gap === "32px"
  );
};

export type ReportPageReadyTargets = {
  containerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  bottomBarRef: RefObject<HTMLElement | null>;
  stepWrapperRef: RefObject<HTMLElement | null>;
};

const areMountedTargetsReady = ({
  containerRef,
  contentRef,
  bottomBarRef,
  stepWrapperRef,
}: ReportPageReadyTargets) => {
  const container = containerRef.current;
  const content = contentRef.current;
  const bottomBar = bottomBarRef.current;
  const stepWrapper = stepWrapperRef.current;

  if (!container || !content || !bottomBar || !stepWrapper) {
    return false;
  }

  return (
    isReportContainerReady(container) &&
    isReportContentAreaReady(content) &&
    isReportBottomBarReady(bottomBar) &&
    isReportStepWrapperReady(stepWrapper)
  );
};

/**
 * Report 페이지 DOM에 vanilla-extract CSS가 적용됐는지 확인한다.
 * CSS 청크 도착 전에는 스피너(인라인 스타일)만 보이고, 본문은 숨긴다.
 */
export function useReportPageReady({
  containerRef,
  contentRef,
  bottomBarRef,
  stepWrapperRef,
}: ReportPageReadyTargets) {
  const [isPageReady, setIsPageReady] = useState(false);
  const [isStyleTimedOut, setIsStyleTimedOut] = useState(false);

  useLayoutEffect(() => {
    setIsPageReady(false);
    setIsStyleTimedOut(false);

    const mountedAt = performance.now();
    let frameId = 0;
    let timeoutId = 0;
    let checkCount = 0;
    let isCancelled = false;

    const markReady = (timedOut: boolean) => {
      if (isCancelled) return;

      const reveal = () => {
        if (isCancelled) return;
        if (timedOut) {
          setIsStyleTimedOut(true);
        }
        setIsPageReady(true);
      };

      const elapsed = performance.now() - mountedAt;
      const remaining = MIN_SPINNER_MS - elapsed;

      if (remaining <= 0) {
        frameId = window.requestAnimationFrame(() => {
          frameId = window.requestAnimationFrame(reveal);
        });
        return;
      }

      timeoutId = window.setTimeout(() => {
        frameId = window.requestAnimationFrame(() => {
          frameId = window.requestAnimationFrame(reveal);
        });
      }, remaining);
    };

    const checkReady = () => {
      if (isCancelled) return;

      if (
        areMountedTargetsReady({
          containerRef,
          contentRef,
          bottomBarRef,
          stepWrapperRef,
        })
      ) {
        markReady(false);
        return;
      }

      if (checkCount >= STYLE_READY_CHECK_LIMIT) {
        markReady(true);
        return;
      }

      checkCount += 1;
      frameId = window.requestAnimationFrame(checkReady);
    };

    frameId = window.requestAnimationFrame(checkReady);

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [bottomBarRef, containerRef, contentRef, stepWrapperRef]);

  return { isPageReady, isStyleTimedOut };
}
