import { style } from "@vanilla-extract/css";

export const shell = style({
  width: "100%",
  height: "100%",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

export const documentShell = style({
  height: "auto",
  minHeight: "100dvh",
  overflow: "visible",
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

export const documentMain = style({
  overflow: "visible",
});
