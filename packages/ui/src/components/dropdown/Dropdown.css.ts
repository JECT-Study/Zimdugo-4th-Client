import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../../vars.css.ts";

export const root = style({
  display: "inline-flex",
  flexDirection: "column",
  width: "100%",
  position: "relative",
});

export const button = style({
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "48px",
  padding: `0 ${vars.spacing.scale[16]}`,
  borderRadius: vars.radius.scale[4],
  border: `1px solid ${vars.color.border.default}`,
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.Regular,
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&[data-focus-visible]": {
      borderColor: vars.color.focus,
    },
    "&[data-pressed]": {
      borderColor: vars.color.border.action,
    },
  },
});

export const chevronRecipe = recipe({
  base: {
    display: "inline-block",
    transition: "transform 0.2s ease",
  },
  variants: {
    rotation: {
      up: { transform: "rotate(180deg)" },
      down: { transform: "rotate(0deg)" },
    },
  },
  defaultVariants: {
    rotation: "down",
  },
});

export const valueText = style({
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  overflow: "hidden",
  color: vars.color.text.title,
  selectors: {
    "&[data-placeholder]": {
      color: vars.color.text.surface,
    },
  },
});

export const popover = style({
  width: "var(--trigger-width)",
  maxHeight: "240px",
  backgroundColor: vars.color.bg.default,
  borderRadius: vars.radius.scale[4],
  border: `1px solid ${vars.color.border.default}`,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  zIndex: 10,
});

export const listbox = style({
  display: "flex",
  flexDirection: "column",
  padding: `${vars.spacing.scale[4]} 0`,
  margin: 0,
  outline: "none",
  maxHeight: "inherit",
  overflowY: "auto",
});

export const item = style({
  padding: `${vars.spacing.scale[12]} ${vars.spacing.scale[16]}`,
  fontSize: vars.typography.fontSize[16],
  color: vars.color.text.surface,
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&[data-focused], &[data-hovered]": {
      backgroundColor: vars.color.bg.surface,
    },
    "&[data-selected]": {
      color: vars.color.text.title,
      fontWeight: vars.typography.fontWeight.Medium,
    },
  },
});
