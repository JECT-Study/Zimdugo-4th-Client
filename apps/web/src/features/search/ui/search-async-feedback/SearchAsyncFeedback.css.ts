import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const root = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.spacing[12],
  width: "100%",
  padding: `${vars.spacing[40]} ${vars.spacing[20]}`,
  boxSizing: "border-box",
  textAlign: "center",
});

export const iconSlot = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const title = style({
  margin: 0,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  color: vars.color.text.title,
  lineHeight: 1.4,
});

export const helper = style({
  margin: 0,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Regular,
  color: vars.color.text.surface,
  lineHeight: 1.5,
  whiteSpace: "pre-line",
});

export const hint = style({
  margin: 0,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Regular,
  color: vars.color.text.surface,
  lineHeight: 1.5,
});

export const retryButton = style({
  marginTop: vars.spacing[4],
  padding: `${vars.spacing[8]} ${vars.spacing[16]}`,
  border: `1px solid ${vars.color.palette.gray[300]}`,
  borderRadius: "8px",
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  cursor: "pointer",
});
