import type { SheetModeForContext } from "./sheet-session";

export const DETAIL_HALF_BOTTOM_INSET_PX = 380;
export const SEARCH_LIST_SNAP_POINT_PX = 331;
export const MAP_BOUNDS_VISIBLE_GAP_PX = 8;
export const MIN_MAP_BOUNDS_BOTTOM_PADDING_PX = 64;

export const getDetailFocusBottomInsetPx = (): number =>
  DETAIL_HALF_BOTTOM_INSET_PX;

export const getSearchBoundsBottomPadding = ({
  sheetMode,
  windowHeight,
}: {
  sheetMode: SheetModeForContext;
  windowHeight: number;
}): number | undefined => {
  if (sheetMode !== "list") {
    return undefined;
  }

  return Math.max(
    MIN_MAP_BOUNDS_BOTTOM_PADDING_PX,
    Math.round(
      (windowHeight - SEARCH_LIST_SNAP_POINT_PX + MAP_BOUNDS_VISIBLE_GAP_PX) *
        0.35,
    ),
  );
};
