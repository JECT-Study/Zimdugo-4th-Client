import { m } from "@repo/i18n";
// import { ControlChip } from "@repo/ui/components/control-chip";
import { LabelTitle } from "@repo/ui/components/label-title";
import { SearchField } from "@repo/ui/components/search-field";
import { IconChevronLeft13 } from "@repo/ui/tokens/icons";
import { useEffect, useMemo, useState } from "react";
import {
  getSearchAutocompleteItemKey,
  SearchAutocompleteItem,
  type SearchAutocompleteItemData,
  SearchListRecent,
} from "#/entities/search";
import { useLockerSuggest } from "#/features/search/hooks/useSearch";
import { SearchAsyncFeedback } from "#/features/search/ui/search-async-feedback/SearchAsyncFeedback";
import { SearchSuggestListSkeleton } from "#/features/search/ui/search-skeleton/SearchSuggestListSkeleton";
import { useDebouncedValue } from "#/shared/hooks/useDebouncedValue";
import {
  autocompleteList,
  backButton,
  backIcon,
  // chipContainer,
  // chipViewport,
  content,
  deleteAllButton,
  header,
  overlay,
  recentList,
  searchFieldSlot,
  sectionHeader,
} from "./SearchOverlay.css.ts";

const SUGGEST_MIN_QUERY_LENGTH = 2;

export interface SearchOverlayProps {
  onClose: (draft?: string) => void;
  onSelect: (query: string) => void;
  onSelectAutocomplete?: (
    item: SearchAutocompleteItemData,
    sourceQuery: string,
  ) => void;
  initialQuery?: string;
  searchCoordinates: { lat: number; lng: number };
}

/**
 * 검색 전용 전체 화면 레이어 컴포넌트.
 * 최근 검색어를 관리하고, 검색어 입력 시 자동완성 결과를 표시합니다.
 */
export function SearchOverlay({
  onClose,
  onSelect,
  onSelectAutocomplete,
  initialQuery = "",
  searchCoordinates,
}: SearchOverlayProps) {
  const t = (m ?? {}) as unknown as Record<
    string,
    (inputs?: Record<string, string>) => string
  >;
  const [query, setQuery] = useState(initialQuery);

  const [recentSearches, setRecentSearches] = useState([
    { id: 1, query: "강남역", date: "04.24" },
    { id: 2, query: "역삼역 보관함", date: "04.23" },
    { id: 3, query: "코엑스 짐보관", date: "04.22" },
    { id: 4, query: "홍대입구역", date: "04.21" },
    { id: 5, query: "잠실 롯데타워", date: "04.20" },
  ]);
  const normalizedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(normalizedQuery, 300);
  const suggestParams = useMemo(
    () =>
      debouncedQuery.length >= SUGGEST_MIN_QUERY_LENGTH
        ? {
            keyword: debouncedQuery,
            lat: searchCoordinates.lat,
            lng: searchCoordinates.lng,
          }
        : null,
    [debouncedQuery, searchCoordinates.lat, searchCoordinates.lng],
  );
  const {
    data: autocompleteItems = [],
    isFetching,
    isError,
    isFetched,
    refetch,
  } = useLockerSuggest(suggestParams);

  const isSuggestEligible = normalizedQuery.length >= SUGGEST_MIN_QUERY_LENGTH;
  const isDebouncing = isSuggestEligible && normalizedQuery !== debouncedQuery;
  const showSuggestLoading = isSuggestEligible && (isDebouncing || isFetching);
  const showSuggestError = isSuggestEligible && isError && !showSuggestLoading;
  const showSuggestEmpty =
    isSuggestEligible &&
    isFetched &&
    !showSuggestLoading &&
    !showSuggestError &&
    autocompleteItems.length === 0;
  const showSuggestResults =
    isSuggestEligible &&
    !showSuggestLoading &&
    !showSuggestError &&
    autocompleteItems.length > 0;

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
  };

  const handleSelect = (selectedQuery: string) => {
    handleQueryChange(selectedQuery);
    onSelect(selectedQuery);
  };

  const handleAutocompleteSelect = (item: SearchAutocompleteItemData) => {
    if (onSelectAutocomplete) {
      onSelectAutocomplete(item, query);
      return;
    }

    handleSelect(item.title);
  };

  const handleBack = () => {
    onClose(query);
  };

  const handleRemoveRecent = (id: number) => {
    setRecentSearches((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setRecentSearches([]);
  };

  /* const popularKeywords = [
    "코엑스",
    "강남역",
    "여의도",
    "잠실",
    "성수",
    "홍대",
    "이태원",
    "한남동",
    "가로수길",
    "판교",
    "분당",
    "수원",
    "인천공항",
    "김포공항",
    "부산역",
  ]; */

  const hasQuery = normalizedQuery.length > 0;

  return (
    <div className={overlay}>
      <header className={header}>
        <button
          type="button"
          className={backButton}
          onClick={handleBack}
          aria-label={t?.search_close_aria?.() ?? "닫기"}
        >
          <IconChevronLeft13 className={backIcon} />
        </button>
        <div className={searchFieldSlot}>
          <SearchField
            autoFocus
            value={query}
            onChange={handleQueryChange}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const nextQuery = (query || "").trim();
                if (nextQuery) {
                  handleSelect(nextQuery);
                }
              }
            }}
            placeholder={t?.search_placeholder?.() ?? "검색어를 입력하세요"}
            searchIconPlacement="left"
            variant="searchHome"
            aria-label={t?.search_input_aria?.() ?? "검색어 입력"}
          />
        </div>
      </header>

      <main className={content}>
        {!hasQuery && (
          <>
            <div className={sectionHeader}>
              <LabelTitle size="large">
                {t?.search_recent_title?.() ?? "최근 검색어"}
              </LabelTitle>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  className={deleteAllButton}
                  onClick={handleClearAll}
                >
                  {t?.search_delete_all?.() ?? "전체 삭제"}
                </button>
              )}
            </div>

            {/* <div className={chipViewport}>
              <div className={chipContainer}>
                {popularKeywords.map((keyword) => (
                  <ControlChip
                    key={keyword}
                    variant="choice"
                    label={keyword}
                    onPress={() => handleSelect(keyword)}
                  />
                ))}
              </div>
            </div> */}

            <div className={recentList}>
              {recentSearches.length > 0 ? (
                recentSearches.map((item) => (
                  <SearchListRecent
                    key={item.id}
                    dateLabel={item.date}
                    onPress={() => handleSelect(item.query)}
                    onRemove={() => handleRemoveRecent(item.id)}
                    removeAriaLabel={
                      t?.search_recent_remove?.() ?? "최근 검색어 삭제"
                    }
                  >
                    {item.query}
                  </SearchListRecent>
                ))
              ) : (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "#8E8E8E",
                    fontSize: "14px",
                  }}
                >
                  {t?.search_no_recent?.() ?? "최근 검색 내역이 없습니다."}
                </div>
              )}
            </div>
          </>
        )}

        {hasQuery ? (
          <div className={autocompleteList}>
            {!isSuggestEligible ? (
              <SearchAsyncFeedback variant="suggest-min-length" />
            ) : null}
            {showSuggestLoading ? <SearchSuggestListSkeleton /> : null}
            {showSuggestError ? (
              <SearchAsyncFeedback
                variant="suggest-error"
                onRetry={() => void refetch()}
              />
            ) : null}
            {showSuggestEmpty ? (
              <SearchAsyncFeedback variant="suggest-empty" />
            ) : null}
            {showSuggestResults
              ? autocompleteItems.map((item) => (
                  <SearchAutocompleteItem
                    key={getSearchAutocompleteItemKey(item)}
                    item={item}
                    onPress={handleAutocompleteSelect}
                  />
                ))
              : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}
