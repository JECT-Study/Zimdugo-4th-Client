import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../../vars.css.ts";

export const snackbar = recipe({
  base: {
    position: "relative",
    width: "100%",
    minHeight: "54px",
    padding: `0 14px 0 ${vars.spacing[16]}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: vars.spacing[16],
    borderRadius: vars.radius[10],
    boxSizing: "border-box",
    overflow: "hidden",
    pointerEvents: "auto",
  },
  variants: {
    variant: {
      light: {
        border: `1px solid ${vars.color.palette.gray[200]}`,
        backgroundColor: vars.color.bg.default,
        color: vars.color.text.title,
        boxShadow: vars.shadow[2],
      },
      dark: {
        border: 0,
        backgroundColor: "rgba(51, 56, 61, 0.85)",
        color: vars.color.text.white,
      },
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

export const message = style({
  minWidth: 0,
  flex: 1,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: vars.typography.lineHeight.tight,
  overflowWrap: "anywhere",
  whiteSpace: "pre-line",
});

export const action = recipe({
  base: {
    flexShrink: 0,
    border: 0,
    background: "transparent",
    padding: `${vars.spacing[8]} 0`,
    fontSize: vars.typography.fontSize[12],
    fontWeight: vars.typography.fontWeight.SemiBold,
    lineHeight: vars.typography.lineHeight.tight,
    cursor: "pointer",
    whiteSpace: "nowrap",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    selectors: {
      "&[data-hovered]": {
        textDecoration: "underline",
      },
      "&[data-pressed]": {
        opacity: 0.8,
      },
      "&[data-focus-visible]": {
        outline: `2px solid ${vars.color.focus}`,
        outlineOffset: "2px",
      },
    },
  },
  variants: {
    variant: {
      light: {
        color: vars.color.text.brand,
      },
      dark: {
        color: "#54B2FF",
      },
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

export const closeButton = recipe({
  base: {
    padding: 0,
    border: 0,
    borderRadius: vars.radius.max,
    background: "transparent",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "18px",
    height: "18px",
    flexShrink: 0,
    selectors: {
      "&[data-focus-visible]": {
        outline: `2px solid ${vars.color.focus}`,
        outlineOffset: "2px",
      },
    },
  },
  variants: {
    variant: {
      light: {
        selectors: {
          "&[data-hovered]": {
            backgroundColor: vars.color.bg.surface,
          },
          "&[data-pressed]": {
            backgroundColor: vars.color.bg.active,
          },
        },
      },
      dark: {
        selectors: {
          "&[data-pressed]": {
            opacity: 0.8,
          },
        },
      },
    },
  },
  defaultVariants: {
    variant: "light",
  },
});
