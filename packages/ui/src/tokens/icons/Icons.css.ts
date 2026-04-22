import { style, styleVariants } from "@vanilla-extract/css";
import { color } from "../color/color.css.ts";

/** width/height 속성으로 크기를 주는 아이콘용 */
export const iconSvgFixed = style({
  display: "block",
  flexShrink: 0,
});

export const brandSymbolRoot = style({
  position: "relative",
  display: "block",
  width: "100%",
  height: "100%",
});

export const brandSymbolBase = style({
  display: "block",
  position: "absolute",
  inset: 0,
});

export const locationAvatarRoot = style({
  position: "relative",
  width: "32px",
  height: "32px",
  borderRadius: "9999px",
  flexShrink: 0,
  overflow: "hidden",
  backgroundColor: color.palette.gray[300],
});


export const circleBoxRoot = style({
  borderRadius: "9999px",
  backgroundColor: color.palette.gray[300],
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

export const circleBoxSize = styleVariants({
  24: {
    width: "24px",
    height: "24px",
  },
  32: {
    width: "32px",
    height: "32px",
  },
  48: {
    width: "48px",
    height: "48px",
  },
});

export const circleBoxContent = style({
  width: "100%",
  height: "100%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const circleBoxGlyph = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  flexShrink: 0,
});

export const circleBoxGlyph20 = style([
  circleBoxGlyph,
  {
    width: "20px",
    height: "20px",
  },
]);
