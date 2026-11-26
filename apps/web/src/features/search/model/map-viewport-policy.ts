import { resolveMapObscuredLeftPx } from "#/shared/lib/app-chrome-layout";
import type {
  MapDetailBack,
  SearchDetailBackTarget,
  SheetModeForContext,
} from "./sheet-session";

export const DETAIL_HALF_BOTTOM_INSET_PX = 380;
const SEARCH_LIST_SNAP_POINT_PX = 331;
const MAP_BOUNDS_VISIBLE_GAP_PX = 8;
export const MIN_MAP_BOUNDS_BOTTOM_PADDING_PX = 64;

export const getDetailFocusBottomInsetPx = (): number =>
  DETAIL_HALF_BOTTOM_INSET_PX;

/**
 * 상세가 열리면 그 아래에 목록이 깔려 있는가.
 *
 * 검색 결과·장소 목록에서 연 상세는 목록 위에 얹힌다. 데스크톱에서는 그 목록을
 * 왼쪽에 그대로 두고 상세 카드를 옆에 붙인다.
 *
 * 상세를 여는 순간(아직 목록 화면)과 상세를 보는 동안 모두 같은 답을 준다. 목록에서
 * 연 상세에서 다른 보관함으로 옮겨 가도 목록은 남는다.
 */
export const hasListUnderDetail = ({
  sheetMode,
  searchDetailBack,
  mapDetailBack,
}: {
  sheetMode: SheetModeForContext;
  searchDetailBack: SearchDetailBackTarget | null;
  mapDetailBack: MapDetailBack | null;
}): boolean => {
  if (sheetMode === "list") return true;
  if (sheetMode !== "detail") return false;
  return searchDetailBack !== null || mapDetailBack === "placeList";
};

/**
 * 상세 보관함을 비출 때 지도에서 비울 자리.
 *
 * 모바일은 아래 시트(하프)만큼 비운다. 데스크톱은 시트가 아니라 왼쪽 카드라 아래는
 * 비우지 않고, 목록 옆에 상세 카드가 붙으면 두 카드 폭을 함께 비운다.
 */
export const resolveDetailFocusInsets = ({
  isDesktopLayout,
  isDetailBesideList,
}: {
  isDesktopLayout: boolean;
  isDetailBesideList: boolean;
}): { bottomInsetPx: number; leftInsetPx?: number } =>
  isDesktopLayout
    ? {
        bottomInsetPx: 0,
        leftInsetPx: resolveMapObscuredLeftPx(true, isDetailBesideList),
      }
    : { bottomInsetPx: getDetailFocusBottomInsetPx() };

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
