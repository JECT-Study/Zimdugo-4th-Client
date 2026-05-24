import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../../vars.css.ts";

export const controlChip = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: vars.radius[16],
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",
    boxSizing: "border-box",
    border: "1px solid transparent",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
    height: "32px",
    flexShrink: 0,

    fontSize: vars.typography.fontSize[12],
    fontWeight: vars.typography.fontWeight.Medium,
    lineHeight: vars.typography.lineHeight.normal,

    selectors: {
      "&[data-disabled]": {
        cursor: "not-allowed",
        pointerEvents: "none",
        opacity: 0.5,
      },
      "&[data-focus-visible]": {
        boxShadow: `0 0 0 2px ${vars.color.focus}`,
      },
    },
  },

  variants: {
    variant: {
      choice: {
        backgroundColor: vars.color.palette.gray[200],
        color: vars.color.palette.gray[800],
        padding: `0 ${vars.spacing[12]}`,
        minWidth: "56px",
        selectors: {
          "&[data-active='true'], &[data-selected='true']": {
            backgroundColor: vars.color.bg.brand.active,
            color: vars.color.text.white,
          },
          "&:not([data-active='true']):not([data-selected='true']):not([data-disabled])[data-hovered]": {
            backgroundColor: vars.color.palette.gray[300],
          },
        },
      },
      filter: {
        backgroundColor: vars.color.palette.gray[100],
        color: vars.color.text.content,
        borderColor: vars.color.palette.gray[500],
        padding: `0 ${vars.spacing[12]}`,
        gap: vars.spacing[8],
        selectors: {
          "&[data-active='true'], &[data-selected='true']": {
            borderColor: vars.color.focus,
            color: vars.color.text.brand,
          },
          "&:not([data-active='true']):not([data-selected='true']):not([data-disabled])[data-hovered]": {
            borderColor: vars.color.border.hover,
          },
        },
      },
      sort: {
        backgroundColor: vars.color.palette.gray[100],
        color: vars.color.text.content,
        borderColor: vars.color.palette.gray[500],
        padding: `0 ${vars.spacing[12]}`,
        gap: vars.spacing[8],
        selectors: {
          "&[data-active='true'], &[data-selected='true']": {
            borderColor: vars.color.focus,
            color: vars.color.text.brand,
          },
          "&:not([data-active='true']):not([data-selected='true']):not([data-disabled])[data-hovered]": {
            borderColor: vars.color.border.hover,
          },
        },
      },
    },
    size: {
      small: { height: "28px" },
      medium: { height: "32px" },
    },
  },

  defaultVariants: {
    variant: "choice",
    size: "medium",
  },
});
