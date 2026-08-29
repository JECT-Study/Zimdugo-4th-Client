import { type RefObject, useEffect } from "react";

/** 이만큼 움직여야 끌기로 본다. 이보다 작으면 클릭이 흔들린 것으로 취급한다. */
const DRAG_THRESHOLD_PX = 4;

/** 손을 뗀 뒤 관성으로 더 나아가는 시간. 이 값이 클수록 튕기듯 멀리 간다. */
const COAST_MS = 110;

/** 목표 위치까지 미끄러지는 시간. */
const SETTLE_MS = 320;

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

export interface DragScrollOptions {
  /** 손을 뗐을 때 항목을 어디에 맞출지. CSS `scroll-snap-align` 과 같은 뜻이다. */
  snapAlign?: "start" | "center";
  /**
   * ref 가 가리키는 요소가 생기거나 바뀌는 시점을 알려주는 값.
   *
   * ref 객체는 내용이 바뀌어도 identity 가 그대로라 effect 가 다시 돌지 않는다.
   * 목록이 빈 채로 먼저 그려졌다가 나중에 채워지는 화면에서는 이 값이 없으면
   * 리스너가 영영 붙지 않는다.
   */
  targetKey?: unknown;
}

/**
 * 가로 스크롤 영역을 마우스로 잡아끌 수 있게 한다.
 *
 * 터치에서는 붙이지 않는다. 브라우저가 이미 관성까지 붙여 처리하는데 스크롤 위치를
 * 직접 쓰면 그 동작을 빼앗는다. 마우스에만 스크롤바 없이 끌 수단이 없어서 필요하다.
 *
 * 끄는 동안에는 스크롤 스냅을 꺼 둔다. 스냅이 켜져 있으면 손을 움직이는 중에도
 * 브라우저가 가까운 항목으로 되돌려 끌리지 않는다. 손을 떼면 놓은 속도만큼 더
 * 나아간 지점에서 가장 가까운 항목까지 직접 미끄러뜨린 뒤 스냅을 되돌린다.
 * 스냅을 그냥 되돌리면 그 자리에서 툭 끊기며 튄다.
 */
export const useDragScroll = (
  ref: RefObject<HTMLElement | null>,
  { snapAlign = "start", targetKey }: DragScrollOptions = {},
) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: targetKey 는 effect 안에서 읽지 않는다. ref 가 가리키는 요소가 바뀌었다는 신호로만 쓰므로 의존성에 있어야 한다.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let activePointerId: number | null = null;
    let startClientX = 0;
    let startScrollLeft = 0;
    let hasDragged = false;
    let previousSnapType = "";
    let previousCursor = "";
    let settleFrameId: number | null = null;

    // 손을 뗀 순간의 속도를 재려면 마지막 두 지점이 필요하다.
    let lastClientX = 0;
    let lastMoveTime = 0;
    let previousClientX = 0;
    let previousMoveTime = 0;

    const cancelSettling = () => {
      if (settleFrameId === null) return;

      cancelAnimationFrame(settleFrameId);
      settleFrameId = null;
    };

    const restoreSnapType = () => {
      element.style.scrollSnapType = previousSnapType;
    };

    /** 놓은 지점에서 가장 가까운 항목의 스크롤 위치. */
    const resolveSettleTarget = (projectedScrollLeft: number) => {
      const children = [...element.children] as HTMLElement[];
      if (children.length === 0) return null;

      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      const elementLeft = element.getBoundingClientRect().left;

      const targets = children.map((child) => {
        const rect = child.getBoundingClientRect();
        const childScrollLeft = element.scrollLeft + (rect.left - elementLeft);
        const aligned =
          snapAlign === "center"
            ? childScrollLeft - (element.clientWidth - rect.width) / 2
            : childScrollLeft;

        return Math.min(maxScrollLeft, Math.max(0, aligned));
      });

      return targets.reduce((nearest, target) =>
        Math.abs(target - projectedScrollLeft) <
        Math.abs(nearest - projectedScrollLeft)
          ? target
          : nearest,
      );
    };

    const settleTo = (target: number) => {
      const from = element.scrollLeft;
      const distance = target - from;

      if (distance === 0 || prefersReducedMotion()) {
        element.scrollLeft = target;
        restoreSnapType();
        return;
      }

      const startTime = performance.now();

      const step = () => {
        const progress = Math.min(
          1,
          (performance.now() - startTime) / SETTLE_MS,
        );
        element.scrollLeft = from + distance * easeOutCubic(progress);

        if (progress < 1) {
          settleFrameId = requestAnimationFrame(step);
          return;
        }

        settleFrameId = null;
        // 목표가 이미 스냅 위치라 되돌려도 튀지 않는다.
        restoreSnapType();
      };

      settleFrameId = requestAnimationFrame(step);
    };

    const stopDragging = () => {
      if (activePointerId === null) return;

      if (element.hasPointerCapture?.(activePointerId)) {
        element.releasePointerCapture(activePointerId);
      }

      activePointerId = null;
      element.style.cursor = previousCursor;

      if (!hasDragged) {
        restoreSnapType();
        return;
      }

      const elapsed = lastMoveTime - previousMoveTime;
      // 같은 시각의 두 지점으로는 속도를 낼 수 없다. 관성 없이 제자리에서 맞춘다.
      const velocity =
        elapsed > 0 ? (lastClientX - previousClientX) / elapsed : 0;
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      const projected = Math.min(
        maxScrollLeft,
        Math.max(0, element.scrollLeft - velocity * COAST_MS),
      );

      const target = resolveSettleTarget(projected);
      if (target === null) {
        restoreSnapType();
        return;
      }

      settleTo(target);
    };

    const handlePointerDown = (event: PointerEvent) => {
      // 마우스 왼쪽 버튼만. 터치는 브라우저에 맡기고 오른쪽 버튼은 메뉴를 연다.
      if (event.pointerType === "touch" || event.button !== 0) return;

      cancelSettling();

      activePointerId = event.pointerId;
      startClientX = event.clientX;
      startScrollLeft = element.scrollLeft;
      hasDragged = false;

      lastClientX = event.clientX;
      lastMoveTime = event.timeStamp;
      previousClientX = event.clientX;
      previousMoveTime = event.timeStamp;

      // 미끄러지는 중에 다시 잡으면 이미 스냅이 꺼져 있다. 그때 값을 덮어쓰면
      // "none" 을 원래 값으로 기억해 스냅이 영영 돌아오지 않는다.
      if (settleFrameId === null) {
        previousSnapType = element.style.scrollSnapType;
      }
      previousCursor = element.style.cursor;
      element.style.scrollSnapType = "none";

      element.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;

      previousClientX = lastClientX;
      previousMoveTime = lastMoveTime;
      lastClientX = event.clientX;
      lastMoveTime = event.timeStamp;

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
      cancelSettling();
      stopDragging();
      restoreSnapType();
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", stopDragging);
      element.removeEventListener("pointercancel", stopDragging);
      element.removeEventListener("click", handleClickCapture, true);
      element.removeEventListener("dragstart", handleDragStart);
    };
  }, [ref, snapAlign, targetKey]);
};
