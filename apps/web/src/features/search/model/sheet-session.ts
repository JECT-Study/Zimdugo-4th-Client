import { getValidatedSearchQuery } from "#/features/search/lib/sanitize-search-query";

export type AppMapContext = "idle" | "map" | "search";

export type SearchListKind = "keyword" | "place";

/** search detail ‹ — idle 분기 없음 */
export type SearchDetailBackTarget = {
  listKind: SearchListKind;
  placeId: number | null;
};

/** map context detail ‹ */
export type MapDetailBack = "placeList" | "idle";

export type SearchBarBackAction =
  | "mapPlaceList"
  | "searchDetail"
  | "searchFilter"
  | "searchKeywordList"
  | "searchPlaceList";

/**
 * 그려진 시트. 주소가 정하는 화면(`map-screen` 의 target)을 따라가지만, 필터처럼
 * 주소에 없는 단계도 있다.
 */
export type SheetModeForContext =
  | "idle"
  | "list"
  | "filter"
  | "detail"
  | "addressList";

export const resolveActivePlaceId = (input: {
  context: AppMapContext;
  listKind: SearchListKind | null;
  searchPlaceId: number | null;
  mapPlaceId: number | null;
}): number | null => {
  if (input.context === "map") {
    return input.mapPlaceId;
  }

  if (input.context === "search" && input.listKind === "place") {
    return input.searchPlaceId;
  }

  return null;
};

export const shouldFetchKeywordSearch = (input: {
  context: AppMapContext;
  listKind: SearchListKind | null;
  sheetMode: SheetModeForContext;
  searchDetailBack: SearchDetailBackTarget | null;
  searchQuery: string;
}): boolean => {
  if (
    input.context !== "search" ||
    !getValidatedSearchQuery(input.searchQuery)
  ) {
    return false;
  }

  if (input.sheetMode === "list" || input.sheetMode === "filter") {
    return input.listKind === "keyword";
  }

  if (input.sheetMode === "detail" && input.searchDetailBack) {
    return input.searchDetailBack.listKind === "keyword";
  }

  return false;
};

export const shouldFetchPlaceLockers = (input: {
  context: AppMapContext;
  listKind: SearchListKind | null;
  sheetMode: SheetModeForContext;
  searchDetailBack: SearchDetailBackTarget | null;
  mapDetailBack: MapDetailBack | null;
  activePlaceId: number | null;
}): boolean => {
  if (input.activePlaceId == null) {
    return false;
  }

  if (input.context === "map") {
    return (
      input.sheetMode === "list" ||
      input.sheetMode === "filter" ||
      (input.sheetMode === "detail" && input.mapDetailBack === "placeList")
    );
  }

  if (input.context === "search") {
    if (input.sheetMode === "list" || input.sheetMode === "filter") {
      return input.listKind === "place";
    }

    if (input.sheetMode === "detail" && input.searchDetailBack) {
      return input.searchDetailBack.listKind === "place";
    }
  }

  return false;
};

export const shouldShowIdleMarkers = (input: {
  context: AppMapContext;
  sheetMode: SheetModeForContext;
}): boolean => input.context === "idle" && input.sheetMode === "idle";

export const shouldShowSearchMarkers = (input: {
  context: AppMapContext;
  sheetMode: SheetModeForContext;
  searchDetailBack: SearchDetailBackTarget | null;
}): boolean => {
  if (input.context !== "search" || input.sheetMode === "idle") {
    return false;
  }

  if (input.sheetMode === "detail") {
    return input.searchDetailBack !== null;
  }

  return true;
};

export const resolveSearchBarBackAction = (input: {
  context: AppMapContext;
  listKind: SearchListKind | null;
  sheetMode: SheetModeForContext;
  searchDetailBack: SearchDetailBackTarget | null;
}): SearchBarBackAction | null => {
  if (input.context === "map" && input.sheetMode !== "idle") {
    return "mapPlaceList";
  }

  if (input.context !== "search") {
    return null;
  }

  if (input.sheetMode === "detail") {
    return input.searchDetailBack ? "searchDetail" : null;
  }

  if (input.sheetMode === "filter") {
    return "searchFilter";
  }

  if (input.sheetMode === "list") {
    if (input.listKind === "place") {
      return "searchPlaceList";
    }

    if (input.listKind === "keyword") {
      return "searchKeywordList";
    }
  }

  return null;
};

/** fetch가 비활성화된 쿼리는 isPending이 true로 남아 스켈레톤이 멈추지 않을 수 있다 */
export const shouldShowSearchListLoading = (input: {
  isPlaceListScope: boolean;
  shouldFetchPlaceList: boolean;
  shouldFetchKeywordList: boolean;
  isPlaceLockersPending: boolean;
  isKeywordSearchPending: boolean;
}): boolean =>
  input.isPlaceListScope
    ? input.shouldFetchPlaceList && input.isPlaceLockersPending
    : input.shouldFetchKeywordList && input.isKeywordSearchPending;

export const isRenderableSheetSession = (input: {
  sheetMode: SheetModeForContext;
  selectedLockerDetail: { lockerId: number } | null;
  shouldFetchKeywordList: boolean;
  shouldFetchPlaceList: boolean;
}): boolean => {
  if (input.sheetMode === "idle") {
    return false;
  }

  if (input.sheetMode === "detail") {
    return input.selectedLockerDetail != null;
  }

  if (input.sheetMode === "list" || input.sheetMode === "filter") {
    return input.shouldFetchKeywordList || input.shouldFetchPlaceList;
  }

  return true;
};
