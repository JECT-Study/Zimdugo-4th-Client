import { type RefObject, useEffect } from "react";

const resetDocumentScroll = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

/** 키보드·주소창 등으로 visual viewport가 줄어든 만큼 하단 inset */
const getVisualViewportBottomInset = () => {
  if (typeof window === "undefined") return 0;

  const viewport = window.visualViewport;
  if (!viewport) return 0;

  return Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
};

export const scrollFocusedElementIntoView = (
  container: HTMLElement,
  target: HTMLElement,
) => {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const style = window.getComputedStyle(container);
  const paddingTop = Number.parseFloat(style.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(style.paddingBottom) || 0;
  const viewportBottomInset = getVisualViewportBottomInset();

  const visibleTop = containerRect.top + paddingTop;
  const visibleBottom =
    containerRect.bottom - paddingBottom - viewportBottomInset;

  if (targetRect.top < visibleTop) {
    container.scrollTop += targetRect.top - visibleTop;
    return;
  }

  if (targetRect.bottom > visibleBottom) {
    container.scrollTop += targetRect.bottom - visibleBottom;
  }
};

const scheduleScrollIntoView = (
  container: HTMLElement,
  target: HTMLElement,
  onFrameId: (frameId: number) => void,
) => {
  const run = () => {
    if (!container.isConnected || !target.isConnected) return;
    if (document.activeElement !== target) return;

    resetDocumentScroll();
    scrollFocusedElementIntoView(container, target);
  };

  // 키보드 애니메이션·레이아웃 안정화를 위해 2프레임 후 한 번 더 조정
  const firstFrameId = requestAnimationFrame(() => {
    run();
    const secondFrameId = requestAnimationFrame(run);
    onFrameId(secondFrameId);
  });
  onFrameId(firstFrameId);
};

/**
 * body가 overflow:hidden인 앱 셸에서 포커스가 document/visual viewport를
 * 밀어 레이아웃이 깨지는 현상을 막고, report 본문 스크롤 컨테이너 안에서만 이동한다.
 */
export function useReportContentFocusScroll(
  contentRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    const container = contentRef.current;
    if (!container) return;

    let frameId = 0;
    let focusedTarget: HTMLElement | null = null;

    const cancelScheduledFrame = () => {
      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const scrollFocusedTarget = () => {
      if (!focusedTarget || !container.contains(focusedTarget)) return;

      cancelScheduledFrame();
      scheduleScrollIntoView(container, focusedTarget, (nextFrameId) => {
        frameId = nextFrameId;
      });
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !container.contains(target)) {
        return;
      }

      focusedTarget = target;
      scrollFocusedTarget();
    };

    const handleFocusOut = (event: FocusEvent) => {
      const target = event.target;
      if (target === focusedTarget) {
        focusedTarget = null;
      }
    };

    const viewport = window.visualViewport;
    const handleViewportChange = () => {
      if (!focusedTarget) return;
      scrollFocusedTarget();
    };

    container.addEventListener("focusin", handleFocusIn, true);
    container.addEventListener("focusout", handleFocusOut, true);
    viewport?.addEventListener("resize", handleViewportChange);
    viewport?.addEventListener("scroll", handleViewportChange);

    return () => {
      cancelScheduledFrame();
      container.removeEventListener("focusin", handleFocusIn, true);
      container.removeEventListener("focusout", handleFocusOut, true);
      viewport?.removeEventListener("resize", handleViewportChange);
      viewport?.removeEventListener("scroll", handleViewportChange);
    };
  }, [contentRef, enabled]);
}
