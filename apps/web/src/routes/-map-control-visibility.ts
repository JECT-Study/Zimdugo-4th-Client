import type { MapInset } from "#/entities/map/model/map-inset";
import {
  MAP_CONTROL_SHEET_GAP_PX,
  resolveMapControlTopReservedPx,
} from "#/entities/map/ui/map-control-stack-fallback";
import type { SheetModeForContext } from "#/features/search/model/sheet-session";

interface ShouldShowMapControlsOptions {
  isMapLoading: boolean;
  hasMapError: boolean;
  hasMapInstance: boolean;
}

interface ShouldShowHomeSearchBarOptions {
  hasMapError: boolean;
}

export const shouldShowHomeSearchBar = ({
  hasMapError,
}: ShouldShowHomeSearchBarOptions) => {
  return !hasMapError;
};

export const shouldShowMapControls = ({
  isMapLoading,
  hasMapError,
  hasMapInstance,
}: ShouldShowMapControlsOptions) => {
  return !isMapLoading && !hasMapError && hasMapInstance;
};

interface ResolveMapControlBottomOptions {
  /** 시트가 컨트롤을 밀어 올리지 않을 때 쓰는 기본 하단 위치 */
  baseBottomPx: number;
  /**
   * 지도가 가려지는 영역. 무엇이 가리는지는 보지 않는다.
   *
   * 예전에는 "시트가 하단에 차지하는 높이" 하나였다. 밀어 올릴 단계가 아니면 null
   * 이었는데, 가리지 않는 것과 0px 가리는 것은 같은 뜻이라 단계 판정은 부르는 쪽에
   * 남기고 여기서는 결과만 받는다.
   */
  obscuredInset: MapInset;
  /** 상단 경계를 계산할 뷰포트 높이 */
  windowHeightPx: number;
  /**
   * 조건부로 붙는 컨트롤이 더 차지하는 높이. 보관 타이머 버튼 등.
   *
   * 스택 간격은 이 값에서 계산하므로 버튼 자체 높이만 넘긴다.
   */
  extraStackHeightPx?: number;
  /** 노치에 덮이는 높이. 상단 경계를 그만큼 함께 내린다. */
  safeAreaInsetTopPx?: number;
}

/**
 * 시트가 떠 있으면 그 위로 컨트롤을 올린다.
 *
 * 시트는 z-index 1000 이라 컨트롤(350)보다 항상 위에 그려진다. 바텀 탭이 있을
 * 때는 컨트롤이 하단 112px 에 있어 111px 짜리 미니 시트를 아슬하게 넘겼는데,
 * 탭을 없애며 70px 로 내리면서 내 위치 버튼이 시트 뒤로 들어가 눌리지 않았다.
 *
 * 미니와 하프까지는 컨트롤이 시트를 따라 올라간다. full 은 시트가 화면을 덮는
 * 단계라 따라 올릴 자리가 없고, dismiss 는 시트가 사실상 닫힌 상태다. 두 단계는
 * 가리는 영역이 비어 오므로 기본 위치를 그대로 쓴다.
 *
 * 다만 화면이 낮으면(가로 모드 등) 시트 높이를 그대로 더했을 때 스택이 검색 바
 * 위를 덮거나 뷰포트 밖으로 밀려난다.
 *
 * 이때 상단 경계에 맞춰 아래로 잘라 내면 안 된다. 잘라 낸 자리는 시트보다 낮아
 * 스택 아래쪽 버튼이 도로 시트 뒤로 들어간다. 390px 화면에 하프 시트(191px)면
 * 잘라 낸 값이 174px 이라 내 위치 버튼이 174~216px 에 놓이는데 시트 상단이
 * 191px 이고, 350px 화면에서는 아예 통째로 묻힌다. 이 함수가 없애려던 문제가
 * 그대로 돌아온다.
 *
 * 그래서 시트를 피하면서 상단 경계도 지키는 자리가 없으면 잘라 내는 대신 null 을
 * 준다. 기본 위치로 되돌려도 시트 뒤에 깔린 채 검색 바만 가리므로 마찬가지다.
 * 화면 높이만으로 정해지는 판정(기본 위치조차 못 놓는 경우)은 시트 단계와
 * 무관하므로, full 이나 시트가 없는 상태에도 똑같이 적용한다.
 */
export const resolveMapControlBottomPx = ({
  baseBottomPx,
  obscuredInset,
  windowHeightPx,
  extraStackHeightPx = 0,
  safeAreaInsetTopPx = 0,
}: ResolveMapControlBottomOptions): number | null => {
  const topLimitedBottomPx =
    windowHeightPx -
    resolveMapControlTopReservedPx(extraStackHeightPx, safeAreaInsetTopPx);

  // 상단 경계는 시트 단계와 무관하게 먼저 본다. 밀어 올릴 단계가 아니어도 화면이
  // 낮으면 기본 위치의 스택이 그대로 검색 바를 덮기 때문이다. 예전에는 이 검사가
  // 시트가 있을 때만 돌아서, 낮은 화면에서 상세가 full 로 올라가면(가리는 영역이
  // 비어 온다) 버튼이 시트 뒤에 깔린 채 검색 바만 가렸다.
  if (topLimitedBottomPx < baseBottomPx) {
    return null;
  }

  const raisedBottomPx = obscuredInset.bottom + MAP_CONTROL_SHEET_GAP_PX;

  // 시트를 피한 자리가 상단 경계를 넘으면 놓을 곳이 없다. 경계에 맞춰 내리면
  // 시트 뒤로 들어가므로 잘라 내지 않고 배치 불가로 판정한다.
  if (raisedBottomPx > topLimitedBottomPx) {
    return null;
  }

  return Math.max(baseBottomPx, raisedBottomPx);
};

interface ResolveVisibleSheetKindOptions {
  sheetMode: SheetModeForContext;
  isMapLoading: boolean;
  isSearchOpen: boolean;
  /** 상세 시트에 그릴 내용이 있는지. 목록 시트에는 해당 없다 */
  hasDetailContent: boolean;
}

/**
 * 지금 화면에 실제로 떠 있는 시트.
 *
 * sheetMode 는 "어느 시트를 띄울 단계인가" 일 뿐이라 이것만으로는 시트가 보이는지
 * 알 수 없다. 검색 오버레이가 덮거나, 지도가 아직 로딩 중이거나, 상세에 그릴
 * 내용이 없으면 단계는 그대로인 채 시트만 사라진다.
 *
 * 컨트롤 배치가 sheetMode 만 보던 시절에는 그 상태에서 컨트롤이 없는 시트 윗변에
 * 그대로 떠 있었다. 라이브 오프셋을 되돌리는 이펙트도 "밀어 올릴 단계가 아닐 때"
 * 만 돌아서 영영 실행되지 않았다.
 *
 * 시트 렌더 조건과 컨트롤 배치가 같은 함수를 보게 해서, 게이트가 늘어나도 두 곳이
 * 갈리지 않게 한다.
 */
export const resolveVisibleSheetKind = ({
  sheetMode,
  isMapLoading,
  isSearchOpen,
  hasDetailContent,
}: ResolveVisibleSheetKindOptions): "list" | "detail" | null => {
  if (isMapLoading || isSearchOpen) {
    return null;
  }

  if (sheetMode === "list") {
    return "list";
  }

  if (sheetMode === "detail") {
    return hasDetailContent ? "detail" : null;
  }

  return null;
};
