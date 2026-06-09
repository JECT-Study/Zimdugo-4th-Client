import {
  type AppMapContext,
  type MapDetailBack,
  type SearchDetailBackTarget,
  type SheetModeForContext,
  shouldShowIdleMarkers,
  shouldShowSearchMarkers,
} from "./sheet-session";

export type MapMarkerLayerKind =
  | "idle"
  | "search"
  | "mapPlace"
  | "selectedMapDetail";

export const resolveMapMarkerLayer = ({
  context,
  sheetMode,
  searchDetailBack,
  mapDetailBack,
  selectedMapDetailPinCount,
}: {
  context: AppMapContext;
  sheetMode: SheetModeForContext;
  searchDetailBack: SearchDetailBackTarget | null;
  mapDetailBack: MapDetailBack | null;
  selectedMapDetailPinCount: number;
}): MapMarkerLayerKind | null => {
  if (shouldShowIdleMarkers({ context, sheetMode })) {
    return "idle";
  }

  if (shouldShowSearchMarkers({ context, sheetMode, searchDetailBack })) {
    return "search";
  }

  if (
    context === "map" &&
    (sheetMode === "list" ||
      sheetMode === "filter" ||
      (sheetMode === "detail" && mapDetailBack === "placeList"))
  ) {
    return "mapPlace";
  }

  if (
    context === "map" &&
    sheetMode === "detail" &&
    selectedMapDetailPinCount > 0
  ) {
    return "selectedMapDetail";
  }

  return null;
};
