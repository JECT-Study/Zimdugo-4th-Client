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
  isSearchOpen,
  searchDetailBack,
  mapDetailBack,
  hasSelectedMapPin,
  selectedMapDetailPinCount,
}: {
  context: AppMapContext;
  sheetMode: SheetModeForContext;
  isSearchOpen: boolean;
  searchDetailBack: SearchDetailBackTarget | null;
  mapDetailBack: MapDetailBack | null;
  hasSelectedMapPin: boolean;
  selectedMapDetailPinCount: number;
}): MapMarkerLayerKind | null => {
  if (isSearchOpen) {
    return null;
  }

  if (shouldShowIdleMarkers({ context, sheetMode })) {
    return "idle";
  }

  if (context === "map" && sheetMode === "idle" && hasSelectedMapPin) {
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
    mapDetailBack === "idle" &&
    hasSelectedMapPin
  ) {
    return "idle";
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
