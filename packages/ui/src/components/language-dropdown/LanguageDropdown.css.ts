import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "../../vars.css.ts";

export const root = style({
  position: "relative",
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "flex-start",
  width: "32px",
  zIndex: 1,
  transition: "width 180ms ease-out",
});

export const rootExpanded = style({
  width: "119px",
});

export const trigger = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "flex-start",
  width: "32px",
  height: "32px",
  minHeight: "32px",
  padding: 0,
  border: 0,
  borderRadius: vars.radius.max,
  backgroundColor: "transparent",
  color: vars.color.text.title,
  cursor: "pointer",
  outline: "none",
  overflow: "hidden",
  transition:
    "width 180ms ease-out, height 180ms ease-out, padding 180ms ease-out, border-width 180ms ease-out, background-color 180ms ease-out",
  selectors: {
    [`${rootExpanded} &`]: {
      width: "119px",
      height: "36px",
      gap: "4px",
      padding: "2px 6px",
      border: `1px solid ${vars.color.brand.primary}`,
      backgroundColor: vars.color.bg.default,
    },
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const triggerLabel = style({
  minWidth: 0,
  flex: 1,
  overflow: "hidden",
  color: vars.color.text.content,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "17px",
  opacity: 0,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  transform: "translateX(-4px)",
  transition: "opacity 120ms ease-out, transform 120ms ease-out",
  selectors: {
    [`${rootExpanded} &`]: {
      opacity: 1,
      transform: "translateX(0)",
    },
  },
});

export const chevron = style({
  width: 0,
  height: 0,
  flexShrink: 0,
  opacity: 0,
  borderLeft: "5px solid transparent",
  borderRight: "5px solid transparent",
  borderTop: `6px solid ${vars.color.text.title}`,
  transform: "translateX(-4px)",
  transition: "opacity 120ms ease-out, transform 120ms ease-out",
  selectors: {
    [`${rootExpanded} &`]: {
      opacity: 1,
      transform: "translateX(0)",
    },
  },
});

export const options = style({
  position: "absolute",
  top: "46px",
  left: 0,
  display: "flex",
  flexDirection: "column",
  width: "119px",
  paddingTop: "6px",
  paddingBottom: "5px",
  borderRadius: vars.radius[6],
  backgroundColor: vars.color.bg.default,
  boxShadow: vars.shadow[2],
  overflow: "hidden",
  transformOrigin: "top left",
  opacity: 0,
  pointerEvents: "none",
  transform: "translateY(-8px)",
  transition: "opacity 180ms ease-out, transform 180ms ease-out",
  "::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "55px",
    width: 0,
    height: 0,
    borderLeft: "5px solid transparent",
    borderRight: "5px solid transparent",
    borderBottom: `6px solid ${vars.color.bg.default}`,
  },
});

export const optionsOpen = style({
  opacity: 1,
  pointerEvents: "auto",
  transform: "translateY(0)",
});

export const option = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "119px",
  height: "33px",
  padding: "0 8px 0 36px",
  border: 0,
  borderBottom: `1px solid ${vars.color.border.default}`,
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.disable,
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&:last-child": {
      borderBottom: 0,
    },
    "&:hover": {
      backgroundColor: vars.color.bg.surface,
    },
    "&:focus-visible": {
      boxShadow: `inset 0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const optionSelected = style({
  backgroundColor: vars.color.bg.surface,
  color: vars.color.text.title,
});

export const optionText = style({
  minWidth: 0,
  overflow: "hidden",
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "17px",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const checkIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "16px",
  height: "16px",
  flexShrink: 0,
  color: vars.color.brand.primary,
});

globalStyle(`${checkIcon} svg`, {
  width: "16px",
  height: "16px",
});
