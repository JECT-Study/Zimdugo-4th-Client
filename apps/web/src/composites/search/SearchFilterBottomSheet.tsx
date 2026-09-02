import { useEffect, useState } from "react";
import {
  createDefaultSearchFilters,
  type SearchFilterAppliedState,
  SearchFilterScreen,
} from "./SearchFilterScreen";

/**
 * 필터 상태 타입과 기본값은 화면이 정의한다. 부르는 쪽(검색 세션·필터 변환)이 이미
 * 이 파일에서 가져다 쓰고 있어 그대로 내보낸다. 화면 자체는 쓰는 쪽이 직접 가져간다.
 */
export { createDefaultSearchFilters, type SearchFilterAppliedState };

import { useSafeAreaInsetTop } from "#/shared/hooks/useSafeAreaInsetTop";
import { useViewportHeight } from "#/shared/hooks/useViewportHeight";
import {
  resolveSheetFullSnapPoint,
  resolveSheetTopLimitPx,
} from "#/shared/lib/app-chrome-layout";
import {
  type BottomSheetLiveOffsetState,
  DraggableBottomSheet,
  resolveBottomSheetExpandedProgress,
} from "#/shared/ui/DraggableBottomSheet";

export interface SearchFilterBottomSheetProps {
  className?: string;
  initialFilters?: SearchFilterAppliedState;
  snapBehavior?: SearchBottomSheetSnapBehavior;
  animateOnMount?: boolean;
  initialSnapPoint?: number;
  minSnapPoint?: number;
  snapPoint?: number;
  maxSnapPoint?: number;
  onCollapseToResults?: () => void;
  onReset?: () => void;
  onApply?: (filters: SearchFilterAppliedState) => void;
  onSnapChange?: (nextSnap: number) => void;
}

const LEGACY_SEARCH_FILTER_FULL_TOP_OFFSET = 52;
const SEARCH_FILTER_DISMISS_VISIBLE_HEIGHT = 24;
const SEARCH_FILTER_DRAG_SENSITIVITY = 1.2;
/** 시트가 콘텐츠 위에 늘 두는 자리. 화면이 잰 높이에 이만큼을 더해야 실제 높이다. */
const SEARCH_FILTER_SHEET_TOP_PADDING = 16;

type SearchBottomSheetSnapBehavior = "detail" | "legacy";
const SEARCH_BOTTOM_SHEET_SNAP_BEHAVIOR: SearchBottomSheetSnapBehavior =
  "detail";

interface ResolveSearchFilterSnapPointsOptions {
  windowHeight: number;
  /** 노치에 덮이는 높이. full 상한을 그만큼 함께 내린다. */
  safeAreaInsetTopPx?: number;
  behavior?: SearchBottomSheetSnapBehavior;
  minSnapPoint?: number;
  snapPoint?: number;
  maxSnapPoint?: number;
  contentHeight?: number;
}

export const resolveLegacySearchFilterSnapPoints = ({
  maxSnapPoint,
  minSnapPoint,
  snapPoint,
  windowHeight,
}: Omit<ResolveSearchFilterSnapPointsOptions, "behavior">) => {
  const resolvedMaxSnapPoint =
    maxSnapPoint ?? windowHeight - SEARCH_FILTER_DISMISS_VISIBLE_HEIGHT;
  const resolvedMinSnapPoint =
    minSnapPoint ?? LEGACY_SEARCH_FILTER_FULL_TOP_OFFSET;
  const resolvedSnapPoint = snapPoint ?? resolvedMinSnapPoint;
  const resolvedMiniSnapPoint =
    resolvedSnapPoint + (resolvedMaxSnapPoint - resolvedSnapPoint) / 2;

  return {
    maxSnapPoint: resolvedMaxSnapPoint,
    miniSnapPoint: resolvedMiniSnapPoint,
    minSnapPoint: resolvedMinSnapPoint,
    snapPoint: resolvedSnapPoint,
  };
};

export const resolveSearchFilterSnapPoints = ({
  behavior = SEARCH_BOTTOM_SHEET_SNAP_BEHAVIOR,
  maxSnapPoint,
  minSnapPoint,
  snapPoint,
  windowHeight,
  contentHeight,
  safeAreaInsetTopPx = 0,
}: ResolveSearchFilterSnapPointsOptions) => {
  if (behavior === "legacy") {
    return resolveLegacySearchFilterSnapPoints({
      maxSnapPoint,
      minSnapPoint,
      snapPoint,
      windowHeight,
    });
  }

  const resolvedMaxSnapPoint =
    maxSnapPoint ?? windowHeight - SEARCH_FILTER_DISMISS_VISIBLE_HEIGHT;
  const resolvedMinSnapPoint =
    minSnapPoint ??
    resolveSheetFullSnapPoint({
      contentHeight,
      topLimitPx: resolveSheetTopLimitPx(safeAreaInsetTopPx),
      maxSnapPoint: resolvedMaxSnapPoint,
      windowHeight,
    });
  const resolvedSnapPoint = snapPoint ?? resolvedMinSnapPoint;

  return {
    maxSnapPoint: resolvedMaxSnapPoint,
    miniSnapPoint: undefined,
    minSnapPoint: resolvedMinSnapPoint,
    snapPoint: resolvedSnapPoint,
  };
};

/**
 * 필터 화면을 바텀시트라는 표면에 얹는다.
 *
 * 표면이 아는 것은 자리 계산뿐이다. 화면이 무엇을 담고 있는지는 모르고, 잰 높이만
 * 받아 스냅 지점을 정한다. 넓은 화면에서 다른 표면을 쓰게 되면 이 파일 대신 그
 * 표면이 같은 화면을 감싼다.
 */
export function SearchFilterBottomSheet({
  className,
  initialFilters,
  snapBehavior = SEARCH_BOTTOM_SHEET_SNAP_BEHAVIOR,
  animateOnMount = false,
  initialSnapPoint,
  minSnapPoint,
  snapPoint,
  maxSnapPoint,
  onCollapseToResults,
  onReset,
  onApply,
  onSnapChange,
}: SearchFilterBottomSheetProps) {
  const windowHeight = useViewportHeight();
  const safeAreaInsetTop = useSafeAreaInsetTop();
  const [screenHeight, setScreenHeight] = useState<number | undefined>();
  const {
    maxSnapPoint: resolvedMaxSnapPoint,
    miniSnapPoint: resolvedMiniSnapPoint,
    minSnapPoint: resolvedMinSnapPoint,
    snapPoint: resolvedSnapPoint,
  } = resolveSearchFilterSnapPoints({
    behavior: snapBehavior,
    maxSnapPoint,
    minSnapPoint,
    snapPoint,
    windowHeight,
    contentHeight:
      screenHeight === undefined
        ? undefined
        : screenHeight + SEARCH_FILTER_SHEET_TOP_PADDING,
    safeAreaInsetTopPx: safeAreaInsetTop,
  });
  const resolvedInitialSnapPoint =
    initialSnapPoint !== undefined
      ? Math.min(
          resolvedMaxSnapPoint,
          Math.max(resolvedMinSnapPoint, initialSnapPoint),
        )
      : resolvedSnapPoint;
  const [expandedProgress, setExpandedProgress] = useState(() =>
    resolveBottomSheetExpandedProgress({
      maxSnapPoint: resolvedMaxSnapPoint,
      minSnapPoint: resolvedMinSnapPoint,
      offset: resolvedInitialSnapPoint,
    }),
  );

  const handleLiveOffsetChange = ({
    expandedProgress: nextExpandedProgress,
  }: BottomSheetLiveOffsetState) => {
    setExpandedProgress(nextExpandedProgress);
  };

  useEffect(() => {
    setExpandedProgress(
      resolveBottomSheetExpandedProgress({
        maxSnapPoint: resolvedMaxSnapPoint,
        minSnapPoint: resolvedMinSnapPoint,
        offset: resolvedInitialSnapPoint,
      }),
    );
  }, [resolvedMaxSnapPoint, resolvedMinSnapPoint, resolvedInitialSnapPoint]);

  return (
    <DraggableBottomSheet
      snapPoint={resolvedSnapPoint}
      initialSnapPoint={resolvedInitialSnapPoint}
      minSnapPoint={resolvedMinSnapPoint}
      miniSnapPoint={resolvedMiniSnapPoint}
      maxSnapPoint={resolvedMaxSnapPoint}
      dragSensitivity={SEARCH_FILTER_DRAG_SENSITIVITY}
      animateOnMount={animateOnMount}
      showHomeIndicator={false}
      onSnapChange={onSnapChange}
      onLiveOffsetChange={handleLiveOffsetChange}
      onDismiss={onCollapseToResults}
    >
      <SearchFilterScreen
        className={className}
        initialFilters={initialFilters}
        onReset={onReset}
        onApply={onApply}
        onContentHeightChange={setScreenHeight}
        expandedProgress={expandedProgress}
      />
    </DraggableBottomSheet>
  );
}
