import { createGlobalTheme } from "@vanilla-extract/css";

const scale = {
  0: "0px",
  2: "2px",
  4: "4px",
  6: "6px",
  8: "8px",
  10: "10px",
  12: "12px",
  16: "16px",
  24: "24px",
  max: "9999px",
} as const;

const theme = createGlobalTheme(":root", { radius: scale });

export const radius = {
  ...theme.radius,
  scale,
};
