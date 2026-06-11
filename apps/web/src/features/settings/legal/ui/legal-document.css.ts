import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const page = style({
  position: "absolute",
  inset: 0,
  minHeight: 0,
  overflowY: "auto",
  overscrollBehavior: "contain",
  background: vars.color.bg.default,
  paddingTop: `calc(env(safe-area-inset-top, 0px) + ${vars.layout.header})`,
});

export const header = style({
  background: vars.color.bg.default,
  borderBottom: `1px solid ${vars.color.palette.gray[200]}`,
});

export const content = style({
  width: "100%",
  maxWidth: vars.layout.containerWidth,
  margin: "0 auto",
  padding: `32px ${vars.spacing[16]} calc(${vars.layout.bottomNav} + ${vars.spacing[24]})`,
  boxSizing: "border-box",
});

export const introText = style({
  margin: `0 0 ${vars.spacing[16]}`,
  paddingLeft: vars.spacing[4],
  color: vars.color.palette.gray[800],
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "1.2",
});

export const documentBox = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[24],
  padding: vars.spacing[16],
  borderRadius: vars.radius.scale[8],
  backgroundColor: vars.color.border.default,
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
});

export const sectionTitle = style({
  margin: 0,
  color: vars.color.palette.gray[800],
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "1.2",
});

export const paragraph = style({
  margin: 0,
  color: vars.color.palette.gray[600],
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "1.2",
});
