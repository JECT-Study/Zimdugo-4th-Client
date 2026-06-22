import { type RefObject, useEffect } from "react";

const resetDocumentScroll = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const scrollFocusedElementIntoView = (
  container: HTMLElement,
  target: HTMLElement,
) => {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const style = window.getComputedStyle(container);
  const paddingTop = Number.parseFloat(style.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(style.paddingBottom) || 0;

  const visibleTop = containerRect.top + paddingTop;
  const visibleBottom = containerRect.bottom - paddingBottom;

  if (targetRect.top < visibleTop) {
    container.scrollTop += targetRect.top - visibleTop;
    return;
  }

  if (targetRect.bottom > visibleBottom) {
    container.scrollTop += targetRect.bottom - visibleBottom;
  }
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

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !container.contains(target)) {
        return;
      }

      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        frameId = 0;
        if (!container.isConnected) return;

        resetDocumentScroll();
        scrollFocusedElementIntoView(container, target);
      });
    };

    container.addEventListener("focusin", handleFocusIn, true);
    return () => {
      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }
      container.removeEventListener("focusin", handleFocusIn, true);
    };
  }, [contentRef, enabled]);
}
