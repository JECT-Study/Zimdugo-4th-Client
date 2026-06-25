import { color } from "@repo/ui/tokens/color/color.css";
import { layoutScale } from "@repo/ui/tokens/layout/layout.css";
import { spacing } from "@repo/ui/tokens/spacing/spacing.css";
import type { CSSProperties } from "react";

/**
 * `report.css.ts` vars와 동기화 — vanilla-extract CSS 청크 도착 전·timeout 인라인 스타일에만 사용한다.
 */
export const REPORT_PAGE_BG = color.bg.default;
export const REPORT_CONTAINER_MAX_WIDTH = layoutScale.containerWidth;
export const REPORT_SIDE_PADDING = layoutScale.sidePadding;

export const reportPageLoadingShellStyle: CSSProperties = {
  width: "100%",
  maxWidth: REPORT_CONTAINER_MAX_WIDTH,
  margin: "0 auto",
  minHeight: "100dvh",
  position: "relative",
  overflow: "visible",
  backgroundColor: REPORT_PAGE_BG,
  display: "flex",
  flexDirection: "column",
};

export const reportPageInlineFallbackStyle: CSSProperties = {
  ...reportPageLoadingShellStyle,
};

export const reportHeaderInlineFallbackStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  width: "100%",
  backgroundColor: REPORT_PAGE_BG,
  borderBottom: `1px solid ${color.border.default}`,
  paddingTop: "env(safe-area-inset-top, 0px)",
  zIndex: 100,
  boxSizing: "border-box",
};

export const reportContentInlineFallbackStyle: CSSProperties = {
  position: "relative",
  flex: 1,
  width: "100%",
  minHeight: 0,
  padding: `${spacing.scale[16]} ${REPORT_SIDE_PADDING} ${spacing.scale[28]}`,
  overflowY: "visible",
  overflowAnchor: "none",
  overscrollBehaviorY: "auto",
  touchAction: "pan-y",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
};

export const reportBottomBarInlineFallbackStyle: CSSProperties = {
  position: "sticky",
  bottom: 0,
  width: "100%",
  padding: `${spacing.scale[16]} ${REPORT_SIDE_PADDING} calc(env(safe-area-inset-bottom, 0px) + ${spacing.scale[16]})`,
  borderTop: `1px solid ${color.border.default}`,
  backgroundColor: REPORT_PAGE_BG,
  zIndex: 100,
  boxSizing: "border-box",
};

export const reportPageLoadingOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "auto",
};

export const reportPageLoadingBackdropStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(22, 24, 28, 0.08)",
  backdropFilter: "blur(2px)",
  WebkitBackdropFilter: "blur(2px)",
};

export const reportPageSpinnerKeyframes = `
@keyframes report-page-spinner {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

export const reportPageLoadingSpinnerStyle: CSSProperties = {
  position: "relative",
  width: "34px",
  height: "34px",
  borderRadius: "9999px",
  border: "3px solid #DEE2E6",
  borderTopColor: "#495057",
  animation: "report-page-spinner 0.8s linear infinite",
  backgroundColor: "rgba(255, 255, 255, 0.78)",
};

const reportPageContentShellStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  minHeight: "100dvh",
};

export const reportPageHiddenContentStyle: CSSProperties = {
  visibility: "hidden",
  pointerEvents: "none",
  ...reportPageContentShellStyle,
};

export const reportPageVisibleContentStyle: CSSProperties = {
  visibility: "visible",
  pointerEvents: "auto",
  ...reportPageContentShellStyle,
};
