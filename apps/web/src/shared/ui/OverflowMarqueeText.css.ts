import { keyframes, style } from "@vanilla-extract/css";

const marquee = keyframes({
  "0%, 12%": {
    transform: "translateX(0)",
  },
  "88%, 100%": {
    transform: "translateX(calc(-1 * var(--overflow-marquee-distance)))",
  },
});

export const root = style({
  display: "block",
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  overflow: "hidden",
  whiteSpace: "nowrap",
});

export const track = style({
  display: "inline-flex",
  maxWidth: "none",
  alignItems: "center",
  willChange: "transform",
});

export const activeTrack = style({
  animationName: marquee,
  animationDuration: "var(--overflow-marquee-duration)",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
  animationDirection: "alternate",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
      transform: "translateX(0)",
    },
  },
});

export const text = style({
  display: "inline-block",
  flexShrink: 0,
});

export const spacer = style({
  width: "32px",
  flexShrink: 0,
});
