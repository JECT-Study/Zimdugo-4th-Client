import { recipe } from "@vanilla-extract/recipes";

export const root = recipe({
  base: {
    display: "inline-block",
    flexShrink: 0,
  },
  variants: {
    size: {
      s: {
        width: "300px",
        height: "300px",
      },
      l: {
        width: "400px",
        height: "400px",
      },
    },
  },
  defaultVariants: {
    size: "s",
  },
});
