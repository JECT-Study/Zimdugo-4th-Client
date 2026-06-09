import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const root = style({
  width: "100%",
  boxSizing: "border-box",
  paddingLeft: vars.spacing[16],
  paddingRight: vars.spacing[16],
});

export const inSheetHeader = style({
  flex: 1,
  minWidth: 0,
  paddingLeft: 0,
  paddingRight: 0,
});

export const text = style({
  margin: 0,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
  color: vars.color.palette.gray[800],
});

export const subtitle = style({
  margin: 0,
  marginTop: vars.spacing[4],
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  color: vars.color.text.surface,
});

export const queryEmphasis = style({
  fontWeight: vars.typography.fontWeight.SemiBold,
});
