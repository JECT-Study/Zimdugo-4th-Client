import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const flagFrame = style({
  position: "relative",
  display: "inline-block",
  width: "25px",
  height: "20px",
  flexShrink: 0,
  overflow: "hidden",
  borderRadius: vars.radius.scale[6],
  boxSizing: "border-box",
  backgroundColor: vars.color.bg.default,
});

export const flagFrameBorder = style({
  boxShadow: `inset 0 0 0 1px ${vars.color.border.default}`,
});

export const flagImage = style({
  position: "absolute",
  display: "block",
  inset: 0,
  width: "100%",
  height: "100%",
  userSelect: "none",
  pointerEvents: "none",
});
