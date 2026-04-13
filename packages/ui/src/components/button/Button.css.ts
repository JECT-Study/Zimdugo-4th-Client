import { recipe } from "@vanilla-extract/recipes";
import { color } from "../../tokens/color/color.css.ts";
import { radius } from "../../tokens/radius/radius.css.ts";
import { spacing } from "../../tokens/spacing/spacing.css.ts";
import { typography } from "../../tokens/typography/typography.css.ts";

export const button = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius[8],
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",
    selectors: {
      "&[data-disabled]": {
        cursor: "not-allowed",
        pointerEvents: "none",
      },
      "&[data-focus-visible]": {
        outline: `none`,
        borderColor: color.focus,
      },
    },
  },

  variants: {
    variant: {
      filled: {},
      outline: {
        background: "transparent",
        borderWidth: "1px",
        borderStyle: "solid",
      },
      ghost: {
        background: "transparent",
        border: "none",
      },
    },

    intent: {
      primary: {},
      neutral: {},
    },

    size: {
      S: {
        paddingLeft: spacing[16],
        paddingRight: spacing[16],
        height: "32px",
        fontSize: typography.fontSize[12],
        fontWeight: typography.fontWeight.Medium,
        lineHeight: typography.lineHeight.normal,
        gap: spacing[4],
      },
      L: {
        paddingLeft: spacing[24],
        paddingRight: spacing[24],
        height: "40px",
        fontSize: typography.fontSize[18],
        fontWeight: typography.fontWeight.Medium,
        lineHeight: typography.lineHeight.normal,
        gap: spacing[8],
      },
    },
  },

  compoundVariants: [
    // filled + primary
    {
      variants: { variant: "filled", intent: "primary" },
      style: {
        backgroundColor: color.bg.brand.default,
        color: color.text.white,
        border: "1px solid transparent",
        selectors: {
          "&[data-hovered]": {
            backgroundColor: color.palette.green[300],
            borderColor: color.palette.green[500],
          },
          "&[data-pressed]": {
            backgroundColor: color.bg.brand.active,
            borderColor: "transparent",
          },
          "&[data-disabled]": {
            backgroundColor: color.bg.brand.disable,
            color: color.palette.gray[600],
          },
          "&[data-focus-visible]": {
            backgroundColor: color.palette.green[100],
          },
        },
      },
    },

    // filled + neutral
    {
      variants: { variant: "filled", intent: "neutral" },
      style: {
        backgroundColor: color.palette.gray[200],
        color: color.palette.gray[800],
        border: "1px solid transparent",
        selectors: {
          "&[data-hovered]": {
            backgroundColor: color.palette.gray[200],
            borderColor: color.palette.gray[600],
          },
          "&[data-pressed]": {
            backgroundColor: color.palette.gray[400],
            borderColor: "transparent",
          },
          "&[data-disabled]": {
            backgroundColor: color.palette.gray[200],
            color: color.palette.gray[600],
          },
        },
      },
    },

    // outline + primary
    {
      variants: { variant: "outline", intent: "primary" },
      style: {
        borderColor: color.palette.gray[700],
        color: color.palette.gray[800],
        selectors: {
          "&[data-hovered]": {
            color: color.palette.green[500],
            borderColor: color.palette.green[600],
          },
          "&[data-pressed]": {
            color: color.palette.green[700],
            borderColor: color.palette.green[700],
          },
          "&[data-disabled]": {
            color: color.palette.green[200],
            borderColor: color.palette.green[200],
          },
        },
      },
    },

    // outline + neutral
    {
      variants: { variant: "outline", intent: "neutral" },
      style: {
        borderColor: color.border.action,
        color: color.text.content,
        selectors: {
          "&[data-hovered]": {
            borderColor: color.border.hover,
            backgroundColor: color.bg.surface,
          },
          "&[data-pressed]": {
            borderColor: color.border.action,
            backgroundColor: color.bg.subtle,
          },
          "&[data-disabled]": {
            borderColor: color.bg.disable,
            color: color.text.disable,
          },
        },
      },
    },

    // ghost + primary
    {
      variants: { variant: "ghost", intent: "primary" },
      style: {
        color: color.palette.gray[700],
        selectors: {
          "&[data-hovered]": {
            color: color.palette.green[500],
          },
          "&[data-pressed]": {
            color: color.palette.green[700],
          },
          "&[data-disabled]": {
            color: color.palette.green[200],
          },
        },
      },
    },
  ],

  defaultVariants: {
    variant: "filled",
    intent: "primary",
    size: "L",
  },
});
