import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const sheetWrapper = style({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  margin: "0 auto",
  width: "100%",
  // Bottom sheet should cover Naver map controls.
  zIndex: vars.zIndex.bottomSheet,
  height: "100%",
  // Keep content scroll gestures available on mobile.
  touchAction: "auto",
  pointerEvents: "none",
});

export const dragHandleZone = style({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "24px",
  zIndex: 1,
  cursor: "ns-resize",
  touchAction: "none",
  pointerEvents: "auto",
  userSelect: "none",
  WebkitUserSelect: "none",
});

export const interactiveContent = style({
  height: "100%",
  pointerEvents: "auto",
});
