import { createGlobalTheme } from "@vanilla-extract/css";

const scale = {
  4: "blur(calc(4px / 2))",
  8: "blur(calc(8px / 2))",
  12: "blur(calc(12px / 2))",
} as const;

const theme = createGlobalTheme(":root", { blur: scale });

export const blur = {
  ...theme.blur,
  scale,
};
