export interface SearchSelectionState {
  searchDraft: string;
  searchQuery: string;
}

export const trimSearchDraft = (draft: string): string => draft.trim();

const createUnifiedSearchSelection = (input: string): SearchSelectionState => {
  const trimmed = trimSearchDraft(input);
  return {
    searchDraft: trimmed,
    searchQuery: trimmed,
  };
};

export const createKeywordSearchSelection = createUnifiedSearchSelection;

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
export const applyLockerSearchDraft = createUnifiedSearchSelection;
