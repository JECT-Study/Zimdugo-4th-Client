import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

export const sheetColumn = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  minHeight: 0,
  padding: `${vars.spacing[24]} ${vars.spacing[16]} 0`,
});

export const contentStack = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[16],
  width: "100%",
  minHeight: 0,
});

export const detailHeader = style({
  display: "flex",
  alignItems: "center",
  width: "100%",
  height: "32px",
});

export const backButton = style({
  width: "32px",
  minWidth: "32px",
  height: "32px",
  padding: 0,
  alignSelf: "start",
  flexShrink: 0,
  color: vars.color.text.title,
});

export const backIcon = style({
  flexShrink: 0,
});

export const fullContentScroll = style({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  paddingBottom: vars.spacing[24],
  WebkitOverflowScrolling: "touch",
  overscrollBehavior: "contain",
  scrollbarWidth: "none",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
});

export const divider = style({
  width: "100%",
  height: "1px",
  margin: `${vars.spacing[8]} 0`,
  backgroundColor: vars.color.border.default,
});

export const imageReportCard = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.spacing[12],
  width: "100%",
  height: "130px",
  padding: vars.spacing[24],
  boxSizing: "border-box",
  border: `1px dashed ${vars.color.border.hover}`,
  borderRadius: vars.radius[6],
  backgroundColor: vars.color.bg.surface,
  color: vars.color.text.surface,
});

export const fullImageReportCard = style({
  height: "200px",
  flexShrink: 0,
});

globalStyle(`${imageReportCard} svg path`, {
  stroke: vars.color.text.surface,
});

export const imageReportText = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2px",
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "18px",
  textAlign: "center",
});

export const actionRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.spacing[8],
  width: "100%",
});

export const iconActionButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "52px",
  height: "32px",
  padding: 0,
  flexShrink: 0,
  border: 0,
  borderRadius: vars.radius[8],
  backgroundColor: vars.color.palette.gray[200],
  cursor: "pointer",
});

export const primaryActionButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "32px",
  minWidth: 0,
  flex: 1,
  padding: `0 ${vars.spacing[16]}`,
  border: 0,
  borderRadius: vars.radius[8],
  backgroundColor: vars.color.palette.green[700],
  color: vars.color.text.white,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  cursor: "pointer",
});

export const fullDetailList = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

export const detailItem = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

export const detailItemContent = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  width: "100%",
  padding: `${vars.spacing[8]} ${vars.spacing[4]}`,
  boxSizing: "border-box",
});

export const detailLeading = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.spacing[8],
  minWidth: 0,
  flex: 1,
});

export const detailIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  flexShrink: 0,
});

export const detailIconNeutral = style({});

globalStyle(`${detailIconNeutral} svg path`, {
  fill: vars.color.text.surface,
});

export const detailTextColumn = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
  minWidth: 0,
  flex: 1,
});

export const detailTitle = style({
  overflow: "hidden",
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const detailDescription = style({
  overflow: "hidden",
  color: vars.color.text.content,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const detailDescriptionMultiline = style({
  overflow: "visible",
  whiteSpace: "normal",
  textOverflow: "clip",
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
});

export const detailTrailing = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: vars.spacing[4],
  flexShrink: 0,
  paddingLeft: vars.spacing[12],
  color: vars.color.text.disable,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
});

export const recentUpdatedText = style({
  margin: 0,
  color: vars.color.text.disable,
  fontSize: "10px",
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  textAlign: "center",
});

export const feedbackRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  width: "100%",
});

export const feedbackButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "32px",
  minWidth: 0,
  flex: 1,
  padding: `0 ${vars.spacing[16]}`,
  border: `1px solid ${vars.color.palette.green[500]}`,
  borderRadius: vars.radius[8],
  backgroundColor: vars.color.bg.default,
  color: vars.color.palette.green[500],
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  cursor: "pointer",
});

export const feedbackButtonNegative = style({
  borderColor: vars.color.danger.default,
  color: vars.color.danger.default,
});

export const feedbackButtonSelected = style({
  backgroundColor: vars.color.palette.green[500],
  color: vars.color.text.white,
});

export const feedbackButtonNegativeSelected = style({
  backgroundColor: vars.color.danger.default,
  color: vars.color.text.white,
});

export const fullActionRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  width: "100%",
});

export const fullIconActionButton = style({
  width: "64px",
  height: "40px",
  padding: 0,
  flexShrink: 0,
});

export const fullPrimaryActionButton = style({
  height: "40px",
  fontSize: vars.typography.fontSize[18],
});
