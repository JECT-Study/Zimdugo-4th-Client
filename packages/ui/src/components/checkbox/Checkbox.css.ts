import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../vars.css.ts";

export const root = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.spacing.scale[8],
  cursor: "pointer",
});

export const rootLocation = styleVariants({
  left: { flexDirection: "row-reverse" },
  right: { flexDirection: "row" },
  bottom: {
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  none: { flexDirection: "row" },
});

export const box = style({
  width: "20px",
  height: "20px",
  borderRadius: vars.radius.scale[2],
  borderWidth: "1px",
  borderStyle: "solid",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  flexShrink: 0,
});

export const boxState = styleVariants({
  default: {
    backgroundColor: vars.color.bg.subtle,
    borderColor: vars.color.bg.disable,
  },
  hover: {
    backgroundColor: vars.color.bg.brand.disable,
    borderColor: vars.color.border.hover,
  },
  pressed: {
    backgroundColor: vars.color.bg.brand.default,
    borderColor: vars.color.bg.brand.default,
  },
  disabled: {
    backgroundColor: vars.color.bg.surface,
    borderColor: vars.color.bg.surface,
  },
  focus: {
    backgroundColor: vars.color.bg.subtle,
    borderColor: vars.color.focus,
  },
});

export const checkSvg = style({
  width: "12px",
  height: "9px",
  display: "block",
});

export const label = style({
  margin: 0,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  color: vars.color.text.surface,
  whiteSpace: "nowrap",
});
