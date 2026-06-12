import { style } from "@vanilla-extract/css";
import { vars } from "@repo/ui/vars";

export const root = style({
  position: "relative",
  flex: 1,
  isolation: "isolate",
  overflow: "hidden",
  width: "100%",
  height: "100%",
  minHeight: "100%",
  minWidth: 0,
  minBlockSize: 0,
  backgroundColor: vars.color.bg.surface,
});

export const canvas = style({
  position: "relative",
  flex: 1,
  zIndex: 0,
  width: "100%",
  height: "100%",
  minHeight: "100%",
  minWidth: 0,
  minBlockSize: 0,
  backgroundColor: vars.color.bg.default,
});
