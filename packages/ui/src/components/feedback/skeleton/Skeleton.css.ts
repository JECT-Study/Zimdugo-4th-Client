import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "../../../vars.css.ts";

const skeletonPulse = keyframes({
  "0%": { opacity: 0.5 },
  "50%": { opacity: 0.8 },
  "100%": { opacity: 0.5 },
});

export const skeletonBase = style({
  display: "block",
  width: "100%",
  backgroundColor: vars.color.bg.surface,
  borderRadius: vars.radius.scale[4],
  overflow: "hidden",
  animation: `${skeletonPulse} 1.5s ease-in-out infinite`,
});

export const circle = style({
  borderRadius: vars.radius.max,
});
