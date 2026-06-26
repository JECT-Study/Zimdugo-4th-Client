import { BottomSheetFrame } from "@repo/ui/components/bottom-sheet-frame";
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

const SNAP_DISTANCE_THRESHOLD = 48;
const SNAP_VELOCITY_THRESHOLD = 420;

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
  const [liveOffset, setLiveOffset] = useState(clampedInitialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<DragState | null>(null);
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

  useEffect(() => {
    const nextSnap = clampSnap(resolvedInitialSnap);
    setCurrentSnap(nextSnap);
    setLiveOffset(nextSnap);
    notifyLiveOffsetChange(nextSnap);
  }, [resolvedInitialSnap, clampSnap, notifyLiveOffsetChange]);

  const settleToNextSnap = useCallback(
    ({ offsetY, velocityY }: { offsetY: number; velocityY: number }) => {
      const startSnap = dragStateRef.current?.startSnap ?? currentSnap;
      const currentIndex = snapPoints.reduce((nearestIndex, point, index) => {
        const nearestDistance = Math.abs(snapPoints[nearestIndex] - startSnap);
        const currentDistance = Math.abs(point - startSnap);
        return currentDistance < nearestDistance ? index : nearestIndex;
      }, 0);

      const hasIntent =
        Math.abs(offsetY) >= SNAP_DISTANCE_THRESHOLD ||
        Math.abs(velocityY) >= SNAP_VELOCITY_THRESHOLD;

      let nextSnap = startSnap;
      if (hasIntent) {
        if (offsetY < 0 || velocityY < -SNAP_VELOCITY_THRESHOLD) {
          const nextIndex = Math.max(0, currentIndex - 1);
          nextSnap = snapPoints[nextIndex];
        } else if (offsetY > 0 || velocityY > SNAP_VELOCITY_THRESHOLD) {
          const nextIndex = Math.min(snapPoints.length - 1, currentIndex + 1);
          nextSnap = snapPoints[nextIndex];
        }
      }

      const clampedNextSnap = clampSnap(nextSnap);
      setLiveOffset(clampedNextSnap);
      setCurrentSnap(clampedNextSnap);
      notifyLiveOffsetChange(clampedNextSnap);
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
      notifyLiveOffsetChange,
      onDismiss,
      onSnapChange,
      resolvedDismissSnapPoint,
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
      setLiveOffset(nextLiveOffset);
      notifyLiveOffsetChange(nextLiveOffset);
    },
    [clampSnap, notifyLiveOffsetChange],
  );

  const finishDrag = useCallback(
    (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (dragState == null) {
        return;
      }

      setIsDragging(false);
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
    dragStateRef.current = {
      startY: event.clientY,
      startSnap: currentSnap,
      lastY: event.clientY,
      lastTime: performance.now(),
      velocityY: 0,
    };
    setIsDragging(true);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
  };

  useEffect(
    () => () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    },
    [finishDrag, handlePointerMove],
  );

  return (
    <div
      className={sheetWrapper}
      style={{
        ["--sheet-offset" as string]: `${liveOffset}px`,
      }}
    >
      <div
        className={sheetSurface}
        style={{
          transition: isDragging ? "none" : undefined,
        }}
      >
        <div className={dragHandleZone} onPointerDown={handlePointerDown} />
        <div className={interactiveContent} onPointerDown={handlePointerDown}>
          <BottomSheetFrame layout="nav">{children}</BottomSheetFrame>
        </div>
      </div>
    </div>
  );
}
