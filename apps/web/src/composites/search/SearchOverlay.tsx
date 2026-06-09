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
import {
  formatSearchHistoryDateLabel,
  getSearchHistoryEntryLabel,
  type SearchHistoryEntry,
} from "#/features/search/model/search-history";
import { useLockerSuggest } from "#/features/search/hooks/useSearch";
import {
  capSearchQueryDraft,
  getSearchQueryIssue,
  getValidatedSearchQuery,
  isSearchQuerySubmittable,
  resolveSearchQuerySubmitAttempt,
  SEARCH_QUERY_MAX_LENGTH,
  trimSearchQueryDraft,
} from "#/features/search/lib/sanitize-search-query";
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

export interface SearchOverlayProps {
  onClose: (draft?: string) => void;
  onSelect: (query: string) => void;
  onSelectAutocomplete?: (
    item: SearchAutocompleteItemData,
    sourceQuery: string,
  ) => void;
  onSelectHistory?: (entry: SearchHistoryEntry) => void;
  recentEntries?: SearchHistoryEntry[];
  onRemoveRecent: (id: string) => void;
  onClearRecent: () => void;
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
  onSelectHistory,
  recentEntries = [],
  onRemoveRecent,
  onClearRecent,
  initialQuery = "",
  searchCoordinates,
}: SearchOverlayProps) {
  const [query, setQuery] = useState(() => trimSearchQueryDraft(initialQuery));
  const queryIssue = useMemo(() => getSearchQueryIssue(query), [query]);
  const validatedQuery = useMemo(() => getValidatedSearchQuery(query), [query]);
  const isQueryValid = useMemo(() => isSearchQuerySubmittable(query), [query]);
  const debouncedQuery = useDebouncedValue(validatedQuery ?? "", 300);
  const suggestParams = useMemo(
    () =>
      isQueryValid && debouncedQuery.length > 0
        ? {
            keyword: debouncedQuery,
            lat: searchCoordinates.lat,
            lng: searchCoordinates.lng,
          }
        : null,
    [
      debouncedQuery,
      isQueryValid,
      searchCoordinates.lat,
      searchCoordinates.lng,
    ],
  );
  const {
    data: autocompleteItems = [],
    isFetching,
    isError,
    isFetched,
    refetch,
  } = useLockerSuggest(suggestParams);

  const isSuggestEligible = isQueryValid;
  const isDebouncing =
    isSuggestEligible && validatedQuery !== debouncedQuery;
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

  const applyTrimToQuery = (rawQuery: string = query): string => {
    const trimmed = trimSearchQueryDraft(rawQuery);

    if (trimmed !== query) {
      setQuery(trimmed);
    }

    return trimmed;
  };

  const handleQueryChange = (nextQuery: string) => {
    setQuery(capSearchQueryDraft(nextQuery));
  };

  const handleQueryBlur = () => {
    applyTrimToQuery();
  };

  const handleSubmitQuery = () => {
    const trimmed = applyTrimToQuery();

    if (!isSearchQuerySubmittable(trimmed)) {
      return;
    }

    const attempt = resolveSearchQuerySubmitAttempt(trimmed);

    if (!attempt.ok) {
      return;
    }

    onSelect(attempt.query);
  };

  const handleSelect = (selectedQuery: string) => {
    if (!isSearchQuerySubmittable(selectedQuery)) {
      return;
    }

    const attempt = resolveSearchQuerySubmitAttempt(selectedQuery);

    if (!attempt.ok) {
      return;
    }

    onSelect(attempt.query);
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

  const handleRemoveRecent = (id: string) => {
    onRemoveRecent(id);
  };

  const handleClearAll = () => {
    onClearRecent();
  };

  const handleSelectHistory = (entry: SearchHistoryEntry) => {
    if (onSelectHistory) {
      onSelectHistory(entry);
      return;
    }

    if (entry.kind === "keyword") {
      handleSelect(entry.query);
    }
  };

  useEffect(() => {
    setQuery(trimSearchQueryDraft(initialQuery));
  }, [initialQuery]);

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

  const hasQuery = query.length > 0;

  return (
    <div className={overlay}>
      <header className={header}>
        <button
          type="button"
          className={backButton}
          onClick={handleBack}
          aria-label={m.search_close_aria()}
        >
          <IconChevronLeft13 className={backIcon} />
        </button>
        <div className={searchFieldSlot}>
          <SearchField
            autoFocus
            value={query}
            maxLength={SEARCH_QUERY_MAX_LENGTH}
            onChange={handleQueryChange}
            onBlur={handleQueryBlur}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== "NumpadEnter") {
                return;
              }

              event.preventDefault();
              handleSubmitQuery();
            }}
            placeholder={m.search_placeholder()}
            searchIconPlacement="left"
            variant="searchHome"
            aria-label={m.search_input_aria()}
          />
        </div>
      </header>

      <main className={content}>
        {!hasQuery && (
          <>
            <div className={sectionHeader}>
              <LabelTitle size="large">
                {m.search_recent_title()}
              </LabelTitle>
              {recentEntries.length > 0 && (
                <button
                  type="button"
                  className={deleteAllButton}
                  onClick={handleClearAll}
                >
                  {m.search_delete_all()}
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
              {recentEntries.length > 0 ? (
                recentEntries.map((entry) => (
                  <SearchListRecent
                    key={entry.id}
                    historyKind={entry.kind}
                    dateLabel={formatSearchHistoryDateLabel(entry.searchedAt)}
                    onPress={() => handleSelectHistory(entry)}
                    onRemove={() => handleRemoveRecent(entry.id)}
                    removeAriaLabel={m.search_recent_remove()}
                  >
                    {getSearchHistoryEntryLabel(entry)}
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
                  {m.search_no_recent()}
                </div>
              )}
            </div>
          </>
        )}

        {hasQuery ? (
          <div className={autocompleteList}>
            {queryIssue === "invalid-format" ? (
              <SearchAsyncFeedback variant="suggest-invalid-format" />
            ) : null}
            {queryIssue === "too-short" ? (
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
