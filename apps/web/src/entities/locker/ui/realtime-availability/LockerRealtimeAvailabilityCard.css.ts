import { vars } from "@repo/ui/vars";
import { style, styleVariants } from "@vanilla-extract/css";

export const card = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  width: "100%",
  minHeight: "96px",
  padding: `${vars.spacing[12]} ${vars.spacing[16]}`,
  boxSizing: "border-box",
  border: "1px solid",
  borderRadius: vars.radius[8],
});

export const cardState = styleVariants({
  available: {
    borderColor: vars.color.palette.green[200],
    backgroundColor: vars.color.palette.green[100],
  },
  unavailable: {
    borderColor: vars.color.border.default,
    backgroundColor: vars.color.bg.surface,
  },
});

export const title = style({
  margin: 0,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.4,
});

export const countList = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const countItem = style({
  display: "inline-flex",
  alignItems: "baseline",
  gap: vars.spacing[4],
  color: vars.color.text.content,
  fontSize: vars.typography.fontSize[14],
  lineHeight: 1.4,
});

export const sizeLabel = style({
  fontWeight: vars.typography.fontWeight.SemiBold,
});

export const count = style({
  minWidth: "1ch",
  fontWeight: vars.typography.fontWeight.SemiBold,
  fontVariantNumeric: "tabular-nums",
});

export const separator = style({
  color: vars.color.text.disable,
});

export const updatedAt = style({
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  lineHeight: 1.4,
});
