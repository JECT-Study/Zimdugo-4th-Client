import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../../vars.css.ts";

export const groupRoot = style({
  display: "flex",
  flexWrap: "wrap",
  width: "100%",
  columnGap: vars.spacing[12],
  rowGap: vars.spacing[16],
  justifyContent: "center",
  alignContent: "center",
  alignItems: "center",
});

export const staggeredRoot = style({
  display: "flex",
  flexWrap: "wrap",
  width: "100%",
  columnGap: vars.spacing[12],
  rowGap: vars.spacing[16],
  justifyContent: "center",
  alignItems: "center",
  maxWidth: "343px",
  margin: "0 auto",
});

export const chipGroupItem = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: vars.radius[16],
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",
    minWidth: "56px",
    padding: `${vars.spacing[8]} ${vars.spacing[12]}`,
    fontSize: vars.typography.fontSize[12],
    fontWeight: vars.typography.fontWeight.Medium,
    lineHeight: vars.typography.lineHeight.normal,
    backgroundColor: vars.color.palette.gray[200],
    color: vars.color.palette.gray[800],
    border: "1px solid transparent",
    selectors: {
      "&[data-disabled]": {
        cursor: "not-allowed",
        pointerEvents: "none",
        backgroundColor: vars.color.bg.brand.disable,
        color: vars.color.palette.gray[400],
        borderColor: "transparent",
      },
      "&[data-selected='true']": {
        backgroundColor: vars.color.bg.brand.active,
        color: vars.color.palette.gray[100],
        borderColor: "transparent",
      },
      "&[data-selected='true'][data-disabled]": {
        backgroundColor: vars.color.bg.brand.disable,
        color: vars.color.palette.gray[400],
        borderColor: "transparent",
      },
      "&:not([data-disabled]):not([data-selected='true'])[data-hovered], &:not([data-disabled]):not([data-selected='true'])[data-pressed]":
        {
          backgroundColor: vars.color.palette.gray[100],
          color: vars.color.palette.green[600],
          borderColor: vars.color.palette.green[500],
        },
      "&:not([data-disabled])[data-focus-visible]": {
        borderColor: vars.color.focus,
      },
    },
  },
  variants: {
    size: {
      small: { height: "28px" },
      medium: { height: "32px" },
    },
  },
  defaultVariants: {
    size: "medium",
  },
});
