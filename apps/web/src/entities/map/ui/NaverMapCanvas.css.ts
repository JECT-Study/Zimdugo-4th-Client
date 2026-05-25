import { style } from "@vanilla-extract/css";
import { vars } from "@repo/ui/vars";

export const root = style({
  position: "relative",
  width: "100%",
  height: "100%",
  minHeight: "100%",
  backgroundColor: vars.color.bg.surface,
});

export const canvas = style({
  width: "100%",
  height: "100%",
  minHeight: "100%",
});

export const statusPanel = style({
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: vars.spacing[12],
  padding: vars.spacing[24],
  textAlign: "center",
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.content,
});

export const statusTitle = style({
  margin: 0,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  color: vars.color.text.title,
});

export const statusDescription = style({
  margin: 0,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Regular,
  color: vars.color.text.surface,
});

export const retryButton = style({
  minWidth: 96,
  height: 36,
  padding: `0 ${vars.spacing[16]}`,
  borderRadius: vars.radius[8],
  backgroundColor: vars.color.bg.brand.default,
  color: vars.color.text.white,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
});
