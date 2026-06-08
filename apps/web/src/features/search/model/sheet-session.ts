export type SessionOrigin = "search" | "map";
export type ListKind = "keyword" | "place";

export interface ListSessionContext {
  origin: SessionOrigin;
  listKind: ListKind;
  placeId: number | null;
}

export type DetailBackTarget =
  | { mode: "idle" }
  | {
      mode: "list";
      origin: SessionOrigin;
      listKind: ListKind;
      placeId: number | null;
    };

export const createKeywordListContext = (
  origin: SessionOrigin = "search",
): ListSessionContext => ({
  origin,
  listKind: "keyword",
  placeId: null,
});

export const createPlaceListContext = (
  placeId: number,
  origin: SessionOrigin,
): ListSessionContext => ({
  origin,
  listKind: "place",
  placeId,
});

export const createDetailBackTarget = (
  context: ListSessionContext | null,
): DetailBackTarget => {
  if (!context) {
    return { mode: "idle" };
  }

  return {
    mode: "list",
    origin: context.origin,
    listKind: context.listKind,
    placeId: context.placeId,
  };
};

export const createMapLockerPinBackTarget = (): DetailBackTarget => ({
  mode: "idle",
});

export type SheetModeForContext = "idle" | "list" | "filter" | "detail";

export const resolveActiveListContext = (
  sheetMode: SheetModeForContext,
  sessionOrigin: SessionOrigin | null,
  listKind: ListKind | null,
  placeId: number | null,
  detailBackTarget: DetailBackTarget | null,
): ListSessionContext | null => {
  if (sheetMode === "list" || sheetMode === "filter") {
    if (!sessionOrigin || !listKind) {
      return null;
    }

    return {
      origin: sessionOrigin,
      listKind,
      placeId: listKind === "place" ? placeId : null,
    };
  }

  if (sheetMode === "detail" && detailBackTarget?.mode === "list") {
    return {
      origin: detailBackTarget.origin,
      listKind: detailBackTarget.listKind,
      placeId: detailBackTarget.placeId,
    };
  }

  return null;
};
