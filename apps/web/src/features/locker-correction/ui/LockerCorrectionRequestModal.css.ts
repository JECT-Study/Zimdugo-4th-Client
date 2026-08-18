import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

export const overlay = style({
  position: "fixed",
  inset: 0,
  zIndex: vars.zIndex.modal,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "clamp(24px, 30vh, 246px) 24px 24px",
  overflowY: "auto",
  backgroundColor: "rgba(10, 13, 15, 0.38)",
  boxSizing: "border-box",
});

export const modal = style({
  width: "min(327px, calc(100vw - 48px))",
  outline: 0,
});

export const dialog = style({
  outline: 0,
});

export const container = style({
  width: "100%",
  overflow: "hidden",
  borderRadius: "20px",
  backgroundColor: vars.color.bg.default,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
});

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "54px",
  margin: "0 14px",
  padding: "0 6px",
  paddingTop: vars.spacing[8],
  borderBottom: `1px solid ${vars.color.border.default}`,
  boxSizing: "border-box",
});

export const title = style({
  margin: 0,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[18],
  fontWeight: vars.typography.fontWeight.Bold,
  lineHeight: vars.typography.lineHeight.normal,
});

export const closeButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  padding: 0,
  border: 0,
  borderRadius: vars.radius.max,
  background: "transparent",
  color: vars.color.icon.default,
  cursor: "pointer",
});

export const content = style({
  display: "flex",
  flexDirection: "column",
  padding: `17px 14px ${vars.spacing[20]}`,
});

export const copy = style({
  padding: "0 6px",
});

export const heading = style({
  margin: 0,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "1.2",
});

export const helper = style({
  margin: "3px 0 0",
  color: vars.color.text.surface,
  fontSize: "11px",
  fontWeight: vars.typography.fontWeight.Regular,
  lineHeight: "normal",
});

export const dropdown = style({
  width: "calc(100% - 6px)",
  marginTop: vars.spacing[20],
});

export const detailsField = style({
  width: "calc(100% - 12px)",
  marginLeft: "5px",
  marginTop: vars.spacing[20],
});

export const submitButton = style({
  width: "calc(100% + 3px)",
  marginTop: "22px",
});

globalStyle(`${submitButton}${submitButton}[data-disabled]`, {
  backgroundColor: vars.color.bg.disable,
  color: vars.color.text.white,
});
