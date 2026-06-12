import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const page = style({
  minHeight: "100dvh",
  backgroundColor: vars.color.bg.default,
  paddingTop: `calc(env(safe-area-inset-top, 0px) + ${vars.layout.header})`,
  paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${vars.layout.bottomNav})`,
  boxSizing: "border-box",
});

export const header = style({
  backgroundColor: vars.color.bg.default,
  borderBottom: `1px solid ${vars.color.palette.gray[200]}`,
});

export const content = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  minHeight: `calc(100dvh - env(safe-area-inset-top, 0px) - ${vars.layout.header} - env(safe-area-inset-bottom, 0px) - ${vars.layout.bottomNav})`,
  padding: `48px ${vars.spacing[16]} ${vars.spacing[24]}`,
  boxSizing: "border-box",
});

export const profileSection = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
});

export const profileImageButton = style({
  display: "inline-flex",
  padding: 0,
  border: 0,
  background: "transparent",
  cursor: "pointer",
  borderRadius: vars.radius.max,
  selectors: {
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: "4px",
    },
    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.6,
    },
  },
});

export const hiddenFileInput = style({
  display: "none",
});

export const nameField = style({
  width: "100%",
  height: "48px",
  marginTop: vars.spacing[16],
  border: 0,
  borderBottom: `2px solid ${vars.color.border.default}`,
  backgroundColor: "transparent",
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "48px",
  outline: "none",
  textAlign: "center",
  boxSizing: "border-box",
  selectors: {
    "&::placeholder": {
      color: vars.color.text.surface,
    },
    "&:focus-visible": {
      borderBottomColor: vars.color.focus,
    },
  },
});

export const menuGroup = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  marginTop: "128px",
  overflow: "hidden",
  borderRadius: vars.radius[8],
  backgroundColor: vars.color.border.default,
});

export const menuRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  minHeight: "64px",
  padding: `0 ${vars.spacing[16]}`,
  border: 0,
  borderBottom: `1px solid ${vars.color.border.hover}`,
  backgroundColor: "transparent",
  cursor: "pointer",
  textAlign: "left",
  boxSizing: "border-box",
  selectors: {
    "&:last-child": {
      borderBottom: 0,
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: "-2px",
    },
  },
});

export const menuRowLabel = style({
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
});

export const menuRowCount = style({
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
});

export const logoutSlot = style({
  display: "flex",
  justifyContent: "center",
  marginTop: "auto",
  paddingTop: vars.spacing[24],
});

export const logoutButton = style({
  minWidth: "112px",
  paddingLeft: vars.spacing[24],
  paddingRight: vars.spacing[24],
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[18],
});

export const childPage = style({
  minHeight: "100dvh",
  backgroundColor: vars.color.bg.default,
  paddingTop: `calc(env(safe-area-inset-top, 0px) + ${vars.layout.header})`,
  paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${vars.layout.bottomNav})`,
  boxSizing: "border-box",
});

export const childContent = style({
  width: "100%",
  padding: `24px ${vars.spacing[16]} ${vars.spacing[24]}`,
  boxSizing: "border-box",
});

export const childList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  width: "100%",
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const childListItem = style({
  width: "100%",
  minWidth: 0,
});

export const childEmpty = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.spacing[16],
  width: "100%",
  paddingTop: vars.spacing[24],
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[14],
  lineHeight: 1.5,
  textAlign: "center",
});

export const childLoadMoreSlot = style({
  display: "flex",
  justifyContent: "center",
  width: "100%",
  marginTop: vars.spacing[16],
});
