import { BottomSheetFrame } from "@repo/ui/components/bottom-sheet-frame";
import { motion, useAnimation, useDragControls } from "motion/react";
import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  dragHandleZone,
  interactiveContent,
  sheetWrapper,
} from "./DraggableBottomSheet.css.ts";

export interface DraggableBottomSheetProps {
  children: ReactNode;
  /** 중간(하프) 스냅 위치 */
  snapPoint: number;
  /** 첫 렌더 시 시작 스냅. 미지정 시 snapPoint에서 시작 */
  initialSnapPoint?: number;
  minSnapPoint?: number;
  maxSnapPoint?: number;
  onSnapChange?: (nextSnap: number) => void;
}

/**
 * 드래그 가능한 바텀시트.
 * [minSnapPoint, snapPoint, maxSnapPoint] 3단 스냅을 지원합니다.
 */
export function DraggableBottomSheet({
  children,
  snapPoint,
  initialSnapPoint,
  minSnapPoint = 52,
  maxSnapPoint = 760,
  onSnapChange,
}: DraggableBottomSheetProps) {
  const controls = useAnimation();
  const dragControls = useDragControls();
  const resolvedInitialSnap = initialSnapPoint ?? snapPoint;
  const [currentSnap, setCurrentSnap] = useState(resolvedInitialSnap);
  const [liveOffset, setLiveOffset] = useState(resolvedInitialSnap);
  const dragStartSnapRef = useRef(resolvedInitialSnap);
  const DRAG_ELASTIC = 0.05;
  const SNAP_DISTANCE_THRESHOLD = 48;
  const SNAP_VELOCITY_THRESHOLD = 420;

  useEffect(() => {
    setCurrentSnap(resolvedInitialSnap);
    setLiveOffset(resolvedInitialSnap);
    dragStartSnapRef.current = resolvedInitialSnap;
  }, [resolvedInitialSnap]);

  useEffect(() => {
    controls.start({ y: currentSnap });
  }, [currentSnap, controls]);

  const handleDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragControls.start(event);
  };

  const clampOffset = (value: number) =>
    Math.min(maxSnapPoint, Math.max(minSnapPoint, value));

  return (
    <motion.div
      className={sheetWrapper}
      style={{ ["--sheet-offset" as string]: `${liveOffset}px` }}
      initial={{ y: "100%" }}
      animate={controls}
      exit={{ y: "100%" }}
      drag="y"
      dragConstraints={{
        // motion은 위쪽이 -, 아래쪽이 +이므로 max가 bottom(더 큰 양수), min이 top(더 작은 양수)
        top: minSnapPoint,
        bottom: maxSnapPoint,
      }}
      dragControls={dragControls}
      dragListener={false}
      dragElastic={DRAG_ELASTIC}
      dragMomentum={false}
      onDragStart={() => {
        dragStartSnapRef.current = currentSnap;
      }}
      onDrag={(_, info) => {
        const nextLiveOffset = clampOffset(
          dragStartSnapRef.current + info.offset.y,
        );
        setLiveOffset(nextLiveOffset);
      }}
      onDragEnd={(_, info) => {
        const offsetY = info.offset.y;
        const velocityY = info.velocity.y;

        const snapPoints = Array.from(
          new Set([minSnapPoint, snapPoint, maxSnapPoint]),
        ).sort((a, b) => a - b);

        const currentIndex = snapPoints.reduce((nearestIndex, point, index) => {
          const nearestDistance = Math.abs(
            snapPoints[nearestIndex] - currentSnap,
          );
          const currentDistance = Math.abs(point - currentSnap);
          return currentDistance < nearestDistance ? index : nearestIndex;
        }, 0);

        const hasIntent =
          Math.abs(offsetY) >= SNAP_DISTANCE_THRESHOLD ||
          Math.abs(velocityY) >= SNAP_VELOCITY_THRESHOLD;

        let nextSnap = currentSnap;
        if (hasIntent) {
          // 리액트-모션 좌표계: 위로 드래그 = offsetY가 음수 -> 더 작은 snapPoint(위쪽)로 이동
          // 아래로 드래그 = offsetY가 양수 -> 더 큰 snapPoint(아래쪽)로 이동
          if (offsetY < 0 || velocityY < -SNAP_VELOCITY_THRESHOLD) {
            const nextIndex = Math.max(0, currentIndex - 1);
            nextSnap = snapPoints[nextIndex];
          } else if (offsetY > 0 || velocityY > SNAP_VELOCITY_THRESHOLD) {
            const nextIndex = Math.min(snapPoints.length - 1, currentIndex + 1);
            nextSnap = snapPoints[nextIndex];
          }
        }

        const clampedNextSnap = clampOffset(nextSnap);
        controls.start({ y: clampedNextSnap });
        setLiveOffset(clampedNextSnap);
        setCurrentSnap(clampedNextSnap);
        onSnapChange?.(clampedNextSnap);
      }}
      transition={{ type: "spring", damping: 30, stiffness: 200 }}
    >
      <div className={dragHandleZone} onPointerDown={handleDragStart} />
      <div className={interactiveContent}>
        <BottomSheetFrame layout="nav">{children}</BottomSheetFrame>
      </div>
    </motion.div>
  );
}
