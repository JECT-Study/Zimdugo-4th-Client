import type { CSSProperties } from "react";

/** `-index.css.ts` locationControlStack의 `calc(bottomNav + N)`와 동기화 */
export const MAP_CONTROL_OFFSET_ABOVE_NAV = "52px";

export const MAP_CONTROL_FALLBACK_CONTAINER_WIDTH_PX = 375;
export const MAP_CONTROL_FALLBACK_BOTTOM_NAV_PX = 60;
export const MAP_CONTROL_FALLBACK_OFFSET_ABOVE_NAV_PX = 52;
export const MAP_CONTROL_FALLBACK_SIDE_INSET_PX = 16;
export const MAP_CONTROL_FALLBACK_GAP_PX = 8;
export const MAP_CONTROL_FALLBACK_Z_INDEX = 20;

export const MAP_CONTROL_FALLBACK_BOTTOM_PX =
  MAP_CONTROL_FALLBACK_BOTTOM_NAV_PX + MAP_CONTROL_FALLBACK_OFFSET_ABOVE_NAV_PX;

export const getMapControlStackRightCss = () =>
  `max(${MAP_CONTROL_FALLBACK_SIDE_INSET_PX}px, calc((100vw - ${MAP_CONTROL_FALLBACK_CONTAINER_WIDTH_PX}px) / 2 + ${MAP_CONTROL_FALLBACK_SIDE_INSET_PX}px))`;

/** CSS 청크 도착 전 위치·레이아웃 인라인 폴백 */
export const mapControlStackPositionFallbackStyle: CSSProperties = {
  position: "fixed",
  right: getMapControlStackRightCss(),
  bottom: MAP_CONTROL_FALLBACK_BOTTOM_PX,
  display: "flex",
  flexDirection: "column",
  gap: MAP_CONTROL_FALLBACK_GAP_PX,
  zIndex: MAP_CONTROL_FALLBACK_Z_INDEX,
};

/** 스켈레톤 전용 (클릭 차단) */
export const mapControlStackInlineFallbackStyle: CSSProperties = {
  ...mapControlStackPositionFallbackStyle,
  pointerEvents: "none",
};
