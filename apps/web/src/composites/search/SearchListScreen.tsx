import { m } from "@repo/i18n";
import { IconFilter14 } from "@repo/ui/assets/icons";
import { Button } from "@repo/ui/components/button";
import { ControlChip } from "@repo/ui/components/control-chip";
import {
  type CSSProperties,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import { NonSearch, SearchListResults } from "#/entities/search";
import { SearchAsyncFeedback } from "#/features/search/ui/search-async-feedback/SearchAsyncFeedback";
import { SearchResultsHeading } from "#/features/search/ui/search-results-heading/SearchResultsHeading";
import { inSheetHeader } from "#/features/search/ui/search-results-heading/SearchResultsHeading.css.ts";
import { SearchResultListSkeleton } from "#/features/search/ui/search-skeleton/SearchResultListSkeleton";
import { useIsomorphicLayoutEffect } from "#/shared/hooks/useIsomorphicLayoutEffect";
import {
  type EnglishSubPolicy,
  resolveEnglishSubVisibility,
} from "#/shared/i18n/english-sub-policy";
import type { AppLocale } from "#/shared/i18n/locales";
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

type ActiveSort = { key: SearchSortKey; direction: SearchSortDirection };

/**
 * 검색 결과 목록 화면. 무엇을 담고 있는지만 안다.
 *
 * 어떤 표면에 얹히는지 — 바텀시트인지, 넓은 화면의 패널인지 — 는 모른다. 경로 라우트
 * 전환(#215)에서 화면은 Outlet 의 자식이 되고 표면은 레이아웃이 고른다. 화면이 표면을
 * 직접 렌더하면 그 선택이 라우트에 박혀, 표면을 바꿀 때 라우트를 다시 뜯게 된다.
 *
 * 표면과 주고받는 것은 두 가지다. 잰 높이를 올려보내고, 얼마나 펼쳐졌는지를 받는다.
 */
export interface SearchListScreenProps {
  searchQuery?: string;
  items?: SearchResultItem[];
  placeName?: string | null;
  appLanguage?: AppLocale;
  englishSubPolicy?: EnglishSubPolicy;
  isFilterActive?: boolean;
  isFilterOpen?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onOpenFilter?: () => void;
  onResetFilter?: () => void;
  onLockerPress?: (item: SearchLockerResultItem) => void;
  onPlacePress?: (item: SearchPlaceResultItem) => void;
  onFavoriteChange?: (item: SearchLockerResultItem, next: boolean) => void;
  children?: ReactNode;
  /**
   * 화면이 차지하는 높이. 표면이 자리를 정하는 데 쓴다.
   *
   * 결과가 없는 화면(로딩·빈 결과·오류)은 잴 콘텐츠 길이가 없어 null 을 올려보낸다.
   * 표면은 그때 콘텐츠와 무관한 기본 자리를 쓴다.
   */
  onContentHeightChange?: (contentHeightPx: number | null) => void;
  /**
   * 표면이 얼마나 펼쳐졌는지. 0 이면 접힌 자리, 1 이면 다 펼친 자리다.
   *
   * 펼침이라는 개념이 없는 표면은 기본값 1 을 그대로 둔다. 화면은 이 값을 결과
   * 헤더를 부드럽게 띄우는 데만 쓴다.
   */
  expandedProgress?: number;
}

export function SearchListScreen({
  searchQuery = "",
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
  children,
  onContentHeightChange,
  expandedProgress = 1,
}: SearchListScreenProps) {
  const [activeSort, setActiveSort] = useState<ActiveSort | null>(null);
  const headerMeasureRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  /** 늘어나지 않는 목록 자체. 스크롤 영역을 재면 시트가 준 높이가 돌아온다. */
  const listMeasureRef = useRef<HTMLDivElement | null>(null);
  /*
   * 측정 이펙트는 콘텐츠가 바뀔 때만 다시 붙는다. 콜백을 의존성에 넣으면 부모가 매
   * 렌더 새 함수를 주는 순간 ResizeObserver 가 매번 다시 붙는다.
   */
  const contentHeightChangeRef = useRef(onContentHeightChange);
  contentHeightChangeRef.current = onContentHeightChange;
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
   * full 로 올렸을 때 필요한 높이.
   *
   * 스크롤 영역이 아니라 그 안의 목록을 잰다. 스크롤 영역은 flex 로 늘어나서 내용이
   * 짧으면 scrollHeight 가 "지금 시트가 준 높이" 를 돌려준다. 그 값으로 시트 높이를
   * 정하면 높이가 바뀌고, 그걸 본 ResizeObserver 가 또 재는 순환이 된다.
   *
   * 결과가 없을 때(로딩·빈 결과·오류)는 재지 않는다. 그 화면들은 "콘텐츠 길이" 라고
   * 할 만한 게 없고, 빈 상태는 minHeight 100% 로 영역을 채우도록 되어 있어 같은
   * 순환에 걸린다.
   *
   * 첫 페인트 전에 재는 이유는 필터 시트와 같다. 그 뒤에 재면 시트가 잘못된 자리에서
   * 올라오다 옮겨 앉는 게 보인다.
   */
  useIsomorphicLayoutEffect(() => {
    const measure = () => {
      const list = listMeasureRef.current;
      const scrollArea = scrollAreaRef.current;

      if (!list || !scrollArea) {
        contentHeightChangeRef.current?.(null);
        return;
      }

      // 목록을 감싼 여백들은 목록 바깥이라 offsetHeight 에 안 잡힌다.
      const paddingOf = (element: HTMLElement) => {
        const style = window.getComputedStyle(element);

        return (
          Number.parseFloat(style.paddingTop) +
          Number.parseFloat(style.paddingBottom)
        );
      };
      const column = scrollArea.parentElement;
      const headerHeight = headerMeasureRef.current?.offsetHeight ?? 0;

      contentHeightChangeRef.current?.(
        Math.ceil(
          list.offsetHeight +
            headerHeight +
            paddingOf(scrollArea) +
            (column ? paddingOf(column) : 0),
        ),
      );
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(measure);

    if (listMeasureRef.current) observer.observe(listMeasureRef.current);
    if (headerMeasureRef.current) observer.observe(headerMeasureRef.current);

    return () => observer.disconnect();
  }, [visibleItems, hasResult]);

  return (
    <div className={sheetColumn}>
      {showResultHeader ? (
        <div
          ref={headerMeasureRef}
          className={resultHeader}
          style={resultHeaderStyle}
        >
          <div className={headerLeadingRow}>
            <div className={headerTitleSlot}>
              <SearchResultsHeading
                className={inSheetHeader}
                queryText={searchQuery}
                titleText={resultTitleText}
                resultCount={
                  hasResult || showFilterEmpty ? visibleItems.length : undefined
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
        ref={scrollAreaRef}
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
            <div ref={listMeasureRef} className={listStack}>
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
  );
}
