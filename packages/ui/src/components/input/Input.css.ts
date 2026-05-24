import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../vars.css.ts";

export const root = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing.scale[8],
  width: "100%",
});

export const labelTitleSlot = style({
  display: "flex",
  alignItems: "center",
  width: "100%",
  paddingLeft: vars.spacing.scale[16],
  paddingRight: vars.spacing.scale[16],
});

export const field = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing.scale[8],
  width: "100%",
  minHeight: "48px",
  boxSizing: "border-box",
  paddingLeft: vars.layout.sidePadding,
  paddingRight: vars.layout.sidePadding,
  paddingTop: "10px",
  paddingBottom: "10px",
  borderRadius: vars.radius.scale[6],
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: vars.color.border.default,
  backgroundColor: vars.color.bg.default,
  outline: "none",
  cursor: "text",
  selectors: {
    "&[data-focus-within]": {
      borderColor: vars.color.border.focus,
    },
    "&[data-focused]": {
      borderColor: vars.color.border.focus,
    },
    "&[data-focus-visible]": {
      borderColor: vars.color.border.focus,
    },
    "&:focus-within": {
      borderColor: vars.color.border.focus,
    },
  },
});

export const fieldState = styleVariants({
  default: {},
  ghost: {
    borderWidth: 0,
    borderRadius: vars.radius.scale[6],
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "transparent",
  },
  disabled: {
    borderWidth: 0,
    backgroundColor: vars.color.bg.surface,
  },
  active: {
    borderColor: vars.color.border.focus,
  },
  error: {
    borderColor: vars.color.border.error,
  },
  searchHome: {
    borderColor: vars.color.border.hover,
  },
  underlined: {
    borderWidth: 0,
    borderBottomWidth: "2px",
    borderColor: vars.color.border.default,
    borderRadius: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
});

export const iconSlot = style({
  width: "24px",
  height: "24px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

export const labelType = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing.scale[8],
  flex: 1,
  minWidth: 0,
  minHeight: "24px",
});

export const labelTypeWithLeftSearch = style({
  gap: vars.spacing.scale[12],
});

export const inputText = style({
  flex: 1,
  minWidth: 0,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  color: vars.color.text.title,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  textAlign: "left",
  backgroundColor: "transparent",
  border: "none",
  outline: "none",
  "::placeholder": {
    color: vars.color.text.surface,
    fontWeight: vars.typography.fontWeight.Medium,
  },
  selectors: {
    "&[data-disabled]": {
      cursor: "not-allowed",
    },
  },
});

export const inputTextTone = styleVariants({
  on: {
    color: vars.color.text.title,
    "::placeholder": {
      color: vars.color.text.surface,
    },
  },
  off: {
    color: vars.color.text.disable,
    "::placeholder": {
      color: vars.color.text.disable,
    },
  },
});
