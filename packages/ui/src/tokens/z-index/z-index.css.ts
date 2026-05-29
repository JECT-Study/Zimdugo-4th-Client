import { createGlobalTheme } from "@vanilla-extract/css";

export const zIndexScale = {
  map: "0",
  pin: "10",
  ui: "20",
  overlay: "100",
  bottomSheet: "1000",
  modal: "1100",
  toast: "1200",
} as const;

export const zIndexTheme = createGlobalTheme(":root", {
  zIndex: zIndexScale,
});

export const zIndex = {
  ...zIndexTheme,
  scale: zIndexScale,
};
