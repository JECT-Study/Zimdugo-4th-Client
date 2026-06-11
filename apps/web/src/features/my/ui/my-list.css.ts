import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const summaryText = style({
  width: "100%",
  marginBottom: vars.spacing[16],
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.4,
});

export const listCard = style({
  display: "flex",
  alignItems: "stretch",
  width: "100%",
  border: 0,
  borderRadius: vars.radius[8],
  backgroundColor: vars.color.bg.surface,
  textAlign: "left",
  boxSizing: "border-box",
});

export const listCardPressable = style({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  gap: vars.spacing[4],
  minWidth: 0,
  padding: vars.spacing[16],
  border: 0,
  backgroundColor: "transparent",
  textAlign: "left",
  cursor: "pointer",
  selectors: {
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: "2px",
    },
  },
});

export const listCardBody = style({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  gap: vars.spacing[4],
  minWidth: 0,
  padding: vars.spacing[16],
});

export const listCardTitle = style({
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.3,
});

export const listCardAddress = style({
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.4,
});

export const listCardMeta = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.spacing[8],
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.4,
});

export const listCardDeleteButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "stretch",
  minWidth: "64px",
  padding: `0 ${vars.spacing[12]}`,
  border: 0,
  borderLeft: `1px solid ${vars.color.border.default}`,
  backgroundColor: "transparent",
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.SemiBold,
  cursor: "pointer",
  selectors: {
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: "-2px",
    },
  },
});

export const errorRoot = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.spacing[16],
  width: "100%",
  paddingTop: vars.spacing[24],
  textAlign: "center",
});

export const errorTitle = style({
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.4,
});

export const undoToast = style({
  position: "fixed",
  left: vars.spacing[16],
  right: vars.spacing[16],
  bottom: `calc(env(safe-area-inset-bottom, 0px) + ${vars.layout.bottomNav} + ${vars.spacing[16]})`,
  zIndex: 1200,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.spacing[12],
  padding: `${vars.spacing[12]} ${vars.spacing[16]}`,
  borderRadius: vars.radius[8],
  backgroundColor: vars.color.palette.gray[800],
  color: vars.color.text.white,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
});

export const undoToastMessage = style({
  flex: 1,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.4,
});

export const undoToastAction = style({
  border: 0,
  background: "transparent",
  color: vars.color.text.brand,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.SemiBold,
  cursor: "pointer",
  whiteSpace: "nowrap",
});

export const reportDetailRow = style({
  display: "flex",
  justifyContent: "space-between",
  gap: vars.spacing[12],
  width: "100%",
  fontSize: vars.typography.fontSize[14],
  lineHeight: 1.5,
});

export const reportDetailLabel = style({
  flexShrink: 0,
  color: vars.color.text.surface,
  fontWeight: vars.typography.fontWeight.Medium,
});

export const reportDetailValue = style({
  color: vars.color.text.title,
  fontWeight: vars.typography.fontWeight.SemiBold,
  textAlign: "right",
});
