import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

const interactiveRoot = {
  width: "100%",
  padding: 0,
  border: 0,
  background: "transparent",
  color: "inherit",
  textAlign: "left",
  cursor: "pointer",
  outline: "none",
  borderRadius: "6px",
  selectors: {
    "&[data-focus-visible]": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
} as const;

export const root = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: vars.spacing[4],
  width: "100%",
  minWidth: 0,
});

export const pressableRoot = style({
  ...interactiveRoot,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: vars.spacing[4],
  width: "100%",
  minWidth: 0,
});

export const titleRow = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: vars.spacing[2],
  width: "100%",
  minWidth: 0,
});

export const title = style({
  width: "100%",
  overflow: "hidden",
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const englishCaptionText = style({
  width: "100%",
  overflow: "hidden",
  color: vars.color.text.disable,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Regular,
  lineHeight: 1.3,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const metaRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[4],
  width: "100%",
  minWidth: 0,
  color: vars.color.text.disable,
  fontSize: vars.typography.fontSize[13],
  fontWeight: vars.typography.fontWeight.Regular,
  lineHeight: 1.2,
});

export const metaDot = style({
  flexShrink: 0,
});
