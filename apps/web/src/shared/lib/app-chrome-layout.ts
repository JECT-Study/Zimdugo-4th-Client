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

/**
 * full 로 올린 시트가 콘텐츠 아래에 남기는 여유.
 *
 * 딱 맞춰 재면 마지막 항목이 화면 바닥에 붙어 잘린 것처럼 보인다.
 */
const SHEET_CONTENT_BOTTOM_GAP_PX = 32;

interface ResolveSheetFullSnapPointOptions {
  /** 잰 콘텐츠 높이. 아직 못 쟀으면 생략한다. */
  contentHeight?: number | null;
  /** 크롬을 덮지 않는 선. 여기보다 위로는 못 간다. */
  topLimitPx: number;
  maxSnapPoint: number;
  windowHeight: number;
}

/**
 * full 단계에서 시트가 멈출 자리.
 *
 * 시트 세 개가 같은 규칙을 쓴다. 예전에는 상세·필터만 콘텐츠 높이를 보고 목록은 늘
 * 꼭대기까지 올라와서, 결과가 두어 개일 때도 화면을 다 덮었다.
 *
 * 콘텐츠를 아직 못 쟀으면 상한을 준다. 못 잰 동안 콘텐츠가 짧다고 가정하면 시트가
 * 낮게 떴다가 측정 후 올라가고, 길다고 가정하면 반대로 움직인다. 어느 쪽이든 올라오는
 * 도중에 높이가 바뀌어 보이므로, 값을 알기 전에는 단계의 끝(상한)에 둔다.
 */
export const resolveSheetFullSnapPoint = ({
  contentHeight,
  topLimitPx,
  maxSnapPoint,
  windowHeight,
}: ResolveSheetFullSnapPointOptions) => {
  if (!contentHeight || contentHeight <= 0) {
    // 화면이 아주 낮으면 상한이 이 선보다 아래일 수 있다. 그대로 두면
    // minSnapPoint 가 maxSnapPoint 를 넘어 스냅 범위가 뒤집힌다.
    return Math.min(maxSnapPoint, topLimitPx);
  }

  const contentBasedOffset =
    windowHeight - contentHeight - SHEET_CONTENT_BOTTOM_GAP_PX;

  return Math.min(maxSnapPoint, Math.max(topLimitPx, contentBasedOffset));
};
