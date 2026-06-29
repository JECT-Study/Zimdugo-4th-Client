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
  maxWidth: vars.layout.appMaxWidth,
  margin: "0 auto",
  padding: `32px ${vars.spacing[16]} calc(${vars.layout.bottomNav} + ${vars.spacing[24]})`,
  boxSizing: "border-box",
  "@media": {
    [`screen and (min-width: ${vars.layout.tabletBreakpoint})`]: {
      maxWidth: vars.layout.tabletAppMaxWidth,
    },
  },
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
  whiteSpace: "pre-wrap",
});

export const noticeListItem = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
  padding: `${vars.spacing[16]} 0`,
  borderBottom: `1px solid ${vars.color.border.default}`,
  cursor: "pointer",
  background: "none",
  border: "none",
  width: "100%",
  textAlign: "left",
  ":first-child": {
    paddingTop: 0,
  },
  ":last-child": {
    borderBottom: "none",
    paddingBottom: 0,
  },
});

export const noticeListItemTitle = style({
  margin: 0,
  color: vars.color.palette.gray[800],
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "1.4",
});

export const noticeListItemDate = style({
  margin: 0,
  color: vars.color.palette.gray[400],
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "1.2",
});

export const noticeDetailImage = style({
  width: "100%",
  borderRadius: vars.radius.scale[8],
  display: "block",
  objectFit: "cover",
});

export const noticeImageContainer = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[16],
  marginBottom: vars.spacing[24],
});
