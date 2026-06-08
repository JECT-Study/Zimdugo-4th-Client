export type AppMapContext = "idle" | "map" | "search";

export type OverlayReturnContext = "idle" | "search";

export const resolveOverlayReturnContext = (
  context: AppMapContext,
): OverlayReturnContext => (context === "search" ? "search" : "idle");

export type SearchListKind = "keyword" | "place";

/** search detail ‹ — idle 분기 없음 */
export type SearchDetailBackTarget = {
  listKind: SearchListKind;
  placeId: number | null;
};

/** map context detail ‹ */
export type MapDetailBack = "placeList" | "idle";

export const createKeywordDetailBackTarget = (): SearchDetailBackTarget => ({
  listKind: "keyword",
  placeId: null,
});

export const createPlaceDetailBackTarget = (
  placeId: number,
): SearchDetailBackTarget => ({
  listKind: "place",
  placeId,
});

export const createSearchDetailBackTarget = (input: {
  listKind: SearchListKind;
  placeId: number | null;
}): SearchDetailBackTarget => ({
  listKind: input.listKind,
  placeId: input.listKind === "place" ? input.placeId : null,
});

export type SheetModeForContext = "idle" | "list" | "filter" | "detail";

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
  if (input.context !== "search" || !input.searchQuery.trim()) {
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
