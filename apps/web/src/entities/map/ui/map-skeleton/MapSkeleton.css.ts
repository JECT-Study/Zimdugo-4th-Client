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

export const topControlSkeleton = style({
  position: "absolute",
  top: "112px",
  right: vars.spacing[16],
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  zIndex: 2,
});

export const bottomControlSkeleton = style({
  position: "absolute",
  right: vars.spacing[16],
  bottom: `calc(${vars.layout.bottomNav} + 36px)`,
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  zIndex: 2,
});
