import { vars } from "@repo/ui/vars";
import { style, styleVariants } from "@vanilla-extract/css";

export const card = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.spacing[12],
  width: "100%",
  height: "64px",
  minHeight: "64px",
  maxHeight: "64px",
  flexShrink: 0,
  padding: "10px 14px",
  boxSizing: "border-box",
  border: "1px solid",
  borderRadius: vars.radius[12],
});

export const cardState = styleVariants({
  available: {
    borderColor: "#A7D9B4",
    backgroundColor: "#F0FAF2",
  },
  unavailable: {
    borderColor: vars.color.border.hover,
    backgroundColor: vars.color.bg.surface,
  },
});

export const labelColumn = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "2px",
  minWidth: 0,
  flexShrink: 0,
});

export const title = style({
  margin: 0,
  fontSize: "13px",
  fontWeight: vars.typography.fontWeight.Bold,
  lineHeight: "16px",
});

export const titleState = styleVariants({
  available: {
    color: "#0D7D30",
  },
  unavailable: {
    color: vars.color.palette.gray[600],
  },
});

export const countText = style({
  flexShrink: 0,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Bold,
  lineHeight: "17px",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
});

export const countTextState = styleVariants({
  available: {
    color: "#0D7D30",
  },
  unavailable: {
    color: vars.color.palette.gray[600],
  },
});

export const updatedAt = style({
  overflow: "hidden",
  maxWidth: "100%",
  color: "#A3A8AD",
  fontSize: "10px",
  lineHeight: "12px",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});
