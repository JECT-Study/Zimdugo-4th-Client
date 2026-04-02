import { createGlobalTheme } from "@vanilla-extract/css";

const scale = {
  2: "2px",
  4: "4px",
  8: "8px",
  12: "12px",
  16: "16px",
  20: "20px",
  24: "24px",
  28: "28px",
} as const;

const theme = createGlobalTheme(":root", { spacing: scale });

export const spacing = {
  ...theme.spacing,
  scale,
};
