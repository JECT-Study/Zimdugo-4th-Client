import {
  compactDeviceSelector,
  layoutScale,
} from "@repo/ui/tokens/layout/layout.css";
import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

export const searchBarLayer = style({
  position: "absolute",
  // 헤더(높이 48px) 바로 아래. 헤더는 검색 여부와 상관없이 늘 서 있다.
  top: "calc(env(safe-area-inset-top, 0px) + 60px)",
  left: vars.spacing[16],
  right: vars.spacing[16],
  zIndex: vars.zIndex.ui,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: vars.spacing[8],
  maxWidth: `calc(${vars.layout.appMaxWidth} - 32px)`,
  margin: "0 auto",
  selectors: {
    [compactDeviceSelector]: {
      maxWidth: "none",
    },
  },
  "@media": {
    [`screen and (min-width: ${layoutScale.tabletBreakpoint})`]: {
      maxWidth: `calc(${vars.layout.tabletAppMaxWidth} - 32px)`,
    },
  },
});

export const searchInputFrame = style({
  position: "relative",
  flex: 1,
  minWidth: 0,
  width: "100%",
});

export const searchControlRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  width: "100%",
});

export const leadingBackButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: "48px",
  height: "48px",
  padding: 0,
  border: `2px solid ${vars.color.border.hover}`,
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.surface,
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

globalStyle(`${leadingBackButton} svg`, {
  width: "13px",
  height: "24px",
  transform: "translateX(-1.5px)",
});

export const searchField = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  minHeight: "48px",
});

export const searchFieldWithClose = style({
  position: "relative",
});

globalStyle(`${searchFieldWithClose} > div`, {
  paddingRight: "52px",
});

export const closeButton = style({
  position: "absolute",
  top: "50%",
  right: vars.spacing[12],
  transform: "translateY(-50%)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  padding: 0,
  border: 0,
  borderRadius: vars.radius[6],
  backgroundColor: "transparent",
  color: vars.color.text.surface,
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const fallbackButton = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[12],
  width: "100%",
  minHeight: "48px",
  boxSizing: "border-box",
  padding: `10px ${vars.layout.sidePadding}`,
  border: `2px solid ${vars.color.border.hover}`,
  borderRadius: vars.radius.scale[6],
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.disable,
  cursor: "pointer",
  outline: "none",
  ":focus-visible": {
    borderColor: vars.color.border.focus,
  },
});

export const fallbackIconSlot = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  flexShrink: 0,
});

export const fallbackLabel = style({
  overflow: "hidden",
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
