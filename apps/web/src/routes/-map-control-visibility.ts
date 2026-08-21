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

/** 컨트롤과 미니 시트 사이 간격 */
const MAP_CONTROL_SHEET_GAP_PX = 12;

interface ResolveMapControlBottomOptions {
  /** 시트가 닫혀 있을 때 쓰는 기본 하단 위치 */
  baseBottomPx: number;
  /** 현재 미니 단계인 시트가 화면 하단에 차지하는 높이. 없으면 null */
  miniSheetVisibleHeightPx: number | null;
}

/**
 * 미니 시트가 떠 있으면 그 위로 컨트롤을 올린다.
 *
 * 시트는 z-index 1000 이라 컨트롤(350)보다 항상 위에 그려진다. 바텀 탭이 있을
 * 때는 컨트롤이 하단 112px 에 있어 111px 짜리 미니 시트를 아슬하게 넘겼는데,
 * 탭을 없애며 70px 로 내리면서 내 위치 버튼이 시트 뒤로 들어가 눌리지 않았다.
 *
 * half·full 단계는 시트가 화면을 지배하므로 기존처럼 기본 위치를 그대로 둔다.
 * 미니 단계만 컨트롤이 함께 보여야 하는 구간이다.
 */
export const resolveMapControlBottomPx = ({
  baseBottomPx,
  miniSheetVisibleHeightPx,
}: ResolveMapControlBottomOptions) => {
  if (miniSheetVisibleHeightPx === null) {
    return baseBottomPx;
  }

  return Math.max(
    baseBottomPx,
    miniSheetVisibleHeightPx + MAP_CONTROL_SHEET_GAP_PX,
  );
};
