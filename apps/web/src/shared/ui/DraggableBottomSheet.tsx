import { BottomSheetFrame } from "@repo/ui/components/bottom-sheet-frame";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
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
/** 시트가 스냅 지점으로 안착할 때 쓰는 스프링. 시트를 따라 움직이는 UI 도 같은 값을 쓴다. */
export const SHEET_SETTLE_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 48,
  mass: 0.9,
  restDelta: 0.5,
} as const;

/** 오프셋이 목표에 닿았다고 볼 허용 오차 */
const SETTLED_EPSILON_PX = 0.5;

export interface BottomSheetLiveOffsetState {
  offset: number;
  expandedProgress: number;
  snapPoints: number[];
  /**
   * 마운트 슬라이드 진행도. 0 이면 시트가 아직 화면 밖, 1 이면 제자리다.
   *
   * offset 은 마운트 첫 프레임부터 최종 스냅 값이라 시트가 실제로 어디까지
   * 올라왔는지는 알려 주지 못한다. 시트 윗변에 붙어 다니는 요소는 이 값을
   * 함께 봐야 올라오는 동안 허공에 뜨지 않는다.
   */
  mountProgress: number;
  /**
   * 오프셋이 목표 스냅에 닿았는지.
   *
   * settleToSnapPoint 는 스프링을 시작하자마자 onSnapChange 를 부른다. 단계로만
   * 위치를 정하면 시트가 아직 움직이는 중에 컨트롤이 먼저 최종 자리로 튄다.
   * 시트 윗변을 따라다니는 요소는 안착까지 이 값을 봐야 한다.
   */
  isSettled: boolean;
}

export interface BottomSheetSnapRequest {
  id: number;
  snapPoint: number;
}

export interface DraggableBottomSheetProps {
  children: ReactNode;
  snapPoint: number;
  /**
   * 마운트 시 시트가 열릴 위치. 시트를 특정 단계로 "여는" 방법은 이 prop 하나다.
   * 생략하면 snapPoint 로 연다.
   */
  initialSnapPoint?: number;
  minSnapPoint?: number;
  miniSnapPoint?: number;
  maxSnapPoint?: number;
  dismissSnapPoint?: number;
  dragSensitivity?: number;
  animateOnMount?: boolean;
  showHomeIndicator?: boolean;
  /**
   * 이미 떠 있는 시트를 다른 단계로 옮길 때 쓴다. id 를 올려 새 요청임을 알린다.
   *
   * 마운트 시점에 들어와 있는 요청은 무시한다. 이 prop 은 부모 state 라 소비돼도
   * 남아 있어서, 리마운트된 시트가 과거 요청을 그대로 재생하는 것을 막을 방법이
   * 마운트 시점 판정밖에 없다. 그래서 "시트를 특정 단계로 연다" 는 initialSnapPoint
   * 담당이고, 이 prop 은 "마운트 이후의 전환" 만 담당한다. 마운트와 같은 렌더에
   * 새 요청을 실어 보내면 조용히 무시되므로 initialSnapPoint 를 써야 한다.
   */
  snapRequest?: BottomSheetSnapRequest | null;
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
  animateOnMount = false,
  showHomeIndicator = true,
  snapRequest = null,
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
  /**
   * 마운트 슬라이드를 값으로 소유한다.
   *
   * 예전에는 initial/animate 로 y 를 선언해 두어 진행도를 밖에서 알 수 없었다.
   * 여기서 파생하면 y 와 진행도가 같은 값에서 나오므로 어긋날 수가 없다.
   */
  const mountProgress = useMotionValue(animateOnMount ? 0 : 1);
  // 마운트 시점의 값만 본다. 이 prop 은 부모 state 라 나중에 바뀔 수 있는데,
  // 그때 슬라이드를 다시 재생하면 떠 있던 시트가 아래에서 올라온다.
  const animateAtMountRef = useRef(animateOnMount);
  const mountTranslateY = useTransform(
    mountProgress,
    (progress) => `${(1 - progress) * 100}%`,
  );
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
  /**
   * 이미 처리한 스냅 요청 id. 마운트 시점의 요청은 처리된 것으로 본다(snapRequest 참고).
   *
   * key 변경으로 시트가 리마운트되면(예: 다른 핀을 눌러 상세 보관함이 바뀔 때) 이 ref 가
   * 초기화되는데, 부모가 아직 들고 있는 과거 요청을 새 요청으로 오인해 다시 재생하면서
   * half 로 열려야 할 시트가 직전 단계(mini 등)로 되돌아갔다. 부모가 요청을 비우는
   * 이펙트로는 막을 수 없다 — 자식 이펙트가 부모보다 먼저 실행되기 때문이다.
   */
  const lastSnapRequestIdRef = useRef<number | null>(snapRequest?.id ?? null);
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
        mountProgress: mountProgress.get(),
        // 스프링이 끝나면 onComplete 가 목표값을 그대로 넣어 정확히 일치하지만,
        // 도중 프레임의 부동소수 오차까지 "미안착" 으로 보지 않도록 여유를 둔다.
        isSettled:
          Math.abs(offset - currentSnapRef.current) < SETTLED_EPSILON_PX,
      });
    },
    [maxSnapPoint, minSnapPoint, mountProgress, onLiveOffsetChange, snapPoints],
  );

  useEffect(() => {
    // 구독을 걸면서 현재 값을 한 번 흘려 준다.
    //
    // change 만 듣고 있으면 마운트 시점 값이 부모에 도달하지 않는다. 아래 초기
    // 스냅 동기화가 돌긴 하지만 sheetOffset 이 이미 그 값으로 만들어져 있어서
    // 같은 값 set 이 되고, motion 은 값이 그대로면 change 를 띄우지 않는다
    // (motion-dom MotionValue.updateAndNotify 의 current !== prev 검사).
    // 그러면 부모는 첫 드래그나 스냅 전환 전까지 시트가 어디 있는지 모르고,
    // 이 값으로 자리를 잡는 쪽은 그동안 시트 뒤에 깔린 채 남는다.
    notifyLiveOffsetChange(clampSnap(sheetOffset.get()));

    const unsubscribeOffset = sheetOffset.on("change", (offset) => {
      notifyLiveOffsetChange(clampSnap(offset));
    });
    const unsubscribeMount = mountProgress.on("change", () => {
      notifyLiveOffsetChange(clampSnap(sheetOffset.get()));
    });

    return () => {
      unsubscribeOffset();
      unsubscribeMount();
    };
  }, [clampSnap, mountProgress, notifyLiveOffsetChange, sheetOffset]);

  useEffect(() => {
    if (!animateAtMountRef.current) {
      return;
    }

    const mountAnimation = animate(mountProgress, 1, SHEET_SETTLE_SPRING);

    return () => mountAnimation.stop();
  }, [mountProgress]);

  useEffect(() => {
    const nextInitialSnap = clampSnap(resolvedInitialSnap);
    const currentClampedSnap = clampSnap(currentSnapRef.current);
    const shouldSyncInitialSnap =
      lastInitialSnapRef.current !== nextInitialSnap;

    if (
      !shouldSyncInitialSnap &&
      currentSnapRef.current === currentClampedSnap
    ) {
      return;
    }

    settleAnimationRef.current?.stop();
    const nextSnap = shouldSyncInitialSnap
      ? nextInitialSnap
      : currentClampedSnap;
    lastInitialSnapRef.current = nextInitialSnap;
    currentSnapRef.current = nextSnap;
    setCurrentSnap(nextSnap);
    sheetOffset.set(nextSnap);
  }, [resolvedInitialSnap, clampSnap, sheetOffset]);

  const settleToSnapPoint = useCallback(
    (nextSnap: number) => {
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
    [clampSnap, onDismiss, onSnapChange, resolvedDismissSnapPoint, sheetOffset],
  );

  const settleToNextSnap = useCallback(
    ({ offsetY }: { offsetY: number }) => {
      const startSnap =
        dragStateRef.current?.startSnap ?? currentSnapRef.current;
      const nextSnap = resolveBottomSheetNextSnap({
        offsetY,
        snapPoints,
        startSnap,
      });

      settleToSnapPoint(nextSnap);
    },
    [settleToSnapPoint, snapPoints],
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
    if (event.button !== 0) {
      return;
    }

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

  useEffect(() => {
    if (
      snapRequest == null ||
      lastSnapRequestIdRef.current === snapRequest.id
    ) {
      return;
    }

    lastSnapRequestIdRef.current = snapRequest.id;
    settleToSnapPoint(snapRequest.snapPoint);
  }, [settleToSnapPoint, snapRequest]);

  return (
    <div className={sheetWrapper}>
      <motion.div
        className={sheetSurface}
        style={{ height: sheetHeight, y: mountTranslateY }}
      >
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
          <BottomSheetFrame layout="nav" showHomeIndicator={showHomeIndicator}>
            {children}
          </BottomSheetFrame>
        </div>
      </motion.div>
    </div>
  );
}
