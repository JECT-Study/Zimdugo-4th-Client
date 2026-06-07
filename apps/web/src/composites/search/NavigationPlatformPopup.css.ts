import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const overlay = style({
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.spacing[20],
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(2px)",
  zIndex: vars.zIndex.modal,
});

export const dialog = style({
  width: "343px",
  minHeight: "244px",
  padding: "18px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[20],
  borderRadius: vars.radius[10],
  backgroundColor: vars.color.bg.default,
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)",
  outline: "none",
});

export const title = style({
  margin: 0,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[18],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
  textAlign: "center",
});

export const platformGrid = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: vars.spacing[12],
  width: "100%",
});

export const platformButton = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  minHeight: "118px",
  padding: vars.spacing[16],
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius[10],
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.title,
  cursor: "pointer",
  selectors: {
    "&[data-hovered]": {
      borderColor: vars.color.border.hover,
      backgroundColor: vars.color.bg.surface,
    },
    "&[data-focus-visible]": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const platformIcon = style({
  width: "48px",
  height: "48px",
  display: "block",
  borderRadius: vars.radius[10],
  objectFit: "cover",
});

export const platformLabel = style({
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
});

export const cancelButton = style({
  width: "100%",
  height: "40px",
  fontSize: vars.typography.fontSize[14],
});
