import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../../vars.css.ts";

export const root = style({
  display: "flex",
  width: "100%",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
});

export const title = recipe({
  base: {
    lineHeight: 1.2,
    color: vars.color.palette.gray[800],
  },
  variants: {
    size: {
      large: {
        fontSize: vars.typography.fontSize[16],
        fontWeight: vars.typography.fontWeight.Medium,
      },
      small: {
        fontSize: vars.typography.fontSize[14],
        fontWeight: vars.typography.fontWeight.Medium,
      },
    },
  },
  defaultVariants: {
    size: "large",
  },
});

export const subtitle = style({
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  color: vars.color.text.surface,
  flexShrink: 0,
});

