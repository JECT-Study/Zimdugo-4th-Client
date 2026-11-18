import {
  capSearchQueryDraft,
  toSearchQueryFromName,
} from "../lib/sanitize-search-query";

export interface SearchSelectionState {
  searchDraft: string;
  searchQuery: string;
}

const trimSearchDraft = (draft: string): string => capSearchQueryDraft(draft);

const createUnifiedSearchSelection = (input: string): SearchSelectionState => {
  const query = capSearchQueryDraft(input);
  return {
    searchDraft: query,
    searchQuery: query,
  };
};

export const createKeywordSearchSelection = createUnifiedSearchSelection;

/**
 * 자동완성·최근 검색어에서 보관함이나 장소를 골랐을 때의 검색어. 입력하던 글자가
 * 아니라 고른 항목의 이름이다.
 *
 * "강남" 을 치다 "강남역 4번 출구 보관함" 을 고르면 검색창도 그 이름을 보인다. 이름에는
 * 검색어가 받지 않는 글자가 섞여 있어 검색어로 쓸 수 있는 모양으로 바꾼다
 * (`toSearchQueryFromName`). 바꿀 수 없으면 입력하던 글자를 쓴다.
 */
export const resolveSelectedItemSearchQuery = (
  title: string,
  typedDraft: string,
): string => toSearchQueryFromName(title) ?? capSearchQueryDraft(typedDraft);

const createSelectedItemSearchSelection = (
  draft: string,
  title: string,
): SearchSelectionState => {
  const query = resolveSelectedItemSearchQuery(title, draft);
  return { searchDraft: query, searchQuery: query };
};

/** 장소를 골랐을 때. 검색창과 아래 깔린 검색 결과가 장소 이름이 된다. */
export const createPlaceSearchSelection = createSelectedItemSearchSelection;

/** 보관함을 골랐을 때. 검색창과 아래 깔린 검색 결과가 보관함 이름이 된다. */
export const createLockerSearchSelection = createSelectedItemSearchSelection;

/** @deprecated locker 플로우는 applyLockerSearchDraft 사용 */
export const syncSearchDraft = (
  draft: string,
): Pick<SearchSelectionState, "searchDraft"> => ({
  searchDraft: trimSearchDraft(draft),
});
