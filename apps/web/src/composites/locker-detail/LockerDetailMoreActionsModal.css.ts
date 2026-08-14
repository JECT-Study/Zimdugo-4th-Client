import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const overlay = style({
  position: "fixed",
  inset: 0,
  zIndex: vars.zIndex.modal,
  backgroundColor: "rgba(0, 0, 0, 0.32)",
});

export const modal = style({
  position: "absolute",
  width: "min(235px, calc(100vw - 32px))",
  maxHeight: "calc(100dvh - 32px)",
  overflowY: "auto",
  outline: 0,
});

export const dialog = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[12],
  padding: vars.spacing[16],
  borderRadius: vars.radius[16],
  backgroundColor: vars.color.bg.default,
  boxShadow: vars.shadow[3],
  outline: 0,
});

export const header = style({
  display: "flex",
  justifyContent: "flex-end",
});

export const closeButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  padding: 0,
  border: 0,
  borderRadius: vars.radius.max,
  background: "transparent",
  cursor: "pointer",
});

export const actionList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
});

export const actionButton = style({
  display: "flex",
  alignItems: "center",
  width: "100%",
  minHeight: "40px",
  gap: vars.spacing[12],
  padding: `${vars.spacing[8]} ${vars.spacing[12]}`,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius[8],
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.content,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "24px",
  textAlign: "left",
  cursor: "pointer",
});

export const actionLabel = style({
  minWidth: 0,
  flex: 1,
  textAlign: "left",
  overflowWrap: "anywhere",
});

export const reportActionButton = style({
  color: vars.color.text.error,
});

export const actionIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  flexShrink: 0,
});
