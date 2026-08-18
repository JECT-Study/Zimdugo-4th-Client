import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../../vars.css.ts";

export const root = recipe({
  base: {
    position: "relative",
    display: "block",
    width: "100%",
    borderRadius: vars.radius[8],
    boxSizing: "border-box",
    cursor: "text",
  },
  variants: {
    size: {
      default: {
        minHeight: "200px",
        padding: vars.spacing[16],
        backgroundColor: vars.color.border.default,
        opacity: 0.6,
        selectors: {
          "&:focus-within": {
            opacity: 1,
          },
        },
      },
      compact: {
        height: "170px",
        padding: vars.spacing[12],
        backgroundColor: vars.color.bg.surface,
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export const field = recipe({
  base: {
    width: "100%",
    border: 0,
    outline: 0,
    resize: "none",
    backgroundColor: "transparent",
    color: vars.color.text.title,
    fontFamily: "inherit",
    lineHeight: "1.5",
    boxSizing: "border-box",
    selectors: {
      "&::placeholder": {
        color: vars.color.text.surface,
      },
    },
  },
  variants: {
    size: {
      default: {
        minHeight: "168px",
        maxHeight: "168px",
        padding: 0,
        overflow: "hidden",
        fontSize: vars.typography.fontSize[16],
        fontWeight: vars.typography.fontWeight.Medium,
      },
      compact: {
        height: "100%",
        padding: 0,
        paddingRight: vars.spacing[24],
        paddingBottom: vars.spacing[24],
        fontSize: vars.typography.fontSize[12],
        fontWeight: vars.typography.fontWeight.Regular,
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export const accessories = recipe({
  base: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    gap: vars.spacing[8],
    height: "24px",
    pointerEvents: "none",
  },
  variants: {
    size: {
      default: {
        right: vars.spacing[16],
        bottom: "14px",
      },
      compact: {
        right: vars.spacing[12],
        bottom: vars.spacing[12],
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export const counter = style({
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "1.2",
});

export const trailingIconSlot = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  flexShrink: 0,
});
