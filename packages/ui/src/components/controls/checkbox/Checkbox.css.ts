import { style, styleVariants } from "@vanilla-extract/css";
import { color } from "../../../tokens/color/color.css.ts";
import { radius } from "../../../tokens/radius/radius.css.ts";
import { spacing } from "../../../tokens/spacing/spacing.css.ts";
import { typography } from "../../../tokens/typography/typography.css.ts";

export const root = style({
  display: "inline-flex",
  alignItems: "center",
  gap: spacing.scale[8],
});

export const rootLocation = styleVariants({
  left: { flexDirection: "row-reverse" },
  right: { flexDirection: "row" },
  bottom: { flexDirection: "column" }, // labelLocation="bottom"이면 텍스트가 아래, 체크박스가 위
});

export const box = style({
  width: "20px",
  height: "20px",
  borderRadius: radius.scale[2],
  borderWidth: "1px",
  borderStyle: "solid",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  flexShrink: 0,
});

export const boxState = styleVariants({
  default: {
    backgroundColor: color.bg.subtle,
    borderColor: color.bg.disable,
  },
  hover: {
    backgroundColor: color.bg.brand.disable,
    borderColor: color.border.hover,
  },
  pressed: {
    backgroundColor: color.bg.brand.default,
    borderColor: color.bg.brand.default,
  },
  disabled: {
    backgroundColor: color.bg.surface,
    borderColor: color.bg.surface,
  },
  focus: {
    backgroundColor: color.bg.subtle,
    borderColor: color.focus,
  },
});

export const checkSvg = style({
  width: "12px",
  height: "12px",
  display: "block",
});

export const label = style({
  margin: 0,
  fontSize: typography.scale.fontSize[14],
  fontWeight: typography.scale.fontWeight.Medium,
  lineHeight: 1.2,
  color: color.text.surface,
  whiteSpace: "nowrap",
});
