import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const summaryText = style({
  width: "100%",
  marginBottom: vars.spacing[16],
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.4,
});

export const errorRoot = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.spacing[16],
  width: "100%",
  paddingTop: vars.spacing[24],
  textAlign: "center",
});

export const errorTitle = style({
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.4,
});
