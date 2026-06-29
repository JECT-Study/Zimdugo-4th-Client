import { style } from "@vanilla-extract/css";
import { layoutScale } from "../../tokens/layout/layout.css.ts";
import { vars } from "../../vars.css.ts";

export const overlay = style({
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingLeft: vars.layout.safeAreaInlineStart,
  paddingRight: vars.layout.safeAreaInlineEnd,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(2px)",
  zIndex: vars.zIndex.modal,
});

export const dialog = style({
  width: "100%",
  maxWidth: `calc(${vars.layout.appMaxWidth} - 32px)`,
  height: "224px",
  padding: "18px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: vars.color.bg.default,
  borderRadius: vars.radius[10],
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)",
  outline: "none",
  "@media": {
    [`screen and (min-width: ${layoutScale.tabletBreakpoint})`]: {
      maxWidth: `calc(${vars.layout.tabletAppMaxWidth} - 32px)`,
    },
  },
});

export const title = style({
  margin: 0,
  fontSize: vars.typography.fontSize[18],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "120%",
  color: vars.color.text.title,
  textAlign: "center",
  whiteSpace: "nowrap",
});

export const pickerFrame = style({
  position: "relative",
  width: "100%",
  height: "96px",
  marginTop: "18px",
  display: "grid",
  gridTemplateColumns:
    "repeat(var(--popup-picker-column-count), minmax(0, 1fr))",
});

export const selection = style({
  position: "absolute",
  top: "24px",
  left: 0,
  right: 0,
  height: "40px",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius[4],
  pointerEvents: "none",
});

export const pickerCenterAccessory = style({
  position: "absolute",
  top: "24px",
  left: "50%",
  zIndex: 2,
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "120%",
  pointerEvents: "none",
  transform: "translateX(-50%)",
});

export const dialColumn = style({
  position: "relative",
  zIndex: 1,
  minWidth: 0,
  overflow: "hidden",
  minInlineSize: 0,
  margin: 0,
  padding: 0,
  border: 0,
});

export const columnDivider = style({
  position: "absolute",
  top: "30px",
  bottom: "30px",
  left: 0,
  width: "1px",
  backgroundColor: vars.color.border.default,
});

export const dialList = style({
  height: "96px",
  width: "100%",
  overflowY: "auto",
  scrollSnapType: "y mandatory",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
    "&:focus-visible": {
      outline: `1px solid ${vars.color.focus}`,
      outlineOffset: "-1px",
      borderRadius: vars.radius[4],
    },
  },
});

export const dialItem = style({
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  scrollSnapAlign: "center",
  userSelect: "none",
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "120%",
  fontSize: vars.typography.fontSize[14],
  color: vars.color.text.disable,
  textAlign: "center",
  whiteSpace: "nowrap",
  transition: "color 0.16s ease, font-size 0.16s ease",
  selectors: {
    "&[data-selected]": {
      fontSize: vars.typography.fontSize[16],
      color: vars.color.text.title,
    },
  },
});

export const action = style({
  width: "100%",
  marginTop: "16px",
});
