import { style } from "@vanilla-extract/css";
import { vars } from "../../vars.css.ts";

export const controlChipGroupRoot = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: "none",
  gap: vars.spacing[16],
  margin: "0 auto",
  padding: 0,
  border: 0,
  minInlineSize: 0,
  boxSizing: "border-box",
});

export const controlChipGroupRow = style({
  display: "flex",
  width: "100%",
  gap: vars.spacing[8],
  justifyContent: "center",
  alignItems: "center",
});
