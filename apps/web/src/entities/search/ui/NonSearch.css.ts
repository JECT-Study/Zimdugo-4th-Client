import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const root = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  minHeight: "260px",
  gap: vars.spacing[16],
  padding: "32px 0",
});

export const title = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.spacing[8],
  textAlign: "center",
  padding: vars.spacing[8],
});

export const languageBlock = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.spacing[8],
  width: "100%",
  padding: vars.spacing[8],
});

export const inputTextDisplay = style({
  flex: "none",
  width: "100%",
  maxWidth: "min(100%, 336px)",
  textAlign: "center",
  pointerEvents: "none",
  whiteSpace: "normal",
  overflow: "visible",
  textOverflow: "clip",
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
  textWrap: "balance",
});

export const inputTextSubBlock = style({});

export const textTitle = style({
  margin: 0,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  color: vars.color.text.title,
  textAlign: "center",
});

export const textSub = style({
  margin: 0,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "120%",
  color: vars.color.text.content,
  textAlign: "center",
  whiteSpace: "pre-line",
});

export const queryText = style({
  color: vars.color.text.content,
});

export const description = style({
  color: vars.color.palette.gray[600],
});
