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
export const MAP_CONTROL_FALLBACK_Z_INDEX = 20;

export const MAP_CONTROL_FALLBACK_BOTTOM_PX = 70;

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
