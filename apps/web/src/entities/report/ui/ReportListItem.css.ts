import { vars } from "@repo/ui/vars";
import { style, styleVariants } from "@vanilla-extract/css";

export const root = style({
  display: "block",
  width: "100%",
  maxWidth: "335px",
  minWidth: 0,
  height: "auto",
  padding: vars.spacing[12],
  boxSizing: "border-box",
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius[8],
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.title,
  textAlign: "left",
});

export const cardButton = style({
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

export const content = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  width: "100%",
  minWidth: 0,
});

export const statusRow = style({
  display: "flex",
  justifyContent: "flex-end",
  width: "100%",
  minWidth: 0,
});

export const bodyContent = style({
  display: "grid",
  gridTemplateColumns: "76px minmax(0, 1fr) 20px",
  alignItems: "center",
  gap: vars.spacing[12],
  width: "100%",
  minWidth: 0,
});

export const textColumn = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  minWidth: 0,
  gap: vars.spacing[4],
});

export const titleLabel = style({
  width: "100%",
  overflow: "hidden",
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const address = style({
  width: "100%",
  overflow: "hidden",
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "18px",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const metaRow = style({
  display: "flex",
  alignItems: "center",
  width: "100%",
  minWidth: 0,
  gap: vars.spacing[4],
  overflow: "hidden",
  color: vars.color.text.content,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "18px",
  whiteSpace: "nowrap",
});

export const metaDetail = style({
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const metaDot = style({
  flexShrink: 0,
  color: vars.color.text.surface,
});

export const metaTime = style({
  flexShrink: 0,
});

export const reportStatus = style({
  display: "inline-flex",
  flexShrink: 0,
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
    borderColor: vars.color.border.action,
    backgroundColor: vars.color.bg.default,
    color: vars.color.text.content,
  },
  approved: {
    borderColor: vars.color.palette.green[500],
    backgroundColor: vars.color.bg.default,
    color: vars.color.palette.green[500],
  },
  rejected: {
    borderColor: vars.color.danger.default,
    backgroundColor: vars.color.bg.default,
    color: vars.color.danger.default,
  },
});

export const imageFrameSlot = style({
  gridColumn: "auto",
});

export const chevron = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "20px",
  height: "20px",
  color: vars.color.text.surface,
  transform: "rotate(180deg)",
});
