import { appShellMaxWidth } from "@repo/ui/tokens/layout/layout.css";
import type { CSSProperties } from "react";
import {
  MAP_CONTROL_TOP_LIMIT_PX,
  resolveMapControlTopLimitPx,
} from "#/shared/lib/app-chrome-layout";

/** `-index.css.ts` locationControlStack의 하단 위치와 동기화 */
export const MAP_CONTROL_BOTTOM = "70px";

export const MAP_CONTROL_FALLBACK_APP_MAX_WIDTH_PX = 430;
export const MAP_CONTROL_FALLBACK_SIDE_INSET =
  "max(16px, env(safe-area-inset-right, 0px))";
export const MAP_CONTROL_FALLBACK_MAX_WIDTH = appShellMaxWidth;
export const MAP_CONTROL_FALLBACK_GAP_PX = 12;
const MAP_CONTROL_FALLBACK_Z_INDEX = 20;

export const MAP_CONTROL_FALLBACK_BOTTOM_PX = 70;

/** 컨트롤과 시트 사이 간격 */
export const MAP_CONTROL_SHEET_GAP_PX = 12;

/**
 * 새로고침·내 위치 버튼과 그 사이 간격을 합한 스택 높이.
 *
 * 늘 서 있는 두 개만 센다. 조건부로 붙는 컨트롤은 그쪽 높이를 아는 곳에서
 * `resolveMapControlTopReservedPx` 로 더해 준다.
 */
const MAP_CONTROL_STACK_HEIGHT_PX = 42 * 2 + MAP_CONTROL_SHEET_GAP_PX;

/**
 * 조건부 컨트롤까지 포함한 예약 높이.
 *
 * 보관 타이머처럼 있을 때만 서는 버튼이 있으면 스택이 그만큼 위로 자란다. 이를
 * 빼고 계산하면 낮은 화면에서 "놓을 자리가 있다" 고 판정한 뒤 실제 스택이 검색
 * 바를 덮는다.
 *
 * 스켈레톤은 이 함수를 쓰지 않는다. 하이드레이션 전이라 어떤 조건부 컨트롤이
 * 설지 알 수 없고, 그 시점에는 어차피 두 개만 그린다.
 */
/**
 * 안전 영역을 뺀 예약 높이.
 *
 * 하이드레이션 전에도 같은 판정을 해야 하는 자리(스켈레톤, CSS 미디어 쿼리)가 쓴다.
 * 그 시점에는 안전 영역을 잴 수 없고, 미디어 쿼리에는 런타임 값을 넣을 수도 없다.
 */
const MAP_CONTROL_TOP_RESERVED_PX =
  MAP_CONTROL_TOP_LIMIT_PX + MAP_CONTROL_STACK_HEIGHT_PX;

export const resolveMapControlTopReservedPx = (
  extraStackHeightPx: number,
  safeAreaInsetTopPx = 0,
) =>
  resolveMapControlTopLimitPx(safeAreaInsetTopPx) +
  MAP_CONTROL_STACK_HEIGHT_PX +
  (extraStackHeightPx > 0
    ? extraStackHeightPx + MAP_CONTROL_FALLBACK_GAP_PX
    : 0);

/**
 * 컨트롤을 놓을 수 있는 최소 뷰포트 높이.
 *
 * 이보다 낮으면 상단 경계를 지키는 자리가 기본 하단 위치보다 아래라 놓을 곳이
 * 없다. resolveMapControlBottomPx 가 null 을 주는 조건과 같은 값이고, 스켈레톤은
 * 하이드레이션 전에도 같은 판정을 해야 해서 CSS 미디어 쿼리로도 쓴다.
 */
export const MAP_CONTROL_MIN_VIEWPORT_HEIGHT_PX =
  MAP_CONTROL_TOP_RESERVED_PX + MAP_CONTROL_FALLBACK_BOTTOM_PX;

/** CSS 청크 도착 전 위치·레이아웃 인라인 폴백 */
export const mapControlStackPositionFallbackStyle: CSSProperties = {
  position: "fixed",
  left: "50%",
  bottom: MAP_CONTROL_FALLBACK_BOTTOM_PX,
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: MAP_CONTROL_FALLBACK_MAX_WIDTH,
  paddingRight: MAP_CONTROL_FALLBACK_SIDE_INSET,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: MAP_CONTROL_FALLBACK_GAP_PX,
  zIndex: MAP_CONTROL_FALLBACK_Z_INDEX,
  pointerEvents: "none",
};

/** 스켈레톤 전용 (클릭 차단) */
export const mapControlStackInlineFallbackStyle: CSSProperties = {
  ...mapControlStackPositionFallbackStyle,
  pointerEvents: "none",
};
