import {
  compactDeviceSelector,
  layoutScale,
} from "@repo/ui/tokens/layout/layout.css";
import { vars } from "@repo/ui/vars";
import { globalStyle, keyframes, style } from "@vanilla-extract/css";
import { MAP_CONTROL_OFFSET_ABOVE_NAV } from "#/entities/map/ui/map-control-stack-fallback";

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
  left: "50%",
  bottom: `calc(${vars.layout.bottomNav} + ${MAP_CONTROL_OFFSET_ABOVE_NAV})`,
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: vars.layout.appMaxWidth,
  paddingRight: vars.layout.safeAreaInlineEnd,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: vars.spacing[8],
  zIndex: 350,
  pointerEvents: "none",
  selectors: {
    [compactDeviceSelector]: {
      maxWidth: "100%",
    },
  },
  "@media": {
    [`screen and (min-width: ${layoutScale.tabletBreakpoint})`]: {
      maxWidth: vars.layout.tabletAppMaxWidth,
      selectors: {
        [compactDeviceSelector]: {
          maxWidth: "100%",
        },
      },
    },
  },
});

export const locationButton = style({
  position: "relative",
  width: "48px",
  height: "48px",
  borderRadius: vars.radius.max,
  cursor: "pointer",
  backgroundColor: "transparent",
  border: "none",
  outline: "2px solid transparent",
  outlineOffset: "2px",
  padding: 0,
  pointerEvents: "auto",
  ":focus-visible": {
    boxShadow: `0 0 0 3px ${vars.color.bg.default}, 0 0 0 5px ${vars.color.brand.primary}`,
    outlineColor: vars.color.brand.primary,
  },
  "@media": {
    "(forced-colors: active)": {
      ":focus-visible": {
        boxShadow: "none",
        outline: "2px solid Highlight",
      },
    },
  },
});

const spin = keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

export const locationButtonLocating = style({
  selectors: {
    "&::after": {
      content: '""',
      position: "absolute",
      inset: "5px",
      borderRadius: vars.radius.max,
      border: `2px solid ${vars.color.palette.gray[200]}`,
      borderTopColor: vars.color.brand.primary,
      animation: `${spin} 0.8s linear infinite`,
      pointerEvents: "none",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      selectors: {
        "&::after": {
          animation: "none",
        },
      },
    },
  },
});

export const locationRecoveryNoticePositioner = style({
  position: "fixed",
  left: "50%",
  bottom: `calc(${vars.layout.bottomNav} + ${MAP_CONTROL_OFFSET_ABOVE_NAV})`,
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: vars.layout.appMaxWidth,
  paddingLeft: vars.layout.safeAreaInlineStart,
  paddingRight: vars.layout.safeAreaInlineEnd,
  boxSizing: "border-box",
  zIndex: 1200,
  pointerEvents: "none",
  selectors: {
    [compactDeviceSelector]: {
      maxWidth: "100%",
    },
  },
  "@media": {
    [`screen and (min-width: ${layoutScale.tabletBreakpoint})`]: {
      maxWidth: vars.layout.tabletAppMaxWidth,
      selectors: {
        [compactDeviceSelector]: {
          maxWidth: "100%",
        },
      },
    },
  },
});

export const locationRecoveryNotice = style({
  position: "relative",
  minHeight: "48px",
  marginRight: "64px",
  padding: `${vars.spacing[12]} 36px ${vars.spacing[12]} ${vars.spacing[16]}`,
  border: `1px solid ${vars.color.palette.gray[200]}`,
  borderRadius: vars.radius[8],
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.title,
  boxShadow: vars.shadow[2],
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.spacing[12],
  boxSizing: "border-box",
  overflow: "visible",
  pointerEvents: "auto",
});

export const locationRecoveryNoticeMessage = style({
  minWidth: 0,
  flex: 1,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
});

export const locationRecoveryNoticeAction = style({
  flexShrink: 0,
  padding: `${vars.spacing[8]} 0`,
  border: 0,
  background: "transparent",
  color: vars.color.text.brand,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.SemiBold,
  cursor: "pointer",
  whiteSpace: "nowrap",
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
  selectors: {
    "&:hover": {
      textDecoration: "underline",
    },
    "&:active": {
      opacity: 0.8,
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: "2px",
    },
  },
});

export const locationRecoveryNoticeClose = style({
  position: "absolute",
  top: 0,
  right: 0,
  transform: "translate(50%, -50%)",
  width: "40px",
  height: "40px",
  padding: 0,
  border: 0,
  borderRadius: vars.radius.max,
  background: "transparent",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  selectors: {
    "&:hover": {
      backgroundColor: vars.color.bg.surface,
    },
    "&:active": {
      backgroundColor: vars.color.bg.active,
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: "2px",
    },
  },
});

export const refreshButtonDisabled = style({
  cursor: "not-allowed",
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
  pointerEvents: "auto",
  ":active": {
    backgroundColor: vars.color.bg.surface,
  },
  ":focus-visible": {
    outline: `2px solid ${vars.color.brand.primary}`,
    outlineOffset: "2px",
  },
});

const markerScaleUp = keyframes({
  "0%": { transform: "scale(0.9)", opacity: 0.8 },
  "100%": { transform: "scale(1.5)", opacity: 1 },
});

const markerScaleDown = keyframes({
  "0%": { transform: "scale(1.5)" },
  "100%": { transform: "scale(1)" },
});

const markerSpreadOut = keyframes({
  "0%": {
    transform: "translate(var(--spread-x, 0px), var(--spread-y, 0px)) scale(0)",
    opacity: 0,
  },
  "100%": {
    transform: "translate(0px, 0px) scale(1)",
    opacity: 1,
  },
});

globalStyle(".map-marker-item", {
  transformOrigin: "center center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

globalStyle(".map-marker-item.selected-active", {
  animation: `${markerScaleUp} 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
});

globalStyle(".map-marker-item.selected-static", {
  transform: "scale(1.5)",
  animation: "none",
});

globalStyle(".map-marker-item.unselected-active", {
  animation: `${markerScaleDown} 0.2s ease-out forwards`,
});

globalStyle(".map-marker-item.normal", {
  transform: "scale(1)",
  animation: "none",
});

globalStyle(".map-marker-item.spread", {
  animation: `${markerSpreadOut} 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
});

globalStyle(".map-marker-offset-wrapper", {
  position: "relative",
  transformOrigin: "center center",
});
