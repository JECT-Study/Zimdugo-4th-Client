import { style } from "@vanilla-extract/css";
import { vars } from "../../vars.css.ts";

const tailPosition = "var(--popover-tail-position, 50%)";
const horizontalTailPosition = `clamp(10px, ${tailPosition}, calc(100% - 10px))`;
const verticalTailPosition = `clamp(10px, ${tailPosition}, calc(100% - 10px))`;

export const popover = style({
  outline: "none",
  filter: "drop-shadow(0 4px 12px rgba(22, 24, 28, 0.16))",
  overflow: "visible",
  zIndex: vars.zIndex.modal,
});

export const bubble = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: vars.spacing[16],
  width: "240px",
  boxSizing: "border-box",
  padding: vars.spacing[16],
  borderRadius: vars.radius[10],
  backgroundColor: vars.color.bg.default,
  outline: "none",
  overflow: "visible",
  selectors: {
    "&::after": {
      content: '""',
      position: "absolute",
      left: horizontalTailPosition,
      bottom: "-12px",
      width: 0,
      height: 0,
      transform: "translateX(-50%)",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderTop: `12px solid ${vars.color.bg.default}`,
    },
    [`${popover}[data-placement^="top"] &::after`]: {
      content: '""',
      position: "absolute",
      left: horizontalTailPosition,
      bottom: "-12px",
      width: 0,
      height: 0,
      transform: "translateX(-50%)",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderTop: `12px solid ${vars.color.bg.default}`,
    },
    [`${popover}[data-placement^="bottom"] &::after`]: {
      content: '""',
      position: "absolute",
      left: horizontalTailPosition,
      top: "-12px",
      width: 0,
      height: 0,
      transform: "translateX(-50%)",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderBottom: `12px solid ${vars.color.bg.default}`,
    },
    [`${popover}[data-placement^="left"] &::after`]: {
      content: '""',
      position: "absolute",
      top: verticalTailPosition,
      right: "-12px",
      width: 0,
      height: 0,
      transform: "translateY(-50%)",
      borderTop: "10px solid transparent",
      borderBottom: "10px solid transparent",
      borderLeft: `12px solid ${vars.color.bg.default}`,
    },
    [`${popover}[data-placement^="right"] &::after`]: {
      content: '""',
      position: "absolute",
      top: verticalTailPosition,
      left: "-12px",
      width: 0,
      height: 0,
      transform: "translateY(-50%)",
      borderTop: "10px solid transparent",
      borderBottom: "10px solid transparent",
      borderRight: `12px solid ${vars.color.bg.default}`,
    },
  },
});

export const headerRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  gap: vars.spacing[16],
});

export const title = style({
  margin: 0,
  overflow: "hidden",
  color: vars.color.text.title,
  fontFamily: "Pretendard, -apple-system, sans-serif",
  fontSize: vars.typography.fontSize[18],
  fontWeight: vars.typography.fontWeight.Regular,
  lineHeight: vars.typography.lineHeight.normal,
  letterSpacing: "-0.12px",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const closeButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  width: "18px",
  height: "18px",
  padding: 0,
  border: "none",
  background: "transparent",
  color: vars.color.icon.lighten,
  cursor: "pointer",
});

export const body = style({
  display: "-webkit-box",
  alignSelf: "stretch",
  margin: 0,
  overflow: "hidden",
  color: "var(--text-content, #4B4B4B)",
  fontFamily: "var(--font-familiy-kr, Pretendard)",
  fontSize: "var(--primitive-font-size-body-xs, 14px)",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "var(--primitive-font-lineHeight-body-xs, 22.4px)",
  letterSpacing: "var(--primitive-font-letterSpacing-body-xs, 0.07px)",
  maxHeight: "calc(var(--primitive-font-lineHeight-body-xs, 22.4px) * 4)",
  textAlign: "left",
  textOverflow: "ellipsis",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 4,
});

export const actions = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: vars.spacing[12],
  width: "100%",
});

export const actionButton = style({
  flex: "none !important",
});
