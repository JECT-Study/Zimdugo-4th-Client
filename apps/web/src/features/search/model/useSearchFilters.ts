import { useCallback, useState } from "react";
import {
  createDefaultSearchFilters,
  type SearchFilterAppliedState,
} from "#/composites/search/SearchFilterBottomSheet";
import {
  clearSearchFiltersFromSession,
  loadSearchFiltersFromSession,
  saveSearchFiltersToSession,
} from "./search-filter-session";

/**
 * 적용된 검색 필터.
 *
 * 주소에 두지 않는다. 필터는 "무엇을 보고 있나" 가 아니라 결과를 거르는 조건이고,
 * 공유 링크나 검색엔진이 필터 조합마다 다른 주소를 보게 할 이유가 없다. 예전에 주소에
 * 실었다가 걷어 낸 이력도 있다.
 *
 * 대신 탭을 옮겼다 돌아와도 남도록 sessionStorage 에 함께 적는다. 화면 상태와 저장소를
 * 호출하는 쪽이 각자 짝지어 바꾸면 한 곳만 빠뜨려도 둘이 어긋나므로, 바꾸는 길을 이
 * 훅의 두 함수로만 둔다.
 */
export function useSearchFilters() {
  const [searchFilters, setSearchFilters] = useState<SearchFilterAppliedState>(
    loadSearchFiltersFromSession,
  );

  const applySearchFilters = useCallback(
    (filters: SearchFilterAppliedState) => {
      setSearchFilters(filters);
      saveSearchFiltersToSession(filters);
    },
    [],
  );

  const resetSearchFilters = useCallback(() => {
    setSearchFilters(createDefaultSearchFilters());
    clearSearchFiltersFromSession();
  }, []);

  return { searchFilters, applySearchFilters, resetSearchFilters };
}
