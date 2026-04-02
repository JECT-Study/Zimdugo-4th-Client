import { createGlobalTheme } from "@vanilla-extract/css";

const scale = {
  1: "0px 2px 8px 0 rgba(22, 24, 28, 0.12)",
  2: "0px 4px 16px 0 rgba(22, 24, 28, 0.16)",
  3: "0px 8px 40px 0 rgba(22, 24, 28, 0.24)",
} as const;

const theme = createGlobalTheme(":root", { shadow: scale });

export const shadow = {
  ...theme.shadow,
  scale,
};
