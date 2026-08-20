import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const overlay = style({
  position: "fixed",
  inset: 0,
  zIndex: vars.zIndex.modal,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100dvh",
  padding: `calc(env(safe-area-inset-top, 0px) + 64px) ${vars.spacing[12]} calc(env(safe-area-inset-bottom, 0px) + ${vars.spacing[20]})`,
  boxSizing: "border-box",
  backgroundColor: "rgba(0, 0, 0, 0.82)",
});

export const dialog = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  outline: "none",
});

export const image = style({
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  borderRadius: vars.radius[6],
});

export const closeButton = style({
  position: "absolute",
  top: "calc(env(safe-area-inset-top, 0px) + 12px)",
  right: vars.spacing[12],
  zIndex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "44px",
  height: "44px",
  padding: 0,
  border: 0,
  borderRadius: vars.radius.max,
  backgroundColor: "rgba(255, 255, 255, 0.16)",
  color: vars.color.palette.gray[100],
  cursor: "pointer",
});
