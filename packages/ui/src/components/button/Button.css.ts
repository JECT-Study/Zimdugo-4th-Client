import { keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../../vars.css.ts";

export const button = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: vars.radius[8],
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
        borderColor: vars.color.focus,
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
        paddingLeft: vars.spacing[16],
        paddingRight: vars.spacing[16],
        height: "32px",
        fontSize: vars.typography.fontSize[12],
        fontWeight: vars.typography.fontWeight.Medium,
        lineHeight: vars.typography.lineHeight.normal,
        gap: vars.spacing[4],
      },
      L: {
        paddingLeft: vars.spacing[24],
        paddingRight: vars.spacing[24],
        height: "40px",
        fontSize: vars.typography.fontSize[18],
        fontWeight: vars.typography.fontWeight.Medium,
        lineHeight: vars.typography.lineHeight.normal,
        gap: vars.spacing[8],
      },
    },
  },

  compoundVariants: [
    // filled + primary
    {
      variants: { variant: "filled", intent: "primary" },
      style: {
        backgroundColor: vars.color.bg.brand.default,
        color: vars.color.text.white,
        border: "1px solid transparent",
        selectors: {
          "&[data-hovered]": {
            backgroundColor: vars.color.palette.green[300],
            borderColor: vars.color.palette.green[500],
          },
          "&[data-pressed]": {
            backgroundColor: vars.color.bg.brand.active,
            borderColor: "transparent",
          },
          "&[data-disabled]": {
            backgroundColor: vars.color.bg.brand.disable,
            color: vars.color.palette.gray[600],
          },
          "&[data-focus-visible]": {
            backgroundColor: vars.color.palette.green[100],
          },
        },
      },
    },

    // filled + neutral
    {
      variants: { variant: "filled", intent: "neutral" },
      style: {
        backgroundColor: vars.color.palette.gray[200],
        color: vars.color.palette.gray[800],
        border: "1px solid transparent",
        selectors: {
          "&[data-hovered]": {
            backgroundColor: vars.color.palette.gray[200],
            borderColor: vars.color.palette.gray[600],
          },
          "&[data-pressed]": {
            backgroundColor: vars.color.palette.gray[400],
            borderColor: "transparent",
          },
          "&[data-disabled]": {
            backgroundColor: vars.color.palette.gray[200],
            color: vars.color.palette.gray[600],
          },
        },
      },
    },

    // outline + primary
    {
      variants: { variant: "outline", intent: "primary" },
      style: {
        borderColor: vars.color.palette.gray[700],
        color: vars.color.palette.gray[800],
        selectors: {
          "&[data-hovered]": {
            color: vars.color.palette.green[500],
            borderColor: vars.color.palette.green[600],
          },
          "&[data-pressed]": {
            color: vars.color.palette.green[700],
            borderColor: vars.color.palette.green[700],
          },
          "&[data-disabled]": {
            color: vars.color.palette.green[200],
            borderColor: vars.color.palette.green[200],
          },
        },
      },
    },

    // outline + neutral
    {
      variants: { variant: "outline", intent: "neutral" },
      style: {
        borderColor: vars.color.border.action,
        color: vars.color.text.content,
        selectors: {
          "&[data-hovered]": {
            borderColor: vars.color.border.hover,
            backgroundColor: vars.color.bg.surface,
          },
          "&[data-pressed]": {
            borderColor: vars.color.border.action,
            backgroundColor: vars.color.bg.subtle,
          },
          "&[data-disabled]": {
            borderColor: vars.color.bg.disable,
            color: vars.color.text.disable,
          },
        },
      },
    },

    // ghost + primary
    {
      variants: { variant: "ghost", intent: "primary" },
      style: {
        color: vars.color.palette.gray[700],
        selectors: {
          "&[data-hovered]": {
            color: vars.color.palette.green[500],
          },
          "&[data-pressed]": {
            color: vars.color.palette.green[700],
          },
          "&[data-disabled]": {
            color: vars.color.palette.green[200],
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

const bounce = keyframes({
  "0%, 100%": {
    transform: "translateY(0)",
  },
  "50%": {
    transform: "translateY(-4px)",
  },
});

export const loadingDots = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "2px",
  height: "100%",
  justifyContent: "center",
});

export const dot = style({
  width: "4px",
  height: "4px",
  borderRadius: "50%",
  backgroundColor: "currentColor",
  animation: `${bounce} 1s infinite ease-in-out`,
});
