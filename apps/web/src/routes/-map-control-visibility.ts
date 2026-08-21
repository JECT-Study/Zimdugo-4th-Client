interface ShouldShowMapControlsOptions {
  isMapLoading: boolean;
  hasMapError: boolean;
  hasMapInstance: boolean;
}

interface ShouldShowHomeSearchBarOptions {
  hasMapError: boolean;
}

interface ShouldShowHomeHeaderOptions {
  isSearchContextActive: boolean;
}

export const shouldShowHomeSearchBar = ({
  hasMapError,
}: ShouldShowHomeSearchBarOptions) => {
  return !hasMapError;
};

/**
 * 헤더는 지도 오류와 무관하게 유지한다.
 *
 * 검색 바와 같은 조건으로 묶어 두면 지도 로드가 실패했을 때 헤더까지 사라진다.
 * 오류 화면에는 재시도 버튼뿐이고 하단 탭도 없어서, 그 상태로는 설정·프로필·언어
 * 어디로도 갈 수 없다. 검색 컨텍스트에서만 자리를 비켜 준다.
 */
export const shouldShowHomeHeader = ({
  isSearchContextActive,
}: ShouldShowHomeHeaderOptions) => {
  return !isSearchContextActive;
};

export const shouldShowMapControls = ({
  isMapLoading,
  hasMapError,
  hasMapInstance,
}: ShouldShowMapControlsOptions) => {
  return !isMapLoading && !hasMapError && hasMapInstance;
};

/** 컨트롤과 시트 사이 간격 */
const MAP_CONTROL_SHEET_GAP_PX = 12;

/** 새로고침·내 위치 버튼과 그 사이 간격을 합한 스택 높이 */
const MAP_CONTROL_STACK_HEIGHT_PX = 42 * 2 + MAP_CONTROL_SHEET_GAP_PX;

/**
 * 컨트롤 스택 상단이 넘어서면 안 되는 경계.
 * 검색 바 하단(safe-area + 60 + 48)에 간격 12 를 더한 값이다.
 */
const MAP_CONTROL_TOP_LIMIT_PX = 120;

interface ResolveMapControlBottomOptions {
  /** 시트가 컨트롤을 밀어 올리지 않을 때 쓰는 기본 하단 위치 */
  baseBottomPx: number;
  /** 현재 단계에서 시트가 화면 하단에 차지하는 높이. 밀어 올릴 단계가 아니면 null */
  sheetVisibleHeightPx: number | null;
  /** 상단 경계를 계산할 뷰포트 높이 */
  windowHeightPx: number;
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
 * 시트 쪽에서 null 을 주므로 기본 위치를 그대로 쓴다.
 *
 * 다만 화면이 낮으면(가로 모드 등) 시트 높이를 그대로 더했을 때 스택이 검색 바
 * 위를 덮거나 뷰포트 밖으로 밀려난다. 상단 경계를 넘지 않도록 잘라 낸다.
 */
export const resolveMapControlBottomPx = ({
  baseBottomPx,
  sheetVisibleHeightPx,
  windowHeightPx,
}: ResolveMapControlBottomOptions) => {
  if (sheetVisibleHeightPx === null) {
    return baseBottomPx;
  }

  const raisedBottomPx = sheetVisibleHeightPx + MAP_CONTROL_SHEET_GAP_PX;
  const topLimitedBottomPx =
    windowHeightPx - MAP_CONTROL_TOP_LIMIT_PX - MAP_CONTROL_STACK_HEIGHT_PX;

  return Math.max(baseBottomPx, Math.min(raisedBottomPx, topLimitedBottomPx));
};
