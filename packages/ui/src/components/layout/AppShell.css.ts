import { style } from "@vanilla-extract/css";

export const shell = style({
  width: "100%",
  height: "100%",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

export const main = style({
  flex: 1,
  minHeight: 0,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  paddingBottom: 0,
});
