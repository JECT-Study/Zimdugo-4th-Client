import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { ControlChip } from "@repo/ui/components/control-chip";
import { IconFilter14 } from "@repo/ui/tokens/icons";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NonSearch, SearchListResults } from "#/entities/search";
import { SearchAsyncFeedback } from "#/features/search/ui/search-async-feedback/SearchAsyncFeedback";
import { SearchResultsHeading } from "#/features/search/ui/search-results-heading/SearchResultsHeading";
import { inSheetHeader } from "#/features/search/ui/search-results-heading/SearchResultsHeading.css.ts";
import { SearchResultListSkeleton } from "#/features/search/ui/search-skeleton/SearchResultListSkeleton";
import {
  type EnglishSubPolicy,
  resolveEnglishSubVisibility,
} from "#/shared/i18n/english-sub-policy";
import type { AppLocale } from "#/shared/i18n/locales";
import {
  type BottomSheetLiveOffsetState,
  type BottomSheetSnapRequest,
  DraggableBottomSheet,
  resolveBottomSheetExpandedProgress,
} from "#/shared/ui/DraggableBottomSheet";
import {
  dropdownCompact,
  emptyState,
  emptyStateResetButton,
  emptyStateStack,
  filterChip,
  headerLeadingRow,
  headerTitleSlot,
  listScrollArea,
  listStack,
  resultHeader,
  resultScrollArea,
  resultSortRow,
  sheetColumn,
} from "./SearchListBottomSheet.css.ts";
import type {
  SearchLockerResultItem,
  SearchPlaceResultItem,
  SearchResultItem,
  SearchSortDirection,
  SearchSortKey,
} from "./search-list-model";
import {
  type LockerPrimarySortType,
  type LockerSortDirection,
  sortLockerData,
} from "./sort-locker-data";

export type {
  SearchLockerResultItem,
  SearchPlaceResultItem,
  SearchResultItem,
} from "./search-list-model";

export interface SearchListSheetLiveOffsetState {
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
  onSnapStageChange?: (nextStage: SearchListSheetSnapStage) => void;
  /**
   * 프레임마다 불린다. 지도 컨트롤이 시트 윗변을 따라오게 하는 용도다.
   * 부모는 identity 가 고정된 콜백을 넘겨야 한다.
   */
  onLiveOffsetChange?: (state: SearchListSheetLiveOffsetState) => void;
  snapRequest?: SearchListSheetSnapRequest | null;
  onDismiss?: () => void;
  children?: ReactNode;
}

interface ActiveSort {
  key: SearchSortKey;
  direction: SearchSortDirection;
}

const SEARCH_LIST_MIN_TOP_OFFSET = 112;
const SEARCH_LIST_DISMISS_VISIBLE_HEIGHT = 52;
const SEARCH_LIST_DEFAULT_VISIBLE_HEIGHT = 481;
const SEARCH_LIST_DEFAULT_VISIBLE_HEIGHT_RATIO = 0.42;
const SEARCH_LIST_MINI_VISIBLE_HEIGHT = 242;
const SEARCH_LIST_MINI_VISIBLE_HEIGHT_RATIO = 0.22;
const SEARCH_LIST_DRAG_SENSITIVITY = 1.2;
const LEGACY_SEARCH_LIST_MIN_TOP_OFFSET = 0;
const LEGACY_SEARCH_LIST_MAX_TOP_OFFSET = 44;
const LEGACY_SEARCH_LIST_DEFAULT_SNAP_POINT = 331;

export type SearchBottomSheetSnapBehavior = "detail" | "legacy";
export type SearchListSheetSnapStage = "full" | "half" | "mini" | "dismiss";

export interface SearchListSheetSnapRequest {
  id: number;
  stage: SearchListSheetSnapStage;
}

export const SEARCH_BOTTOM_SHEET_SNAP_BEHAVIOR: SearchBottomSheetSnapBehavior =
  "detail";

interface ResolveSearchListSnapPointsOptions {
  windowHeight: number;
  behavior?: SearchBottomSheetSnapBehavior;
  minSnapPoint?: number;
  snapPoint?: number;
  maxSnapPoint?: number;
}

export const resolveSearchListSnapOffset = ({
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
 * 해당 단계에서 시트가 화면 하단에 차지하는 높이. 지도 컨트롤이 이 위로 올라간다.
 * full·dismiss 는 컨트롤이 시트를 피할 단계가 아니라 null 을 준다.
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
  const entries = [
    { stage: "full" as const, point: minSnapPoint },
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
  const resolvedMinSnapPoint = minSnapPoint ?? SEARCH_LIST_MIN_TOP_OFFSET;
  const resolvedSnapPoint =
    snapPoint ??
    resolveSearchListSnapOffset({
      maxSnapPoint: resolvedMaxSnapPoint,
      minSnapPoint: resolvedMinSnapPoint,
      visibleHeight: resolveSearchListVisibleHeight({
        maxVisibleHeight: SEARCH_LIST_DEFAULT_VISIBLE_HEIGHT,
        ratio: SEARCH_LIST_DEFAULT_VISIBLE_HEIGHT_RATIO,
        windowHeight,
      }),
      windowHeight,
    });
  const resolvedMiniSnapPoint = resolveSearchListSnapOffset({
    maxSnapPoint: resolvedMaxSnapPoint,
    minSnapPoint: resolvedMinSnapPoint,
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
  const [windowHeight, setWindowHeight] = useState(812);
  const [activeSort, setActiveSort] = useState<ActiveSort | null>(null);
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

  const visibleItems = useMemo(() => {
    const primarySortType: Record<SearchSortKey, LockerPrimarySortType> = {
      distance: "DISTANCE",
      updatedAt: "UPDATED_AT",
      price: "PRICE",
    };
    const sortDirection: Record<SearchSortDirection, LockerSortDirection> = {
      asc: "ASC",
      desc: "DESC",
    };
    const resolvedSort: ActiveSort = activeSort ?? {
      key: "distance",
      direction: "asc",
    };

    return sortLockerData(
      items,
      primarySortType[resolvedSort.key],
      sortDirection[resolvedSort.direction],
      new Date(),
    );
  }, [activeSort, items]);
  const isPlaceScope = Boolean(placeName);
  const hasResult = !isLoading && !isError && visibleItems.length > 0;
  const showEmpty = !isLoading && !isError && visibleItems.length === 0;
  const showFilterEmpty = showEmpty && isFilterActive;
  const showResultHeader = hasResult || isPlaceScope || showFilterEmpty;
  const showEnglishSub = resolveEnglishSubVisibility({
    appLanguage,
    policy: englishSubPolicy,
  });
  const [expandedProgress, setExpandedProgress] = useState(() =>
    resolveBottomSheetExpandedProgress({
      maxSnapPoint: resolvedMaxSnapPoint,
      minSnapPoint: resolvedMinSnapPoint,
      offset: resolvedInitialSnapPoint,
    }),
  );
  const resultHeaderStyle: CSSProperties = {
    opacity: 0.84 + expandedProgress * 0.16,
    transform: `translateY(${(1 - expandedProgress) * 6}px)`,
  };
  const sortLabels: Record<SearchSortKey, string> = {
    distance: m.search_sort_distance(),
    updatedAt: m.search_sort_recent(),
    price: m.search_sort_price(),
  };
  const resultTitleText = placeName
    ? m.search_place_lockers_title({ place: placeName })
    : undefined;

  const handleSortPress = (key: SearchSortKey) => {
    setActiveSort((previousSort) => {
      if (!previousSort || previousSort.key !== key) {
        return { key, direction: "asc" };
      }
      if (previousSort.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  };

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
  const handleSnapChange = (nextSnap: number) => {
    onSnapChange?.(nextSnap);
    onSnapStageChange?.(
      resolveSearchListSnapStage({
        maxSnapPoint: resolvedMaxSnapPoint,
        miniSnapPoint: resolvedMiniSnapPoint,
        minSnapPoint: resolvedMinSnapPoint,
        offset: nextSnap,
        snapPoint: resolvedSnapPoint,
      }),
    );
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

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <div className={sheetColumn}>
        {showResultHeader ? (
          <div className={resultHeader} style={resultHeaderStyle}>
            <div className={headerLeadingRow}>
              <div className={headerTitleSlot}>
                <SearchResultsHeading
                  className={inSheetHeader}
                  queryText={searchQuery}
                  titleText={resultTitleText}
                  resultCount={
                    hasResult || showFilterEmpty
                      ? visibleItems.length
                      : undefined
                  }
                />
              </div>
            </div>
            <div className={resultSortRow}>
              {onOpenFilter ? (
                <ControlChip
                  className={filterChip}
                  onPress={onOpenFilter}
                  variant="filter"
                  label={m.search_filter_dropdown_place_type()}
                  isActive={isFilterActive}
                  isOpen={isFilterOpen}
                  isLabelVisible={false}
                  showsIndicator={false}
                  leadingIcon={<IconFilter14 />}
                />
              ) : null}
              {(["distance", "updatedAt", "price"] as const).map((sortKey) => (
                <ControlChip
                  key={sortKey}
                  className={dropdownCompact}
                  onPress={() => handleSortPress(sortKey)}
                  variant="sort"
                  label={sortLabels[sortKey]}
                  isActive={activeSort?.key === sortKey}
                  sortDirection={
                    activeSort?.key === sortKey ? activeSort.direction : "none"
                  }
                />
              ))}
            </div>
          </div>
        ) : null}

        <div
          className={[listScrollArea, hasResult ? resultScrollArea : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {children ??
            (isLoading ? (
              <SearchResultListSkeleton />
            ) : isError ? (
              <div className={emptyState}>
                <SearchAsyncFeedback variant="result-error" onRetry={onRetry} />
              </div>
            ) : hasResult ? (
              <div className={listStack}>
                <SearchListResults
                  items={visibleItems}
                  onLockerPress={onLockerPress}
                  onPlacePress={onPlacePress}
                  onFavoriteChange={onFavoriteChange}
                  favoriteAddLabel={m.search_favorite_add()}
                  favoriteRemoveLabel={m.search_favorite_remove()}
                />
              </div>
            ) : showEmpty ? (
              <div className={emptyState}>
                <div className={emptyStateStack}>
                  <NonSearch
                    query={searchQuery}
                    showEnglishSub={showEnglishSub}
                  />
                  {showFilterEmpty && onResetFilter ? (
                    <Button
                      className={emptyStateResetButton}
                      variant="filled"
                      intent="neutral"
                      size="S"
                      onPress={onResetFilter}
                    >
                      {m.search_filter_reset()}
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null)}
        </div>
      </div>
    </DraggableBottomSheet>
  );
}
