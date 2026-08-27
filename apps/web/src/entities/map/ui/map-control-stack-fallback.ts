import { appShellMaxWidth } from "@repo/ui/tokens/layout/layout.css";
import type { CSSProperties } from "react";

/** `-index.css.ts` locationControlStack의 하단 위치와 동기화 */
export const MAP_CONTROL_BOTTOM = "70px";

export const MAP_CONTROL_FALLBACK_APP_MAX_WIDTH_PX = 430;
export const MAP_CONTROL_FALLBACK_SIDE_INSET_PX = 16;
export const MAP_CONTROL_FALLBACK_SIDE_INSET =
  "max(16px, env(safe-area-inset-right, 0px))";
export const MAP_CONTROL_FALLBACK_MAX_WIDTH = appShellMaxWidth;
export const MAP_CONTROL_FALLBACK_GAP_PX = 12;
const MAP_CONTROL_FALLBACK_Z_INDEX = 20;

export const MAP_CONTROL_FALLBACK_BOTTOM_PX = 70;

/** 컨트롤과 시트 사이 간격 */
export const MAP_CONTROL_SHEET_GAP_PX = 12;

/** 새로고침·내 위치 버튼과 그 사이 간격을 합한 스택 높이 */
const MAP_CONTROL_STACK_HEIGHT_PX = 42 * 2 + MAP_CONTROL_SHEET_GAP_PX;

/**
 * 컨트롤 스택 상단이 넘어서면 안 되는 경계.
 * 검색 바 하단(safe-area + 60 + 48)에 간격 12 를 더한 값이다.
 */
const MAP_CONTROL_TOP_LIMIT_PX = 120;

/** 스택과 상단 경계가 함께 요구하는 세로 공간 */
export const MAP_CONTROL_TOP_RESERVED_PX =
  MAP_CONTROL_TOP_LIMIT_PX + MAP_CONTROL_STACK_HEIGHT_PX;

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
