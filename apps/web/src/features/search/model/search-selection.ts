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

/** Q10: suggest LOCKER — draft만 동기화, searchQuery는 변경하지 않음 */
export const syncSearchDraft = (
  draft: string,
): Pick<SearchSelectionState, "searchDraft"> => ({
  searchDraft: trimSearchDraft(draft),
});
