import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const line = style({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  minWidth: 0,
  margin: 0,
  fontSize: "12px",
  lineHeight: "16px",
});

export const indicator = style({
  width: "6px",
  height: "6px",
  flexShrink: 0,
});

export const status = style({
  color: vars.color.text.title,
  fontWeight: vars.typography.fontWeight.SemiBold,
  whiteSpace: "nowrap",
});

export const updated = style({
  overflow: "hidden",
  color: vars.color.text.disable,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
