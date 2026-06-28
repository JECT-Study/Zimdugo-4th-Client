import { vars } from "@repo/ui/vars";
import { style, styleVariants } from "@vanilla-extract/css";

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
