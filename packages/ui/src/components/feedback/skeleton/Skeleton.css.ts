import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "../../../vars.css.ts";
import {
  SKELETON_BASE_COLOR,
  SKELETON_HIGHLIGHT_COLOR,
  SKELETON_PULSE_DURATION_MS,
  SKELETON_SHIMMER_DURATION_MS,
} from "./skeleton-theme.ts";

const skeletonPulse = keyframes({
  "0%": { opacity: 0.92 },
  "50%": { opacity: 1 },
  "100%": { opacity: 0.92 },
});

const skeletonShimmer = keyframes({
  "0%": { backgroundPositionX: "220%" },
  "100%": { backgroundPositionX: "-220%" },
});

export const skeletonBase = style({
  display: "block",
  width: "100%",
  position: "relative",
  backgroundColor: SKELETON_BASE_COLOR,
  backgroundImage: `linear-gradient(
    100deg,
    ${SKELETON_BASE_COLOR} 0%,
    ${SKELETON_HIGHLIGHT_COLOR} 45%,
    ${SKELETON_BASE_COLOR} 100%
  )`,
  backgroundSize: "220% 100%",
  borderRadius: vars.radius.scale[4],
  overflow: "hidden",
  animation: `${skeletonShimmer} ${SKELETON_SHIMMER_DURATION_MS}ms linear infinite, ${skeletonPulse} ${SKELETON_PULSE_DURATION_MS}ms ease-in-out infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});

export const circle = style({
  borderRadius: vars.radius.max,
});
