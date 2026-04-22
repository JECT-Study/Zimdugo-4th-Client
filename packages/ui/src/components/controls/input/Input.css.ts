import { style, styleVariants } from "@vanilla-extract/css";
import { color } from "../../../tokens/color/color.css.ts";
import { radius } from "../../../tokens/radius/radius.css.ts";
import { spacing } from "../../../tokens/spacing/spacing.css.ts";
import { typography } from "../../../tokens/typography/typography.css.ts";

export const root = style({
  display: "flex",
  flexDirection: "column",
  gap: spacing.scale[8],
  width: "100%",
});

export const labelTitle = style({
  fontSize: typography.scale.fontSize[14],
  fontWeight: typography.scale.fontWeight.SemiBold,
  lineHeight: 1.2,
  color: color.palette.gray[800],
});

export const field = style({
  display: "flex",
  alignItems: "center",
  gap: spacing.scale[8],
  width: "100%",
  minHeight: "48px",
  boxSizing: "border-box",
  paddingLeft: spacing.scale[16],
  paddingRight: spacing.scale[16],
  paddingTop: "10px",
  paddingBottom: "10px",
  borderRadius: radius.scale[6],
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: color.border.default,
  backgroundColor: color.bg.default,
  outline: "none",
  cursor: "text",
  selectors: {
    "&[data-focus-within]": {
      borderColor: color.border.focus,
    },
    "&[data-focused]": {
      borderColor: color.border.focus,
    },
    "&[data-focus-visible]": {
      borderColor: color.border.focus,
    },
    "&:focus-within": {
      borderColor: color.border.focus,
    },
  },
});

export const fieldState = styleVariants({
  default: {},
  ghost: {
    borderWidth: 0,
    borderRadius: radius.scale[6],
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "transparent",
  },
  disabled: {
    borderWidth: 0,
    backgroundColor: color.bg.surface,
  },
  active: {
    borderColor: color.border.focus,
  },
  error: {
    borderColor: color.border.error,
  },
  searchHome: {
    borderColor: color.border.hover,
  },
  searchFilter: {
    borderColor: color.border.hover,
  },
  underlined: {
    borderWidth: 0,
    borderBottomWidth: "2px",
    borderColor: color.border.default,
    borderRadius: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
});

export const value = style({
  flex: 1,
  minWidth: 0,
  fontSize: typography.scale.fontSize[14],
  fontWeight: typography.scale.fontWeight.Medium,
  lineHeight: 1.2,
  color: color.text.title,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  textAlign: "left",
  backgroundColor: "transparent",
  border: "none",
  outline: "none",
  "::placeholder": {
    color: color.text.surface,
    fontWeight: typography.scale.fontWeight.Medium,
  },
  selectors: {
    "&[data-disabled]": {
      cursor: "not-allowed",
    }
  }
});

export const valueTone = styleVariants({
  on: {
    color: color.text.title,
    "::placeholder": {
      color: color.text.surface,
    },
  },
  off: {
    color: color.text.disable,
    "::placeholder": {
      color: color.text.disable,
    },
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

export const labelRow = style({
  display: "flex",
  alignItems: "center",
  width: "100%",
  paddingLeft: spacing.scale[16],
  paddingRight: spacing.scale[16],
});

export const labelType = style({
  display: "flex",
  alignItems: "center",
  gap: spacing.scale[8],
  flex: 1,
  minWidth: 0,
  minHeight: "24px",
});

export const labelTypeWithLeftSearch = style({
  gap: spacing.scale[12],
});

