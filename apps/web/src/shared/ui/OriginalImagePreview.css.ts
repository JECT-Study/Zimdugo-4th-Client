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

export const counter = style({
  position: "absolute",
  bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
  left: "50%",
  transform: "translateX(-50%)",
  padding: `${vars.spacing[4]} ${vars.spacing[12]}`,
  borderRadius: vars.radius.max,
  backgroundColor: "rgba(0, 0, 0, 0.55)",
  color: vars.color.palette.gray[100],
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "18px",
  whiteSpace: "nowrap",
});

export const navButton = style({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
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
  selectors: {
    "&:disabled": {
      opacity: 0.32,
      cursor: "default",
    },
  },
});

export const prevButton = style({
  left: vars.spacing[12],
});

export const nextButton = style({
  right: vars.spacing[12],
});

export const nextIcon = style({
  transform: "rotate(180deg)",
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
