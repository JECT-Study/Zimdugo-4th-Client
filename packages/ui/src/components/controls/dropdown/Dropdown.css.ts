import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { color } from "../../../tokens/color/color.css.ts";
import { radius } from "../../../tokens/radius/radius.css.ts";
import { spacing } from "../../../tokens/spacing/spacing.css.ts";
import { typography } from "../../../tokens/typography/typography.css.ts";

export const dropdownRecipe = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    height: "32px",
    gap: spacing.scale[4],
    paddingLeft: spacing.scale[12],
    paddingRight: spacing.scale[8],
    paddingTop: spacing.scale[8],
    paddingBottom: spacing.scale[8],
    borderRadius: radius.scale[16],
    borderWidth: "1px",
    borderStyle: "solid",
    fontSize: typography.scale.fontSize[14],
    fontWeight: typography.scale.fontWeight.Medium,
    lineHeight: 1.2,
    textDecoration: "none",
    cursor: "pointer",
    outline: "none",
    maxWidth: "100%",
    selectors: {
      "&[data-focus-visible]": {
        boxShadow: `0 0 0 2px ${color.focus}`,
      },
    },
  },

  variants: {
    state: {
      default: {
        borderColor: color.palette.gray[500],
        backgroundColor: color.palette.gray[100],
        color: color.text.content,
        selectors: {
          "&[data-hovered]": {
            borderColor: color.border.hover,
          },
        },
      },
      active: {
        borderColor: color.focus,
        backgroundColor: color.palette.gray[100],
        color: color.text.brand,
        selectors: {
          "&[data-hovered]": {
            borderColor: color.palette.green[600],
          },
        },
      },
    },
  },

  defaultVariants: {
    state: "default",
  },
});

export const label = style({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const iconWrap = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "14px",
  height: "14px",
  flexShrink: 0,
});
