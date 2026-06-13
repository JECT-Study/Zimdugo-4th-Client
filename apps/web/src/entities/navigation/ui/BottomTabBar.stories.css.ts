import { style } from "@vanilla-extract/css";

export const storyRelativeFrame = style({
  position: "relative",
  left: 0,
  transform: "none",
  bottom: "auto",
  selectors: {
    "&": {
      position: "relative !important" as any,
      left: "0 !important" as any,
      transform: "none !important" as any,
      bottom: "auto !important" as any,
    },
  },
});
