import { type RefObject, useEffect } from "react";

/** 이만큼 움직여야 끌기로 본다. 이보다 작으면 클릭이 흔들린 것으로 취급한다. */
const DRAG_THRESHOLD_PX = 4;

/**
 * 가로 스크롤 영역을 마우스로 잡아끌 수 있게 한다.
 *
 * 터치에서는 붙이지 않는다. 브라우저가 이미 관성까지 붙여 처리하는데 스크롤 위치를
 * 직접 쓰면 그 동작을 빼앗는다. 마우스에만 스크롤바 없이 끌 수단이 없어서 필요하다.
 *
 * 끄는 동안에는 스크롤 스냅을 잠시 끈다. 스냅이 켜져 있으면 손을 움직이는 중에도
 * 브라우저가 가까운 항목으로 되돌려 끌리지 않는다. 손을 떼면 되돌려서 그 자리에서
 * 스냅이 걸리게 한다.
 */
export const useDragScroll = (ref: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let activePointerId: number | null = null;
    let startClientX = 0;
    let startScrollLeft = 0;
    let hasDragged = false;
    let previousSnapType = "";
    let previousCursor = "";

    const stopDragging = () => {
      if (activePointerId === null) return;

      if (element.hasPointerCapture?.(activePointerId)) {
        element.releasePointerCapture(activePointerId);
      }

      activePointerId = null;
      element.style.scrollSnapType = previousSnapType;
      element.style.cursor = previousCursor;
    };

    const handlePointerDown = (event: PointerEvent) => {
      // 마우스 왼쪽 버튼만. 터치는 브라우저에 맡기고 오른쪽 버튼은 메뉴를 연다.
      if (event.pointerType === "touch" || event.button !== 0) return;

      activePointerId = event.pointerId;
      startClientX = event.clientX;
      startScrollLeft = element.scrollLeft;
      hasDragged = false;

      previousSnapType = element.style.scrollSnapType;
      previousCursor = element.style.cursor;
      element.style.scrollSnapType = "none";

      element.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;

      const movedX = event.clientX - startClientX;

      if (!hasDragged && Math.abs(movedX) >= DRAG_THRESHOLD_PX) {
        hasDragged = true;
        element.style.cursor = "grabbing";
      }

      if (!hasDragged) return;

      element.scrollLeft = startScrollLeft - movedX;
    };

    /**
     * 끌고 손을 떼면 그 아래 항목의 클릭이 뒤이어 발생한다. 사진을 넘기려던
     * 것이었는데 미리보기가 열려버리므로, 실제로 끈 경우에만 막는다.
     */
    const handleClickCapture = (event: MouseEvent) => {
      if (!hasDragged) return;

      hasDragged = false;
      event.preventDefault();
      event.stopPropagation();
    };

    // 이미지를 잡으면 브라우저가 기본 끌기(고스트 이미지)를 시작한다.
    const handleDragStart = (event: Event) => event.preventDefault();

    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", stopDragging);
    element.addEventListener("pointercancel", stopDragging);
    element.addEventListener("click", handleClickCapture, true);
    element.addEventListener("dragstart", handleDragStart);

    return () => {
      stopDragging();
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", stopDragging);
      element.removeEventListener("pointercancel", stopDragging);
      element.removeEventListener("click", handleClickCapture, true);
      element.removeEventListener("dragstart", handleDragStart);
    };
  }, [ref]);
};
