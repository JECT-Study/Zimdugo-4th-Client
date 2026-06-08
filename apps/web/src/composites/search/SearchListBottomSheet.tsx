import { m } from "@repo/i18n";
import { ControlChip } from "@repo/ui/components/control-chip";
import { IconChevronLeft13, IconFilter14 } from "@repo/ui/tokens/icons";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { NonSearch, SearchListResults } from "#/entities/search";
import { SearchAsyncFeedback } from "#/features/search/ui/search-async-feedback/SearchAsyncFeedback";
import { SearchResultsHeading } from "#/features/search/ui/search-results-heading/SearchResultsHeading";
import { SearchResultListSkeleton } from "#/features/search/ui/search-skeleton/SearchResultListSkeleton";
import {
  type EnglishSubPolicy,
  resolveEnglishSubVisibility,
} from "#/shared/i18n/english-sub-policy";
import type { AppLocale } from "#/shared/i18n/locales";
import { DraggableBottomSheet } from "#/shared/ui/DraggableBottomSheet";
import {
  dropdownCompact,
  emptyState,
  filterChip,
  listScrollArea,
  listStack,
  headerLeadingButton,
  headerLeadingRow,
  resultHeader,
  resultScrollArea,
  resultSortRow,
  sheetColumn,
} from "./SearchListBottomSheet.css.ts";
import {
  filterSearchResults,
  type SearchLockerResultItem,
  type SearchResultItem,
  type SearchSortDirection,
  type SearchSortKey,
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

export interface SearchListBottomSheetProps {
  searchQuery: string;
  items?: SearchResultItem[];
  appLanguage?: AppLocale;
  englishSubPolicy?: EnglishSubPolicy;
  onOpenFilter?: () => void;
  isFilterActive?: boolean;
  isFilterOpen?: boolean;
  placeName?: string | null;
  onLockerPress?: (item: SearchLockerResultItem) => void;
  onFavoriteChange?: (item: SearchLockerResultItem, next: boolean) => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  showHeaderBack?: boolean;
  onHeaderBackPress?: () => void;
  minSnapPoint?: number;
  snapPoint?: number;
  maxSnapPoint?: number;
  onSnapChange?: (nextSnap: number) => void;
  children?: ReactNode;
}

interface ActiveSort {
  key: SearchSortKey;
  direction: SearchSortDirection;
}

const SORT_LABEL_FALLBACKS: Record<AppLocale, Record<SearchSortKey, string>> = {
  ko: { distance: "거리순", updatedAt: "최신순", price: "가격순" },
  en: { distance: "Distance", updatedAt: "Recent", price: "Price" },
  ja: { distance: "距離順", updatedAt: "新着順", price: "価格順" },
  zh: { distance: "按距离", updatedAt: "按最新", price: "按价格" },
};

const FAVORITE_LABEL_FALLBACKS: Record<
  AppLocale,
  { add: string; remove: string }
> = {
  ko: { add: "즐겨찾기 추가", remove: "즐겨찾기 해제" },
  en: { add: "Add to favorites", remove: "Remove from favorites" },
  ja: { add: "お気に入りに追加", remove: "お気に入りから削除" },
  zh: { add: "添加收藏", remove: "取消收藏" },
};

export function SearchListBottomSheet({
  searchQuery,
  items = [],
  appLanguage = "ko",
  englishSubPolicy = "auto",
  onOpenFilter,
  isFilterActive = false,
  isFilterOpen = false,
  placeName = null,
  onLockerPress,
  onFavoriteChange,
  isLoading = false,
  isError = false,
  onRetry,
  showHeaderBack = false,
  onHeaderBackPress,
  minSnapPoint,
  snapPoint,
  maxSnapPoint,
  onSnapChange,
  children,
}: SearchListBottomSheetProps) {
  const messages = m as unknown as Record<string, (() => string) | undefined>;
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800,
  );
  const [activeSort, setActiveSort] = useState<ActiveSort | null>(null);

  const filteredItems = useMemo(
    () => filterSearchResults(items, placeName ? "" : searchQuery),
    [items, placeName, searchQuery],
  );
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
      filteredItems,
      primarySortType[resolvedSort.key],
      sortDirection[resolvedSort.direction],
      new Date(),
    );
  }, [activeSort, filteredItems]);
  const isPlaceScope = Boolean(placeName);
  const hasResult = !isLoading && !isError && visibleItems.length > 0;
  const showEmpty = !isLoading && !isError && visibleItems.length === 0;
  const showResultHeader = hasResult || isPlaceScope;
  const showEnglishSub = resolveEnglishSubVisibility({
    appLanguage,
    policy: englishSubPolicy,
  });
  const resolvedMinSnapPoint = minSnapPoint ?? 0;
  const resolvedSnapPoint = snapPoint ?? 331;
  const resolvedMaxSnapPoint = maxSnapPoint ?? windowHeight - 44;
  const sortLabels: Record<SearchSortKey, string> = {
    distance:
      messages.search_sort_distance?.() ??
      SORT_LABEL_FALLBACKS[appLanguage].distance,
    updatedAt:
      messages.search_sort_recent?.() ??
      SORT_LABEL_FALLBACKS[appLanguage].updatedAt,
    price:
      messages.search_sort_price?.() ?? SORT_LABEL_FALLBACKS[appLanguage].price,
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

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <DraggableBottomSheet
      snapPoint={resolvedSnapPoint}
      minSnapPoint={resolvedMinSnapPoint}
      maxSnapPoint={resolvedMaxSnapPoint}
      onSnapChange={onSnapChange}
    >
      <div className={sheetColumn}>
        {showResultHeader ? (
          <div className={resultHeader}>
            <div className={headerLeadingRow}>
              {showHeaderBack && onHeaderBackPress ? (
                <button
                  type="button"
                  className={headerLeadingButton}
                  onClick={onHeaderBackPress}
                  aria-label="뒤로"
                >
                  <IconChevronLeft13 />
                </button>
              ) : null}
              <SearchResultsHeading
                queryText={searchQuery}
                titleText={resultTitleText}
                resultCount={hasResult ? visibleItems.length : undefined}
              />
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
                  onFavoriteChange={onFavoriteChange}
                  favoriteAddLabel={FAVORITE_LABEL_FALLBACKS[appLanguage].add}
                  favoriteRemoveLabel={
                    FAVORITE_LABEL_FALLBACKS[appLanguage].remove
                  }
                />
              </div>
            ) : showEmpty ? (
              <div className={emptyState}>
                <NonSearch
                  query={searchQuery}
                  showEnglishSub={showEnglishSub}
                />
              </div>
            ) : null)}
        </div>
      </div>
    </DraggableBottomSheet>
  );
}
