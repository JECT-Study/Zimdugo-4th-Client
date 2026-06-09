import { capSearchQueryDraft } from "../lib/sanitize-search-query";

export interface SearchSelectionState {
  searchDraft: string;
  searchQuery: string;
}

export const trimSearchDraft = (draft: string): string => capSearchQueryDraft(draft);

const createUnifiedSearchSelection = (input: string): SearchSelectionState => {
  const query = capSearchQueryDraft(input);
  return {
    searchDraft: query,
    searchQuery: query,
  };
};

export const createKeywordSearchSelection = createUnifiedSearchSelection;

export const createPlaceSearchSelection = (
  draft: string,
  placeTitle: string,
): SearchSelectionState => ({
  searchDraft: capSearchQueryDraft(draft),
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
