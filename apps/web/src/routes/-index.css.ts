import { style } from "@vanilla-extract/css";
import { vars } from "@repo/ui/vars";
import { keyframes } from "@vanilla-extract/css";

export const mapContainer = style({
  width: "100%",
  height: "100%",
  backgroundColor: "#f0f0f0",
  flex: 1,
  touchAction: "none",
  WebkitUserSelect: "none",
  WebkitTapHighlightColor: "rgba(0,0,0,0)",
});

export const pageWrapper = style({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  flex: 1,
  position: "relative",
});

// 우측 상단 컨트롤 스택 (검색창 아래)
export const topControlStack = style({
  position: "absolute",
  top: "112px", // 검색창(52px) + 검색창 높이(48px) + 간격(12px)
  right: vars.spacing[16],
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  zIndex: vars.zIndex.ui,
});

// 우측 하단 컨트롤 스택 (새로고침 + 현재 위치)
export const locationControlStack = style({
  position: "fixed",
  right: `max(${vars.spacing[16]}, calc((100vw - ${vars.layout.containerWidth}) / 2 + ${vars.spacing[16]}))`,
  bottom: `calc(${vars.layout.bottomNav} + 52px)`,
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  zIndex: vars.zIndex.ui,
});


export const locationButton = style({
  position: "relative",
  width: "48px",
  height: "48px",
  cursor: "pointer",
  backgroundColor: "transparent",
  border: "none",
  padding: 0,
});

export const refreshButtonDisabled = style({
  cursor: "not-allowed",
});

const spin = keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

export const refreshIconSpinning = style({
  animation: `${spin} 0.45s ease-out 1`,
});

export const refreshCooldownBadge = style({
  position: "absolute",
  inset: 0,
  margin: "auto",
  width: "24px",
  height: "24px",
  borderRadius: vars.radius.max,
  backgroundColor: "rgba(255, 255, 255, 0.92)",
  color: vars.color.text.title,
  border: `1px solid ${vars.color.palette.gray[400]}`,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "13px",
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1,
  pointerEvents: "none",
  boxShadow: vars.shadow[1],
});

export const refreshLoadingOverlay = style({
  position: "absolute",
  inset: 0,
  zIndex: vars.zIndex.overlay,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
  animation: `${fadeIn} 0.12s ease-out`,
});

export const refreshLoadingBackdrop = style({
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(22, 24, 28, 0.08)",
  backdropFilter: "blur(2px)",
  WebkitBackdropFilter: "blur(2px)",
});

export const refreshLoadingSpinner = style({
  position: "relative",
  width: "34px",
  height: "34px",
  borderRadius: vars.radius.max,
  border: `3px solid ${vars.color.palette.gray[300]}`,
  borderTopColor: vars.color.palette.gray[700],
  animation: `${spin} 0.8s linear infinite`,
  backgroundColor: "rgba(255, 255, 255, 0.78)",
});

export const controlButton = style({
  width: "48px",
  height: "48px",
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.bg.default,
  border: `1px solid ${vars.color.palette.gray[200]}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: vars.shadow[1],
  cursor: "pointer",
  outline: "none",
  ":active": {
    backgroundColor: vars.color.bg.surface,
  },
  ":focus-visible": {
    outline: `2px solid ${vars.color.brand.primary}`,
    outlineOffset: "2px",
  },
});
