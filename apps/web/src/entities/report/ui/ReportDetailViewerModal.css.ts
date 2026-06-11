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

export const header = style({
  flexShrink: 0,
  borderBottom: `1px solid ${vars.color.palette.gray[200]}`,
});

export const body = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[20],
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: `${vars.spacing[16]} ${vars.spacing[20]} ${vars.spacing[24]}`,
  boxSizing: "border-box",
});

export const stateMessage = style({
  margin: 0,
  color: vars.color.text.body,
  fontSize: vars.typography.fontSize[14],
  lineHeight: 1.5,
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
});

export const sectionTitle = style({
  margin: 0,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.4,
});

export const fieldList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const fieldItem = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
});

export const fieldLabel = style({
  color: vars.color.text.disable,
  fontSize: vars.typography.fontSize[12],
  lineHeight: 1.4,
});

export const fieldValue = style({
  color: vars.color.text.body,
  fontSize: vars.typography.fontSize[14],
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
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
