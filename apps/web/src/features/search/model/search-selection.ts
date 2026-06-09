export interface SearchSelectionState {
  searchDraft: string;
  searchQuery: string;
}

export const trimSearchDraft = (draft: string): string => draft.trim();

export const createKeywordSearchSelection = (
  query: string,
): SearchSelectionState => {
  const trimmed = trimSearchDraft(query);
  return {
    searchDraft: trimmed,
    searchQuery: trimmed,
  };
};

export const createPlaceSearchSelection = (
  draft: string,
  placeTitle: string,
): SearchSelectionState => ({
  searchDraft: trimSearchDraft(draft),
  searchQuery: placeTitle,
});

/** @deprecated locker 플로우는 applyLockerSearchDraft 사용 */
export const syncSearchDraft = (
  draft: string,
): Pick<SearchSelectionState, "searchDraft"> => ({
  searchDraft: trimSearchDraft(draft),
});

/** locker 자동완성·히스토리 — 당시 입력 키워드를 검색창에 노출 */
export const applyLockerSearchDraft = (
  draft: string,
): Pick<SearchSelectionState, "searchDraft" | "searchQuery"> => {
  const trimmed = trimSearchDraft(draft);
  return {
    searchDraft: trimmed,
    searchQuery: trimmed,
  };
};
