import { BottomSheetFrame } from "@repo/ui/components/bottom-sheet-frame";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "motion/react";
import {
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  dragHandleZone,
  interactiveContent,
  sheetSurface,
  sheetWrapper,
} from "./DraggableBottomSheet.css.ts";

const INTERACTIVE_DRAG_EXCLUSION_SELECTOR =
  'button, a, input, textarea, select, [role="button"], [contenteditable="true"]';

const DRAG_START_THRESHOLD_PX = 6;
const SHEET_SETTLE_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 48,
  mass: 0.9,
  restDelta: 0.5,
} as const;

export interface BottomSheetLiveOffsetState {
  offset: number;
  expandedProgress: number;
  snapPoints: number[];
}

export interface DraggableBottomSheetProps {
  children: ReactNode;
  snapPoint: number;
  initialSnapPoint?: number;
  minSnapPoint?: number;
  miniSnapPoint?: number;
  maxSnapPoint?: number;
  dismissSnapPoint?: number;
  dragSensitivity?: number;
  onSnapChange?: (nextSnap: number) => void;
  onLiveOffsetChange?: (state: BottomSheetLiveOffsetState) => void;
  onDismiss?: () => void;
}

export const resolveBottomSheetExpandedProgress = ({
  maxSnapPoint,
  minSnapPoint,
  offset,
}: {
  maxSnapPoint: number;
  minSnapPoint: number;
  offset: number;
}) => {
  if (maxSnapPoint === minSnapPoint) {
    return 1;
  }

  const rawProgress = (maxSnapPoint - offset) / (maxSnapPoint - minSnapPoint);
  return Math.min(1, Math.max(0, rawProgress));
};

export const shouldStartBottomSheetDrag = (
  target: EventTarget | null,
  boundary: HTMLElement,
) => {
  if (!(target instanceof HTMLElement)) {
    return true;
  }

  if (target.closest(INTERACTIVE_DRAG_EXCLUSION_SELECTOR)) {
    return false;
  }

  let current: HTMLElement | null = target;
  while (current != null && current !== boundary) {
    const { overflowY } = window.getComputedStyle(current);
    const isScrollable =
      (overflowY === "auto" || overflowY === "scroll") &&
      current.scrollHeight > current.clientHeight;

    if (isScrollable) {
      return false;
    }

    current = current.parentElement;
  }

  return true;
};

interface DragState {
  startY: number;
  startSnap: number;
}

interface PendingDragState extends DragState {
  boundary: HTMLElement;
  pointerId?: number;
  startX: number;
  target: EventTarget | null;
}

type BottomSheetDragIntent = "content" | "pending" | "sheet";

const findScrollableAncestor = (
  target: EventTarget | null,
  boundary: HTMLElement,
) => {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  let current: HTMLElement | null = target;
  while (current != null && current !== boundary) {
    const { overflowY } = window.getComputedStyle(current);
    const isScrollable =
      (overflowY === "auto" || overflowY === "scroll") &&
      current.scrollHeight > current.clientHeight;

    if (isScrollable) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
};

export const resolveBottomSheetDragIntent = ({
  boundary,
  deltaX,
  deltaY,
  target,
}: {
  boundary: HTMLElement;
  deltaX: number;
  deltaY: number;
  target: EventTarget | null;
}): BottomSheetDragIntent => {
  if (!(target instanceof HTMLElement)) {
    return "sheet";
  }

  if (target.closest(INTERACTIVE_DRAG_EXCLUSION_SELECTOR)) {
    return "content";
  }

  if (Math.abs(deltaY) < DRAG_START_THRESHOLD_PX) {
    return "pending";
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return "content";
  }

  const scrollable = findScrollableAncestor(target, boundary);
  if (scrollable == null) {
    return "sheet";
  }

  const isDraggingDown = deltaY > 0;
  const isDraggingUp = deltaY < 0;
  const isAtTop = scrollable.scrollTop <= 0;
  const isAtBottom =
    scrollable.scrollTop + scrollable.clientHeight >=
    scrollable.scrollHeight - 1;

  if ((isDraggingDown && isAtTop) || (isDraggingUp && isAtBottom)) {
    return "sheet";
  }

  return "content";
};

export const resolveBottomSheetNextSnap = ({
  offsetY,
  snapPoints,
  startSnap,
}: {
  offsetY: number;
  snapPoints: number[];
  startSnap: number;
}) => {
  const projectedSnap = startSnap + offsetY;
  const direction = Math.sign(offsetY);

  return snapPoints.reduce((nearestSnap, point) => {
    const nearestDistance = Math.abs(nearestSnap - projectedSnap);
    const currentDistance = Math.abs(point - projectedSnap);

    if (currentDistance < nearestDistance) {
      return point;
    }
    if (currentDistance === nearestDistance && direction > 0) {
      return Math.max(nearestSnap, point);
    }
    if (currentDistance === nearestDistance && direction < 0) {
      return Math.min(nearestSnap, point);
    }

    return nearestSnap;
  }, snapPoints[0]);
};

export function DraggableBottomSheet({
  children,
  snapPoint,
  initialSnapPoint,
  minSnapPoint = 52,
  miniSnapPoint,
  maxSnapPoint = 760,
  dismissSnapPoint,
  dragSensitivity = 1,
  onSnapChange,
  onLiveOffsetChange,
  onDismiss,
}: DraggableBottomSheetProps) {
  const resolvedDismissSnapPoint = dismissSnapPoint ?? maxSnapPoint;
  const resolvedInitialSnap = initialSnapPoint ?? snapPoint;
  const clampSnap = useCallback(
    (value: number) => Math.min(maxSnapPoint, Math.max(minSnapPoint, value)),
    [maxSnapPoint, minSnapPoint],
  );
  const clampedInitialSnap = clampSnap(resolvedInitialSnap);
  const [_currentSnap, setCurrentSnap] = useState(clampedInitialSnap);
  const sheetOffset = useMotionValue(clampedInitialSnap);
  const sheetHeight = useMotionTemplate`calc(100dvh - ${sheetOffset}px)`;
  const dragStateRef = useRef<DragState | null>(null);
  const pendingDragStateRef = useRef<PendingDragState | null>(null);
  const activeListenersRef = useRef<{
    move: (event: MouseEvent | PointerEvent) => void;
    end: (event: MouseEvent | PointerEvent) => void;
    touchMove?: (event: TouchEvent) => void;
  } | null>(null);
  const settleAnimationRef = useRef<{ stop: () => void } | null>(null);
  const currentSnapRef = useRef(clampedInitialSnap);
  const lastInitialSnapRef = useRef<number | null>(null);
  const snapPoints = useMemo(
    () =>
      Array.from(
        new Set(
          [
            minSnapPoint,
            snapPoint,
            miniSnapPoint,
            resolvedDismissSnapPoint,
            maxSnapPoint,
          ].filter((point): point is number => point !== undefined),
        ),
      ).sort((a, b) => a - b),
    [
      maxSnapPoint,
      minSnapPoint,
      miniSnapPoint,
      resolvedDismissSnapPoint,
      snapPoint,
    ],
  );
  const notifyLiveOffsetChange = useCallback(
    (offset: number) => {
      onLiveOffsetChange?.({
        offset,
        expandedProgress: resolveBottomSheetExpandedProgress({
          maxSnapPoint,
          minSnapPoint,
          offset,
        }),
        snapPoints,
      });
    },
    [maxSnapPoint, minSnapPoint, onLiveOffsetChange, snapPoints],
  );

  useEffect(
    () =>
      sheetOffset.on("change", (offset) => {
        notifyLiveOffsetChange(clampSnap(offset));
      }),
    [clampSnap, notifyLiveOffsetChange, sheetOffset],
  );

  useEffect(() => {
    const nextSnap = clampSnap(resolvedInitialSnap);
    if (lastInitialSnapRef.current === nextSnap) {
      return;
    }

    settleAnimationRef.current?.stop();
    lastInitialSnapRef.current = nextSnap;
    currentSnapRef.current = nextSnap;
    setCurrentSnap(nextSnap);
    sheetOffset.set(nextSnap);
  }, [resolvedInitialSnap, clampSnap, sheetOffset]);

  const settleToNextSnap = useCallback(
    ({ offsetY }: { offsetY: number }) => {
      const startSnap =
        dragStateRef.current?.startSnap ?? currentSnapRef.current;
      const nextSnap = resolveBottomSheetNextSnap({
        offsetY,
        snapPoints,
        startSnap,
      });

      const clampedNextSnap = clampSnap(nextSnap);
      settleAnimationRef.current?.stop();
      settleAnimationRef.current = animate(sheetOffset, clampedNextSnap, {
        ...SHEET_SETTLE_SPRING,
        onComplete: () => {
          sheetOffset.set(clampedNextSnap);
        },
      });

      const prevSnap = currentSnapRef.current;
      currentSnapRef.current = clampedNextSnap;
      setCurrentSnap(clampedNextSnap);
      onSnapChange?.(clampedNextSnap);

      if (
        clampedNextSnap === resolvedDismissSnapPoint &&
        prevSnap !== resolvedDismissSnapPoint
      ) {
        onDismiss?.();
      }
    },
    [
      clampSnap,
      onDismiss,
      onSnapChange,
      resolvedDismissSnapPoint,
      sheetOffset,
      snapPoints,
    ],
  );

  const removeDragListeners = useCallback(() => {
    const listeners = activeListenersRef.current;
    if (listeners) {
      window.removeEventListener("pointermove", listeners.move);
      window.removeEventListener("pointerup", listeners.end);
      window.removeEventListener("pointercancel", listeners.end);
      window.removeEventListener("mousemove", listeners.move);
      window.removeEventListener("mouseup", listeners.end);
      if (listeners.touchMove) {
        window.removeEventListener("touchmove", listeners.touchMove);
      }
      activeListenersRef.current = null;
    }
  }, []);

  const handlePointerMove = useCallback(
    (event: MouseEvent | PointerEvent) => {
      let dragState = dragStateRef.current;
      const pendingDragState = pendingDragStateRef.current;

      if (dragState == null && pendingDragState != null) {
        const deltaX = event.clientX - pendingDragState.startX;
        const deltaY = event.clientY - pendingDragState.startY;
        const intent = resolveBottomSheetDragIntent({
          boundary: pendingDragState.boundary,
          deltaX,
          deltaY,
          target: pendingDragState.target,
        });

        if (intent === "pending") {
          return;
        }

        if (intent === "content") {
          pendingDragStateRef.current = null;
          removeDragListeners();
          return;
        }

        if (pendingDragState.pointerId !== undefined) {
          pendingDragState.boundary.setPointerCapture?.(
            pendingDragState.pointerId,
          );
        }
        settleAnimationRef.current?.stop();
        dragState = {
          startY: pendingDragState.startY,
          startSnap: pendingDragState.startSnap,
        };
        dragStateRef.current = dragState;
        pendingDragStateRef.current = null;
      }

      if (dragState == null) {
        return;
      }

      event.preventDefault();
      const offsetY = (event.clientY - dragState.startY) * dragSensitivity;
      const nextLiveOffset = clampSnap(dragState.startSnap + offsetY);
      sheetOffset.set(nextLiveOffset);
    },
    [clampSnap, dragSensitivity, sheetOffset, removeDragListeners],
  );

  const finishDrag = useCallback(
    (event: MouseEvent | PointerEvent) => {
      const dragState = dragStateRef.current;
      if (dragState == null) {
        pendingDragStateRef.current = null;
        removeDragListeners();
        return;
      }

      settleToNextSnap({
        offsetY: (event.clientY - dragState.startY) * dragSensitivity,
      });
      dragStateRef.current = null;
      pendingDragStateRef.current = null;
      removeDragListeners();
    },
    [dragSensitivity, removeDragListeners, settleToNextSnap],
  );

  const startPendingDrag = ({
    boundary,
    clientX,
    clientY,
    pointerId,
    target,
  }: {
    boundary: HTMLElement;
    clientX: number;
    clientY: number;
    pointerId?: number;
    target: EventTarget | null;
  }) => {
    if (target instanceof HTMLElement) {
      const isInteractive = target.closest(INTERACTIVE_DRAG_EXCLUSION_SELECTOR);
      if (isInteractive) {
        return;
      }
    }

    if (dragStateRef.current != null || pendingDragStateRef.current != null) {
      return;
    }

    pendingDragStateRef.current = {
      boundary,
      pointerId,
      startX: clientX,
      startY: clientY,
      startSnap: clampSnap(sheetOffset.get()),
      target,
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (dragStateRef.current != null && e.cancelable) {
        e.preventDefault();
      }
    };
    activeListenersRef.current = {
      move: handlePointerMove,
      end: finishDrag,
      touchMove: handleTouchMove,
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", finishDrag);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    startPendingDrag({
      boundary: event.currentTarget,
      clientX: event.clientX,
      clientY: event.clientY,
      pointerId: event.pointerId,
      target: event.target,
    });
  };

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button > 0) {
      return;
    }

    startPendingDrag({
      boundary: event.currentTarget,
      clientX: event.clientX,
      clientY: event.clientY,
      target: event.target,
    });
  };

  useEffect(
    () => () => {
      removeDragListeners();
      pendingDragStateRef.current = null;
      dragStateRef.current = null;
      settleAnimationRef.current?.stop();
    },
    [removeDragListeners],
  );

  return (
    <div className={sheetWrapper}>
      <motion.div className={sheetSurface} style={{ height: sheetHeight }}>
        <div
          className={dragHandleZone}
          onMouseDownCapture={handleMouseDown}
          onPointerDown={handlePointerDown}
          role="presentation"
        />
        <div
          className={interactiveContent}
          onMouseDownCapture={handleMouseDown}
          onPointerDown={handlePointerDown}
          role="presentation"
        >
          <BottomSheetFrame layout="nav">{children}</BottomSheetFrame>
        </div>
      </motion.div>
    </div>
  );
}
