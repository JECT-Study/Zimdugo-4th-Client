import { style } from "@vanilla-extract/css";
import { vars } from "@repo/ui/vars";

export const skeletonContainer = style({
  position: "absolute",
  inset: 0,
  zIndex: 1,
  backgroundColor: "transparent",
  pointerEvents: "none",
});

export const mapArea = style({
  position: "absolute",
  inset: 0,
  zIndex: 1,
  backgroundColor: vars.color.bg.surface,
});
