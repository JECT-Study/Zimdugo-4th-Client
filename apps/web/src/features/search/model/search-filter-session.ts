import type { SearchFilterAppliedState } from "#/composites/search/SearchFilterBottomSheet";
import { createDefaultSearchFilters } from "#/composites/search/SearchFilterBottomSheet";

const SEARCH_FILTER_SESSION_KEY = "zimdugo-search-filters-v1";

const isValidFilterState = (raw: unknown): raw is SearchFilterAppliedState => {
  if (!raw || typeof raw !== "object") {
    return false;
  }

  const obj = raw as Record<string, unknown>;

  return (
    typeof obj.regionActive === "boolean" &&
    typeof obj.sizeActive === "boolean" &&
    typeof obj.placeTypeActive === "boolean" &&
    Array.isArray(obj.indoorOutdoorState) &&
    Array.isArray(obj.placeTypeState) &&
    Array.isArray(obj.selectedSizes)
  );
};

export const loadSearchFiltersFromSession = (): SearchFilterAppliedState => {
  if (typeof window === "undefined") {
    return createDefaultSearchFilters();
  }

  try {
    const raw = window.sessionStorage.getItem(SEARCH_FILTER_SESSION_KEY);
    if (!raw) {
      return createDefaultSearchFilters();
    }

    const parsed: unknown = JSON.parse(raw);
    return isValidFilterState(parsed) ? parsed : createDefaultSearchFilters();
  } catch {
    return createDefaultSearchFilters();
  }
};

export const saveSearchFiltersToSession = (
  filters: SearchFilterAppliedState,
): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      SEARCH_FILTER_SESSION_KEY,
      JSON.stringify(filters),
    );
  } catch {
    // sessionStorage 쓰기 실패는 무시
  }
};

export const clearSearchFiltersFromSession = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(SEARCH_FILTER_SESSION_KEY);
  } catch {
    // sessionStorage 삭제 실패는 무시
  }
};
