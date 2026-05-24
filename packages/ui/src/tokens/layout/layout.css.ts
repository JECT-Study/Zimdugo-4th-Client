import { createGlobalTheme } from "@vanilla-extract/css";

export const layoutScale = {
  header: "56px",
  bottomNav: "60px",
  bottomCTA: "64px",
  contentBottomPadding: "60px",
  detailBottomPadding: "64px",
  containerWidth: "375px",
  touchTarget: "44px",
  sidePadding: "16px",
} as const;

export const layoutTheme = createGlobalTheme(":root", {
  layout: layoutScale,
});

export const layout = {
  ...layoutTheme,
  scale: layoutScale,
};
