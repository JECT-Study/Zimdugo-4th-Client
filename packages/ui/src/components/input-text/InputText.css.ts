import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../vars.css.ts";

export const inputText = style({
  flex: 1,
  minWidth: 0,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  color: vars.color.text.title,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  textAlign: "left",
  backgroundColor: "transparent",
  border: "none",
  outline: "none",
  "::placeholder": {
    color: vars.color.text.surface,
    fontWeight: vars.typography.fontWeight.Medium,
  },
  selectors: {
    "&[data-disabled]": {
      cursor: "not-allowed",
    },
  },
});

export const inputTextTone = styleVariants({
  on: {
    color: vars.color.text.title,
    "::placeholder": {
      color: vars.color.text.surface,
    },
  },
  off: {
    color: vars.color.text.disable,
    "::placeholder": {
      color: vars.color.text.disable,
    },
  },
});
