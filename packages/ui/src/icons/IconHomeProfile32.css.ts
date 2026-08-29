import { style } from "@vanilla-extract/css";
import { vars } from "../vars.css.ts";

export const root = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  flexShrink: 0,
  overflow: "hidden",
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.bg.default,
  boxShadow: vars.shadow[2],
});

export const glyph = style({
  display: "block",
  width: "22px",
  height: "22px",
});
