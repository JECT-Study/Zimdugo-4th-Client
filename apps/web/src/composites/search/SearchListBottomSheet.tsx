import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSafeAreaInsetTop } from "#/shared/hooks/useSafeAreaInsetTop";
import { useViewportHeight } from "#/shared/hooks/useViewportHeight";
import type { EnglishSubPolicy } from "#/shared/i18n/english-sub-policy";
import type { AppLocale } from "#/shared/i18n/locales";
import {
  resolveSheetFullStageSnapPoint,
  resolveSheetTopLimitPx,
} from "#/shared/lib/app-chrome-layout";
import {
  type BottomSheetLiveOffsetState,
  type BottomSheetSnapRequest,
  DraggableBottomSheet,
  resolveBottomSheetExpandedProgress,
} from "#/shared/ui/DraggableBottomSheet";
import { SearchListScreen } from "./SearchListScreen";
import type {
  SearchLockerResultItem,
  SearchPlaceResultItem,
  SearchResultItem,
} from "./search-list-model";

interface SearchListSheetLiveOffsetState {
  /** 뷰포트 상단부터 시트 상단까지 거리. `100dvh - offsetPx` 가 시트가 차지하는 높이다. */
  offsetPx: number;
  /** 마운트 슬라이드 진행도. 0 이면 시트가 아직 화면 밖, 1 이면 제자리다. */
  mountProgress: number;
  /** 오프셋이 목표 스냅에 닿았는지. 스냅 애니메이션 중에는 false 다. */
  isSettled: boolean;
}

export interface SearchListBottomSheetProps {
  searchQuery: string;
  items?: SearchResultItem[];
  appLanguage?: AppLocale;
  englishSubPolicy?: EnglishSubPolicy;
  onOpenFilter?: () => void;
  onResetFilter?: () => void;
  isFilterActive?: boolean;
  isFilterOpen?: boolean;
  placeName?: string | null;
  onLockerPress?: (item: SearchLockerResultItem) => void;
  onPlacePress?: (item: SearchPlaceResultItem) => void;
  onFavoriteChange?: (item: SearchLockerResultItem, next: boolean) => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  animateOnMount?: boolean;
  snapBehavior?: SearchBottomSheetSnapBehavior;
  minSnapPoint?: number;
  snapPoint?: number;
  initialSnapPoint?: number;
  maxSnapPoint?: number;
  onSnapChange?: (nextSnap: number) => void;
  /**
   * 두 번째 인자는 그 단계에서 시트가 실제로 차지하는 높이다. full 은 화면
   * 높이에 따라 달라지므로 상수로 정할 수 없다. dismiss 면 null 이다.
   */
  onSnapStageChange?: (
    nextStage: SearchListSheetSnapStage,
    visibleHeightPx: number | null,
  ) => void;
  /**
   * 프레임마다 불린다. 지도 컨트롤이 시트 윗변을 따라오게 하는 용도다.
   * 부모는 identity 가 고정된 콜백을 넘겨야 한다.
   */
  onLiveOffsetChange?: (state: SearchListSheetLiveOffsetState) => void;
  snapRequest?: SearchListSheetSnapRequest | null;
  onDismiss?: () => void;
  children?: ReactNode;
}

const SEARCH_LIST_DISMISS_VISIBLE_HEIGHT = 52;
const SEARCH_LIST_DEFAULT_VISIBLE_HEIGHT = 481;
const SEARCH_LIST_DEFAULT_VISIBLE_HEIGHT_RATIO = 0.42;
const SEARCH_LIST_MINI_VISIBLE_HEIGHT = 242;
const SEARCH_LIST_MINI_VISIBLE_HEIGHT_RATIO = 0.22;
const SEARCH_LIST_DRAG_SENSITIVITY = 1.2;
const LEGACY_SEARCH_LIST_MIN_TOP_OFFSET = 0;
const LEGACY_SEARCH_LIST_MAX_TOP_OFFSET = 44;
const LEGACY_SEARCH_LIST_DEFAULT_SNAP_POINT = 331;

type SearchBottomSheetSnapBehavior = "detail" | "legacy";
export type SearchListSheetSnapStage = "full" | "half" | "mini" | "dismiss";

interface SearchListSheetSnapRequest {
  id: number;
  stage: SearchListSheetSnapStage;
}

const SEARCH_BOTTOM_SHEET_SNAP_BEHAVIOR: SearchBottomSheetSnapBehavior =
  "detail";

interface ResolveSearchListSnapPointsOptions {
  windowHeight: number;
  behavior?: SearchBottomSheetSnapBehavior;
  minSnapPoint?: number;
  snapPoint?: number;
  maxSnapPoint?: number;
  /** 노치에 덮이는 높이. legacy 단계 계산에는 쓰지 않는다. */
  safeAreaInsetTopPx?: number;
  /** 잰 콘텐츠 높이. full 을 이 높이만큼만 올린다. */
  fullContentHeight?: number | null;
}

const resolveSearchListSnapOffset = ({
  maxSnapPoint,
  minSnapPoint,
  visibleHeight,
  windowHeight,
}: {
  maxSnapPoint: number;
  minSnapPoint: number;
  visibleHeight: number;
  windowHeight: number;
}) =>
  Math.min(maxSnapPoint, Math.max(minSnapPoint, windowHeight - visibleHeight));

export const resolveSearchListVisibleHeight = ({
  maxVisibleHeight,
  ratio,
  windowHeight,
}: {
  maxVisibleHeight: number;
  ratio: number;
  windowHeight: number;
}) => Math.min(maxVisibleHeight, Math.round(windowHeight * ratio));

/**
 * 단계별 기본 높이. 시트가 아직 자기 스냅을 못 정했을 때 쓰는 초기값이다.
 *
 * full 은 최소 상단 여백까지 올라가므로 여기서 정할 수 없다. 실제 값은 시트가
 * onSnapStageChange 로 올려 준다. dismiss 는 사실상 닫힌 상태라 null 이다.
 */
export const resolveSearchListStageVisibleHeight = (
  stage: SearchListSheetSnapStage,
  windowHeight: number,
) => {
  if (stage === "mini") {
    return resolveSearchListVisibleHeight({
      maxVisibleHeight: SEARCH_LIST_MINI_VISIBLE_HEIGHT,
      ratio: SEARCH_LIST_MINI_VISIBLE_HEIGHT_RATIO,
      windowHeight,
    });
  }

  if (stage === "half") {
    return resolveSearchListVisibleHeight({
      maxVisibleHeight: SEARCH_LIST_DEFAULT_VISIBLE_HEIGHT,
      ratio: SEARCH_LIST_DEFAULT_VISIBLE_HEIGHT_RATIO,
      windowHeight,
    });
  }

  return null;
};

export const resolveSearchListSnapStage = ({
  maxSnapPoint,
  miniSnapPoint,
  minSnapPoint,
  offset,
  snapPoint,
}: {
  maxSnapPoint: number;
  miniSnapPoint: number;
  minSnapPoint: number;
  offset: number;
  snapPoint: number;
}): SearchListSheetSnapStage => {
  /*
   * 콘텐츠가 half 보다 짧으면 full 은 half 와 같은 자리를 가리킨다. 그때는 후보에서
   * 뺀다. 남겨 두면 같은 픽셀을 full 로 읽어, 실제로는 half 인데 "half 일 때만" 인
   * 규칙(지도를 눌러 접기)이 막힌다.
   */
  const entries = [
    ...(minSnapPoint === snapPoint
      ? []
      : [{ stage: "full" as const, point: minSnapPoint }]),
    { stage: "half" as const, point: snapPoint },
    { stage: "mini" as const, point: miniSnapPoint },
    { stage: "dismiss" as const, point: maxSnapPoint },
  ];

  return entries.reduce((nearestEntry, entry) =>
    Math.abs(entry.point - offset) < Math.abs(nearestEntry.point - offset)
      ? entry
      : nearestEntry,
  ).stage;
};

export const resolveLegacySearchListSnapPoints = ({
  maxSnapPoint,
  minSnapPoint,
  snapPoint,
  windowHeight,
}: Omit<ResolveSearchListSnapPointsOptions, "behavior">) => {
  const resolvedMinSnapPoint =
    minSnapPoint ?? LEGACY_SEARCH_LIST_MIN_TOP_OFFSET;
  const resolvedSnapPoint = snapPoint ?? LEGACY_SEARCH_LIST_DEFAULT_SNAP_POINT;
  const resolvedMaxSnapPoint =
    maxSnapPoint ?? windowHeight - LEGACY_SEARCH_LIST_MAX_TOP_OFFSET;
  const resolvedMiniSnapPoint =
    resolvedSnapPoint + (resolvedMaxSnapPoint - resolvedSnapPoint) / 2;

  return {
    maxSnapPoint: resolvedMaxSnapPoint,
    miniSnapPoint: resolvedMiniSnapPoint,
    minSnapPoint: resolvedMinSnapPoint,
    snapPoint: resolvedSnapPoint,
  };
};

export const resolveSearchListSnapPoints = ({
  behavior = SEARCH_BOTTOM_SHEET_SNAP_BEHAVIOR,
  maxSnapPoint,
  minSnapPoint,
  snapPoint,
  windowHeight,
  safeAreaInsetTopPx = 0,
  fullContentHeight,
}: ResolveSearchListSnapPointsOptions) => {
  if (behavior === "legacy") {
    return resolveLegacySearchListSnapPoints({
      maxSnapPoint,
      minSnapPoint,
      snapPoint,
      windowHeight,
    });
  }

  const resolvedMaxSnapPoint =
    maxSnapPoint ?? windowHeight - SEARCH_LIST_DISMISS_VISIBLE_HEIGHT;
  const topLimitPx = resolveSheetTopLimitPx(safeAreaInsetTopPx);
  /*
   * 단계들이 넘어설 수 없는 바닥.
   *
   * 호출자가 경계를 직접 주면 그것을 쓴다. 화면 기준으로만 재면 자연 half 가 그 경계
   * 위로 올라가 스냅 순서가 뒤집힌다. 호출자가 주는 값은 콘텐츠와 무관하게 고정이라,
   * 이것을 바닥으로 삼아도 결과가 도착할 때 단계가 흔들리지 않는다.
   */
  const stageFloorPx = minSnapPoint ?? topLimitPx;
  /*
   * half·mini 는 화면 높이에서만 나온다.
   *
   * 콘텐츠 기반 full 로 자르면 결과가 도착해 높이가 바뀔 때 이 두 단계까지 따라
   * 움직인다. 그러면 시트가 초기 위치를 새로 요청받은 것으로 보고, 사용자가 옮겨 둔
   * 단계를 무시한 채 그 자리로 뛴다.
   */
  const halfSnapPoint = resolveSearchListSnapOffset({
    maxSnapPoint: resolvedMaxSnapPoint,
    minSnapPoint: stageFloorPx,
    visibleHeight: resolveSearchListVisibleHeight({
      maxVisibleHeight: SEARCH_LIST_DEFAULT_VISIBLE_HEIGHT,
      ratio: SEARCH_LIST_DEFAULT_VISIBLE_HEIGHT_RATIO,
      windowHeight,
    }),
    windowHeight,
  });
  /*
   * 호출자가 half 를 직접 주면 그것이 이 시트의 half 다. 화면에서 나온 기본값으로
   * full 을 판정하면, 지정한 half 보다 아래에 있는 full 을 살려 두게 되어 단계 순서가
   * 뒤집힌다.
   */
  const resolvedSnapPoint = snapPoint ?? halfSnapPoint;
  const fullStageSnapPoint = resolveSheetFullStageSnapPoint({
    contentHeight: fullContentHeight,
    halfSnapPoint: resolvedSnapPoint,
    topLimitPx,
    maxSnapPoint: resolvedMaxSnapPoint,
    windowHeight,
  });
  /*
   * full 이 설 자리가 없으면 half 가 시트의 끝이다. 두 단계를 같은 자리에 겹쳐 두면
   * 시트가 픽셀에서 단계를 되찾지 못한다.
   */
  const resolvedMinSnapPoint =
    minSnapPoint ?? fullStageSnapPoint ?? resolvedSnapPoint;
  const resolvedMiniSnapPoint = resolveSearchListSnapOffset({
    maxSnapPoint: resolvedMaxSnapPoint,
    minSnapPoint: stageFloorPx,
    visibleHeight: resolveSearchListVisibleHeight({
      maxVisibleHeight: SEARCH_LIST_MINI_VISIBLE_HEIGHT,
      ratio: SEARCH_LIST_MINI_VISIBLE_HEIGHT_RATIO,
      windowHeight,
    }),
    windowHeight,
  });

  return {
    maxSnapPoint: resolvedMaxSnapPoint,
    miniSnapPoint: resolvedMiniSnapPoint,
    minSnapPoint: resolvedMinSnapPoint,
    snapPoint: resolvedSnapPoint,
  };
};

/**
 * 목록 화면을 바텀시트라는 표면에 얹는다.
 *
 * 표면이 아는 것은 자리 계산과 단계 알림뿐이다. 화면이 무엇을 담고 있는지는 모르고,
 * 잰 높이만 받아 스냅 지점을 정한다. 넓은 화면에서 다른 표면을 쓰게 되면 이 파일 대신
 * 그 표면이 같은 화면을 감싼다.
 */
export function SearchListBottomSheet({
  searchQuery,
  items = [],
  appLanguage = "ko",
  englishSubPolicy = "auto",
  onOpenFilter,
  onResetFilter,
  isFilterActive = false,
  isFilterOpen = false,
  placeName = null,
  onLockerPress,
  onPlacePress,
  onFavoriteChange,
  isLoading = false,
  isError = false,
  onRetry,
  animateOnMount = false,
  snapBehavior = SEARCH_BOTTOM_SHEET_SNAP_BEHAVIOR,
  minSnapPoint,
  snapPoint,
  initialSnapPoint,
  maxSnapPoint,
  onSnapChange,
  onSnapStageChange,
  onLiveOffsetChange,
  snapRequest,
  onDismiss,
  children,
}: SearchListBottomSheetProps) {
  const windowHeight = useViewportHeight();
  const safeAreaInsetTop = useSafeAreaInsetTop();
  const [fullContentHeight, setFullContentHeight] = useState<number | null>(
    null,
  );
  const {
    maxSnapPoint: resolvedMaxSnapPoint,
    miniSnapPoint: resolvedMiniSnapPoint,
    minSnapPoint: resolvedMinSnapPoint,
    snapPoint: resolvedSnapPoint,
  } = resolveSearchListSnapPoints({
    behavior: snapBehavior,
    maxSnapPoint,
    minSnapPoint,
    snapPoint,
    windowHeight,
    safeAreaInsetTopPx: safeAreaInsetTop,
    fullContentHeight,
  });
  const resolvedInitialSnapPoint =
    initialSnapPoint !== undefined
      ? Math.min(
          resolvedMaxSnapPoint,
          Math.max(resolvedMinSnapPoint, initialSnapPoint),
        )
      : resolvedSnapPoint;
  const resolvedSnapRequest: BottomSheetSnapRequest | null = snapRequest
    ? {
        id: snapRequest.id,
        snapPoint:
          snapRequest.stage === "full"
            ? resolvedMinSnapPoint
            : snapRequest.stage === "half"
              ? resolvedSnapPoint
              : snapRequest.stage === "mini"
                ? resolvedMiniSnapPoint
                : resolvedMaxSnapPoint,
      }
    : null;

  const [expandedProgress, setExpandedProgress] = useState(() =>
    resolveBottomSheetExpandedProgress({
      maxSnapPoint: resolvedMaxSnapPoint,
      minSnapPoint: resolvedMinSnapPoint,
      offset: resolvedInitialSnapPoint,
    }),
  );

  /**
   * 프레임마다 불린다. identity 가 매 렌더 바뀌면 시트 쪽 구독 effect 가
   * 그때마다 떼었다 붙으므로 useCallback 으로 고정한다.
   */
  const handleLiveOffsetChange = useCallback(
    ({
      expandedProgress,
      mountProgress,
      offset,
      isSettled,
    }: BottomSheetLiveOffsetState) => {
      setExpandedProgress(expandedProgress);
      onLiveOffsetChange?.({ offsetPx: offset, mountProgress, isSettled });
    },
    [onLiveOffsetChange],
  );
  /**
   * 그 단계에서 시트가 화면 하단에 차지하는 높이.
   *
   * full 을 단계 상수로만 보면 컨트롤 쪽이 "밀어 올릴 자리가 없다" 로만 알고
   * 기본 위치로 되돌린다. 그 자리는 시트 뒤라 보이지도 눌리지도 않는다.
   * 실제 높이를 올려 보내 컨트롤 쪽이 직접 판단하게 한다. 상세 시트와 같다.
   */
  const resolveStageVisibleHeight = (stage: SearchListSheetSnapStage) =>
    stage === "dismiss"
      ? null
      : Math.max(
          0,
          windowHeight -
            (stage === "full"
              ? resolvedMinSnapPoint
              : stage === "half"
                ? resolvedSnapPoint
                : resolvedMiniSnapPoint),
        );

  /**
   * 같은 값을 두 번 알리지 않는다.
   *
   * 단계가 바뀔 때는 onSnapChange 와 같은 틱에 알려야 해서 handleSnapChange 가
   * 직접 부르고, 화면 높이가 바뀌어 자리만 달라지는 경우는 아래 이펙트가 부른다.
   */
  /**
   * 지금 안착해 있는 단계. 픽셀 오프셋이 아니라 단계를 들고 있어야 한다.
   *
   * 첫 렌더의 스냅 지점은 가정 높이(812)로 계산된 값이다. 마운트 뒤 실제 높이가
   * 들어오면 스냅 지점이 전부 바뀌는데, 그때 예전 오프셋을 새 스냅들과 견주면
   * 엉뚱한 단계로 분류된다. 667px 화면이면 471 이 half 가 아니라 mini 로 읽혀,
   * 실제로는 280px 인 시트를 147px 로 알리게 된다.
   *
   * 단계는 화면 높이와 무관한 의미 단위라 그대로 두면 된다. 높이는 그때그때
   * 현재 스냅 지점으로 다시 계산한다.
   */
  const [currentSnapStage, setCurrentSnapStage] =
    useState<SearchListSheetSnapStage>(() =>
      resolveSearchListSnapStage({
        maxSnapPoint: resolvedMaxSnapPoint,
        miniSnapPoint: resolvedMiniSnapPoint,
        minSnapPoint: resolvedMinSnapPoint,
        offset: resolvedInitialSnapPoint,
        snapPoint: resolvedSnapPoint,
      }),
    );
  const lastStageNoticeRef = useRef<string | null>(null);
  const notifySnapStage = useCallback(
    (stage: SearchListSheetSnapStage, visibleHeightPx: number | null) => {
      const key = `${stage}|${visibleHeightPx}`;
      if (lastStageNoticeRef.current === key) {
        return;
      }

      lastStageNoticeRef.current = key;
      onSnapStageChange?.(stage, visibleHeightPx);
    },
    [onSnapStageChange],
  );

  const handleSnapChange = (nextSnap: number) => {
    onSnapChange?.(nextSnap);

    const nextStage = resolveSearchListSnapStage({
      maxSnapPoint: resolvedMaxSnapPoint,
      miniSnapPoint: resolvedMiniSnapPoint,
      minSnapPoint: resolvedMinSnapPoint,
      offset: nextSnap,
      snapPoint: resolvedSnapPoint,
    });

    setCurrentSnapStage(nextStage);
    notifySnapStage(nextStage, resolveStageVisibleHeight(nextStage));
  };

  /**
   * 마운트 시점과 화면 높이가 바뀔 때도 알린다.
   *
   * DraggableBottomSheet 는 마운트할 때 onSnapChange 를 부르지 않는다. 목록을
   * full 로 둔 채 상세로 갔다 돌아오면 시트는 half 로 다시 마운트되는데, 알림이
   * 없으면 부모는 직전 높이를 그대로 들고 있어 컨트롤이 엉뚱한 자리에 놓인다.
   */
  useEffect(() => {
    notifySnapStage(
      currentSnapStage,
      resolveStageVisibleHeight(currentSnapStage),
    );
  });

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
      dragSensitivity={SEARCH_LIST_DRAG_SENSITIVITY}
      animateOnMount={animateOnMount}
      showHomeIndicator={false}
      snapRequest={resolvedSnapRequest}
      onSnapChange={handleSnapChange}
      onLiveOffsetChange={handleLiveOffsetChange}
      onDismiss={onDismiss}
    >
      <SearchListScreen
        searchQuery={searchQuery}
        items={items}
        placeName={placeName}
        appLanguage={appLanguage}
        englishSubPolicy={englishSubPolicy}
        isFilterActive={isFilterActive}
        isFilterOpen={isFilterOpen}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        onOpenFilter={onOpenFilter}
        onResetFilter={onResetFilter}
        onLockerPress={onLockerPress}
        onPlacePress={onPlacePress}
        onFavoriteChange={onFavoriteChange}
        onContentHeightChange={setFullContentHeight}
        expandedProgress={expandedProgress}
      >
        {children}
      </SearchListScreen>
    </DraggableBottomSheet>
  );
}
