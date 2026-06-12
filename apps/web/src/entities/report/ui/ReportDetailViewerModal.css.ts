import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const overlay = style({
  position: "fixed",
  inset: 0,
  zIndex: vars.zIndex.modal,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(2px)",
});

export const panel = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: vars.layout.containerWidth,
  maxHeight: "92dvh",
  borderRadius: `${vars.radius[12]} ${vars.radius[12]} 0 0`,
  backgroundColor: vars.color.bg.default,
  boxShadow: vars.shadow[2],
  overflow: "hidden",
  outline: "none",
});

export const stateMessage = style({
  margin: 0,
  color: vars.color.text.content,
  fontSize: vars.typography.fontSize[14],
  lineHeight: 1.5,
});

export const photoImage = style({
  width: "100%",
  maxHeight: "240px",
  objectFit: "cover",
  borderRadius: vars.radius[8],
  border: `1px solid ${vars.color.border.default}`,
});

export const photoPlaceholder = style({
  width: "100%",
});

export const footer = style({
  flexShrink: 0,
  padding: `${vars.spacing[12]} ${vars.spacing[20]} calc(env(safe-area-inset-bottom, 0px) + ${vars.spacing[12]})`,
  borderTop: `1px solid ${vars.color.palette.gray[200]}`,
  backgroundColor: vars.color.bg.default,
});

export const closeButton = style({
  width: "100%",
});

export const informationBody = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[20],
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  scrollbarWidth: "none",
  padding: `${vars.spacing[20]} ${vars.spacing[20]} ${vars.spacing[24]}`,
  boxSizing: "border-box",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
      width: 0,
      height: 0,
    },
  },
});

export const informationTitleRow = style({
  display: "block",
  width: "100%",
});

export const informationTitleCopy = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  gap: vars.spacing[4],
});

export const informationEyebrow = style({
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
});

export const informationLockerTitle = style({
  margin: 0,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[20],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.35,
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
});

export const informationPhoto = style({
  flexShrink: 0,
  width: "100%",
  margin: 0,
});

export const informationGroup = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
});

export const informationGroupTitle = style({
  margin: 0,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.4,
});

export const informationList = style({
  display: "flex",
  flexDirection: "column",
  margin: 0,
  padding: 0,
  borderTop: `1px solid ${vars.color.border.default}`,
});

export const informationRow = style({
  display: "grid",
  gridTemplateColumns: "80px minmax(0, 1fr)",
  alignItems: "start",
  gap: vars.spacing[12],
  minHeight: "42px",
  padding: `${vars.spacing[12]} 0`,
  boxSizing: "border-box",
  borderBottom: `1px solid ${vars.color.palette.gray[200]}`,
});

export const informationLabel = style({
  margin: 0,
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.45,
});

export const informationValue = style({
  minWidth: 0,
  margin: 0,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.45,
  whiteSpace: "pre-wrap",
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
});
