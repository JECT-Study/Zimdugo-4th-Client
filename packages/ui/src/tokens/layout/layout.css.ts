import {
  createGlobalTheme,
  createVar,
  fallbackVar,
} from "@vanilla-extract/css";

export const appShellMaxWidthVar = createVar();

export const layoutScale = {
  header: "56px",
  bottomNav: "60px",
  bottomCTA: "64px",
  contentBottomPadding: "60px",
  detailBottomPadding: "64px",
  designWidth: "375px",
  appMaxWidth: "430px",
  tabletAppMaxWidth: "480px",
  tabletBreakpoint: "600px",
  minimumSupportedWidth: "360px",
  containerWidth: "375px",
  touchTarget: "48px",
  sidePadding: "16px",
  safeAreaInlineStart: "max(16px, env(safe-area-inset-left, 0px))",
  safeAreaInlineEnd: "max(16px, env(safe-area-inset-right, 0px))",
} as const;

export const layoutTheme = createGlobalTheme(":root", {
  layout: layoutScale,
});

export const appShellMaxWidth = fallbackVar(
  appShellMaxWidthVar,
  layoutScale.appMaxWidth,
);

export const layout = {
  ...layoutTheme,
  scale: layoutScale,
};
