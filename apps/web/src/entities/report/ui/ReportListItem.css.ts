import { vars } from "@repo/ui/vars";
import { style, styleVariants } from "@vanilla-extract/css";

export const root = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: `${vars.spacing[12]} ${vars.spacing[8]}`,
  width: "100%",
  minWidth: 0,
  padding: vars.spacing[16],
  boxSizing: "border-box",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius[8],
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.title,
  textAlign: "left",
  height: "auto",
});

export const cardButton = style({
  border: `1px solid ${vars.color.border.default}`,
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&[data-hovered]": {
      borderColor: vars.color.border.hover,
    },
    "&[data-focus-visible]": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const textColumn = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  gap: vars.spacing[4],
});

export const titleLabel = style({
  overflow: "hidden",
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const metaRow = style({
  display: "flex",
  alignItems: "center",
  minWidth: 0,
  gap: vars.spacing[8],
  overflow: "hidden",
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "18px",
  whiteSpace: "nowrap",
});

export const metaDot = style({
  width: "2px",
  height: "2px",
  flexShrink: 0,
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.text.disable,
});

export const reportStatus = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "24px",
  padding: `0 ${vars.spacing[8]}`,
  border: `1px solid ${vars.color.palette.green[500]}`,
  borderRadius: vars.radius[6],
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1,
  whiteSpace: "nowrap",
});

export const statusVariants = styleVariants({
  pending: {
    backgroundColor: vars.color.bg.default,
    color: vars.color.palette.green[500],
  },
  approved: {
    borderColor: vars.color.border.action,
    backgroundColor: vars.color.bg.default,
    color: vars.color.text.content,
  },
  rejected: {
    borderColor: vars.color.danger.default,
    backgroundColor: vars.color.bg.default,
    color: vars.color.danger.default,
  },
});

export const bodyRow = style({
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "76px minmax(0, 1fr)",
  alignItems: "stretch",
  gap: vars.spacing[12],
  minWidth: 0,
});

export const detailColumn = style({
  display: "grid",
  gridTemplateColumns: "24px minmax(0, 1fr)",
  alignContent: "start",
  gap: vars.spacing[8],
  minWidth: 0,
  paddingTop: vars.spacing[4],
});

export const imageFrameSlot = style({
  gridColumn: "auto",
});

export const locationIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  flexShrink: 0,
});

export const helperText = style({
  display: "-webkit-box",
  overflow: "hidden",
  color: vars.color.text.content,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.35,
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 3,
});
