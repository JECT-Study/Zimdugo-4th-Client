import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const root = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  width: "100%",
  minHeight: "72px",
  padding: `${vars.spacing[8]} ${vars.spacing[20]}`,
  border: 0,
  borderRadius: "6px",
  boxSizing: "border-box",
  background: "transparent",
  color: "inherit",
  textAlign: "left",
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&[data-focus-visible]": {
      boxShadow: `inset 0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const leadingContent = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.spacing[8],
  minWidth: 0,
  flex: 1,
});

export const marker = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "54.5px",
  height: "54.5px",
  flexShrink: 0,
});

export const textColumn = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
  minWidth: 0,
  flex: 1,
});

export const title = style({
  overflow: "hidden",
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const address = style({
  overflow: "hidden",
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const updated = style({
  overflow: "hidden",
  color: vars.color.text.disable,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const trailingContent = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  justifyContent: "center",
  gap: vars.spacing[4],
  flexShrink: 0,
  paddingLeft: vars.spacing[12],
  color: vars.color.text.disable,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
});
