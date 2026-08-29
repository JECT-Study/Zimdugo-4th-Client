import { type RefObject, useEffect } from "react";

/** 이만큼 움직여야 끌기로 본다. 이보다 작으면 클릭이 흔들린 것으로 취급한다. */
const DRAG_THRESHOLD_PX = 4;

/**
 * 다이얼을 마우스로 잡아 돌릴 수 있게 한다.
 *
 * 터치에서는 붙이지 않는다. 브라우저가 이미 관성까지 붙여 처리하는데 스크롤 위치를
 * 직접 쓰면 그 동작을 빼앗는다. 마우스에는 휠밖에 없어서 필요하다.
 *
 * 끄는 동안에는 스크롤 스냅을 꺼 둔다. 스냅이 켜져 있으면 손을 움직이는 중에도
 * 브라우저가 가까운 항목으로 되돌려 끌리지 않는다. 손을 떼면 되돌려서 그 자리에서
 * 스냅이 걸리게 한다. 값 확정은 다이얼이 이미 스크롤이 멎는 것을 보고 하므로
 * 여기서 따로 알릴 필요가 없다.
 */
export const useDialDrag = (ref: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let activePointerId: number | null = null;
    let startClientY = 0;
    let startScrollTop = 0;
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
      startClientY = event.clientY;
      startScrollTop = element.scrollTop;
      hasDragged = false;

      previousSnapType = element.style.scrollSnapType;
      previousCursor = element.style.cursor;
      element.style.scrollSnapType = "none";
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;

      const movedY = event.clientY - startClientY;

      if (!hasDragged && Math.abs(movedY) >= DRAG_THRESHOLD_PX) {
        hasDragged = true;
        element.style.cursor = "grabbing";

        /*
         * 포인터를 잡는 시점을 여기까지 미룬다. 잡고 있으면 뒤따르는 click 이
         * 실제로 눌린 요소가 아니라 잡은 요소로 전달된다.
         */
        element.setPointerCapture?.(event.pointerId);
      }

      if (!hasDragged) return;

      element.scrollTop = startScrollTop - movedY;
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;

      stopDragging();
    };

    element.addEventListener("pointerdown", handlePointerDown);
    // 잡기 전에는 영역 밖 이벤트가 요소로 오지 않아 창에서 듣는다.
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);

    return () => {
      stopDragging();
      element.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
    };
  }, [ref]);
};
