import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

export const root = style({
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.spacing[12],
  position: "relative",
});

globalStyle(`${root} > label::before`, {
  content: '""',
  position: "absolute",
  inset: 0,
  cursor: "pointer",
  zIndex: 1,
});

globalStyle(`${root} > label[data-disabled]::before`, {
  cursor: "not-allowed",
});
