import { BottomSheetFrame } from "@repo/ui/components/bottom-sheet-frame";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "motion/react";
import {
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

const SNAP_VELOCITY_PROJECTION_MS = 120;
const MAX_VELOCITY_PROJECTION_PX = 96;
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
  lastY: number;
  lastTime: number;
  velocityY: number;
}

export function DraggableBottomSheet({
  children,
  snapPoint,
  initialSnapPoint,
  minSnapPoint = 52,
  miniSnapPoint,
  maxSnapPoint = 760,
  dismissSnapPoint,
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
  const [currentSnap, setCurrentSnap] = useState(clampedInitialSnap);
  const sheetOffset = useMotionValue(clampedInitialSnap);
  const sheetHeight = useMotionTemplate`calc(100dvh - ${sheetOffset}px)`;
  const dragStateRef = useRef<DragState | null>(null);
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
    ({ offsetY, velocityY }: { offsetY: number; velocityY: number }) => {
      const startSnap = dragStateRef.current?.startSnap ?? currentSnap;
      const velocityProjection = Math.min(
        MAX_VELOCITY_PROJECTION_PX,
        Math.max(
          -MAX_VELOCITY_PROJECTION_PX,
          (velocityY * SNAP_VELOCITY_PROJECTION_MS) / 1000,
        ),
      );
      const direction = Math.sign(offsetY || velocityY);
      const projectedSnap = clampSnap(startSnap + offsetY + velocityProjection);
      const nextSnap = snapPoints.reduce((nearestSnap, point) => {
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

      const clampedNextSnap = clampSnap(nextSnap);
      settleAnimationRef.current?.stop();
      settleAnimationRef.current = animate(sheetOffset, clampedNextSnap, {
        ...SHEET_SETTLE_SPRING,
        onComplete: () => {
          sheetOffset.set(clampedNextSnap);
        },
      });
      currentSnapRef.current = clampedNextSnap;
      setCurrentSnap(clampedNextSnap);
      onSnapChange?.(clampedNextSnap);

      if (
        clampedNextSnap === resolvedDismissSnapPoint &&
        currentSnap !== resolvedDismissSnapPoint
      ) {
        onDismiss?.();
      }
    },
    [
      clampSnap,
      currentSnap,
      onDismiss,
      onSnapChange,
      resolvedDismissSnapPoint,
      sheetOffset,
      snapPoints,
    ],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (dragState == null) {
        return;
      }

      const now = performance.now();
      const elapsed = Math.max(1, now - dragState.lastTime);
      dragState.velocityY =
        ((event.clientY - dragState.lastY) / elapsed) * 1000;
      dragState.lastY = event.clientY;
      dragState.lastTime = now;

      const nextLiveOffset = clampSnap(
        dragState.startSnap + event.clientY - dragState.startY,
      );
      sheetOffset.set(nextLiveOffset);
    },
    [clampSnap, sheetOffset],
  );

  const finishDrag = useCallback(
    (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (dragState == null) {
        return;
      }

      settleToNextSnap({
        offsetY: event.clientY - dragState.startY,
        velocityY: dragState.velocityY,
      });
      dragStateRef.current = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    },
    [handlePointerMove, settleToNextSnap],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!shouldStartBottomSheetDrag(event.target, event.currentTarget)) {
      return;
    }

    event.currentTarget.setPointerCapture?.(event.pointerId);
    settleAnimationRef.current?.stop();
    dragStateRef.current = {
      startY: event.clientY,
      startSnap: clampSnap(sheetOffset.get()),
      lastY: event.clientY,
      lastTime: performance.now(),
      velocityY: 0,
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
  };

  useEffect(
    () => () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
      settleAnimationRef.current?.stop();
    },
    [finishDrag, handlePointerMove],
  );

  return (
    <div className={sheetWrapper}>
      <motion.div className={sheetSurface} style={{ height: sheetHeight }}>
        <div className={dragHandleZone} onPointerDown={handlePointerDown} />
        <div className={interactiveContent} onPointerDown={handlePointerDown}>
          <BottomSheetFrame layout="nav">{children}</BottomSheetFrame>
        </div>
      </motion.div>
    </div>
  );
}
