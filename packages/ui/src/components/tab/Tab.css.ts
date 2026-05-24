import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../../vars.css.ts";

export const tabBar = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
});

export const tab = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    flex: "1 1 0",
    padding: `${vars.spacing[8]} ${vars.spacing[16]}`,
    border: "none",
    borderBottom: `1px solid ${vars.color.border.default}`,
    backgroundColor: "transparent",
    color: vars.color.text.disable,
    fontFamily: "inherit",
    fontSize: "15px",
    fontWeight: vars.typography.fontWeight.Medium,
    lineHeight: "22.5px",
    whiteSpace: "nowrap",
    cursor: "pointer",
    outline: "none",
    transition: "border-color 120ms ease, color 120ms ease",

    selectors: {
      "&[data-hovered]": {
        color: vars.color.text.content,
      },
      "&[data-focus-visible]": {
        outline: `2px solid ${vars.color.focus}`,
        outlineOffset: "-2px",
      },
      "&[data-disabled]": {
        cursor: "not-allowed",
        color: vars.color.text.disable,
      },
      "&[data-selected]": {
        borderBottomWidth: "2px",
        borderBottomColor: vars.color.border.action,
        color: vars.color.text.title,
        fontWeight: vars.typography.fontWeight.SemiBold,
      },
    },
  },
  variants: {
    isSelected: {
      true: {
        borderBottomWidth: "2px",
        borderBottomColor: vars.color.border.action,
        color: vars.color.text.title,
        fontWeight: vars.typography.fontWeight.SemiBold,
      },
      false: {},
    },
  },
  defaultVariants: {
    isSelected: false,
  },
});
