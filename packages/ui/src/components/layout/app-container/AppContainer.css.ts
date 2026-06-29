import { style } from "@vanilla-extract/css";
import { vars } from "../../../vars.css.ts";

export const container = style({
  width: "100%",
  maxWidth: vars.layout.appMaxWidth,
  margin: "0 auto",
  height: "100svh",
  minHeight: "100svh",
  backgroundColor: vars.color.bg.default,
  boxShadow: vars.shadow[1],
  position: "relative",
  overflow: "hidden",
});

export const documentContainer = style({
  height: "auto",
  minHeight: "100dvh",
  overflow: "visible",
});
