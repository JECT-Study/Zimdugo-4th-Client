/**
 * 화면 위쪽 크롬(헤더 + 검색 바) 이 차지하는 자리.
 *
 * 헤더는 안전 영역 바로 아래에서 48px, 검색 바는 그 아래 12px 을 띄고 48px 이다.
 * 아래로 겹치면 안 되는 것들(시트, 지도 컨트롤)이 이 값에서 각자 경계를 잡는다.
 *
 * 값을 각자 적어 두면 크롬이 바뀔 때 한쪽만 고쳐진다. 실제로 검색 바를 60px 로
 * 내렸을 때 시트 세 개와 지도 컨트롤이 모두 어긋나 있었다.
 */
const APP_CHROME_BOTTOM_PX = 108;

/** 시트가 크롬을 덮지 않도록 두는 간격 */
const SHEET_GAP_PX = 4;

/** 지도 컨트롤이 크롬을 덮지 않도록 두는 간격 */
const MAP_CONTROL_GAP_PX = 12;

/**
 * 안전 영역을 뺀, 뷰포트 꼭대기 기준 경계값.
 *
 * 안전 영역은 런타임에만 알 수 있어서 여기 안 들어 있다. SSR 과 노치 없는 기기의
 * 값이기도 하다.
 */
export const SHEET_TOP_LIMIT_PX = APP_CHROME_BOTTOM_PX + SHEET_GAP_PX;
export const MAP_CONTROL_TOP_LIMIT_PX =
  APP_CHROME_BOTTOM_PX + MAP_CONTROL_GAP_PX;

/**
 * 노치에 덮이는 만큼 경계를 함께 내린다.
 *
 * 크롬은 CSS 로 `env(safe-area-inset-top)` 만큼 내려가는데 시트·컨트롤 위치는 JS 가
 * 숫자로 잡는다. 안전 영역을 안 더하면 노치 기기에서만 둘이 어긋나, z-index 가 높은
 * 시트가 검색 바를 덮어 아무것도 누를 수 없게 된다.
 */
export const resolveSheetTopLimitPx = (safeAreaInsetTopPx: number) =>
  SHEET_TOP_LIMIT_PX + Math.max(0, safeAreaInsetTopPx);

export const resolveMapControlTopLimitPx = (safeAreaInsetTopPx: number) =>
  MAP_CONTROL_TOP_LIMIT_PX + Math.max(0, safeAreaInsetTopPx);
