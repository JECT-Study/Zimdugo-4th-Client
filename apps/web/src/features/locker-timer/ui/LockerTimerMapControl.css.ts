import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

const BUTTON_SIZE_PX = 42;
const BADGE_HEIGHT_PX = 20;
/** 배지가 버튼 아래 모서리를 물고 들어가는 만큼 */
const BADGE_OVERLAP_PX = 7;
const BADGE_OVERHANG_PX = BADGE_HEIGHT_PX - BADGE_OVERLAP_PX;
const BADGE_MIN_WIDTH_PX = 58;

/**
 * 이 컨트롤이 지도 컨트롤 스택에서 차지하는 세로 길이.
 *
 * 배지가 버튼 밖으로 나온 만큼을 여백으로 돌려주고 있어 버튼 지름보다 크다.
 * 스택을 놓을 자리가 있는지 판단하는 쪽이 이 값을 더해야 낮은 화면에서 스택이
 * 검색 바를 덮지 않는다.
 */
export const LOCKER_TIMER_MAP_CONTROL_HEIGHT_PX =
  BUTTON_SIZE_PX + BADGE_OVERHANG_PX;

export const control = style({
  /*
   * 크기를 따로 잡지 않는다. 지도 컨트롤 스택은 오른쪽 정렬이라 옆 버튼들과
   * 지름이 다르면 원의 중심이 어긋난다. 공통 버튼 스타일에 맡긴다.
   *
   * 배지는 절대 위치라 자리를 차지하지 않는데, 버튼 아래로 삐져나온 만큼이
   * 스택의 간격을 그대로 잡아먹어 아래 컨트롤과 붙어 보였다. 삐져나온 높이를
   * 여백으로 돌려주면 배지 아래에서 다시 스택 간격만큼 떨어진다.
   */
  marginBottom: `${BADGE_OVERHANG_PX}px`,
});

export const remainingBadge = style({
  position: "absolute",
  // 버튼보다 넓어서 가운데를 맞추려면 넘치는 폭의 절반만큼 왼쪽으로 당긴다.
  left: `${(BUTTON_SIZE_PX - BADGE_MIN_WIDTH_PX) / 2}px`,
  top: `${BUTTON_SIZE_PX - BADGE_OVERLAP_PX}px`,
  zIndex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: `${BADGE_MIN_WIDTH_PX}px`,
  height: `${BADGE_HEIGHT_PX}px`,
  padding: `0 ${vars.spacing[4]}`,
  borderRadius: "20px",
  backgroundColor: vars.color.bg.brand.default,
  color: vars.color.text.white,
  fontSize: "10px",
  fontWeight: vars.typography.fontWeight.Regular,
  lineHeight: 1,
  whiteSpace: "nowrap",
  pointerEvents: "none",
});
