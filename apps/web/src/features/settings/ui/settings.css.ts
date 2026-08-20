import {
  compactDeviceSelector,
  layoutScale,
} from "@repo/ui/tokens/layout/layout.css";
import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const page = style({
  height: "100dvh",
  background: vars.color.bg.default,
  paddingTop: `calc(env(safe-area-inset-top, 0px) + ${vars.layout.header})`,
  paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${vars.layout.bottomNav})`,
  boxSizing: "border-box",
});

export const header = style({
  background: vars.color.bg.default,
  borderBottom: `1px solid ${vars.color.palette.gray[200]}`,
});

export const content = style({
  width: "100%",
  height: `calc(100dvh - env(safe-area-inset-top, 0px) - ${vars.layout.header} - env(safe-area-inset-bottom, 0px) - ${vars.layout.bottomNav})`,
  maxWidth: vars.layout.appMaxWidth,
  margin: "0 auto",
  padding: `32px ${vars.spacing[16]} ${vars.spacing[24]}`,
  boxSizing: "border-box",
  overflowY: "auto",
  overscrollBehaviorY: "contain",
  selectors: {
    [compactDeviceSelector]: {
      maxWidth: "none",
    },
  },
  "@media": {
    [`screen and (min-width: ${layoutScale.tabletBreakpoint})`]: {
      maxWidth: vars.layout.tabletAppMaxWidth,
      selectors: {
        [compactDeviceSelector]: {
          maxWidth: "none",
        },
      },
    },
  },
});

export const group = style({
  display: "flex",
  flexDirection: "column",
  gap: 0,
});

export const languageContent = style({
  paddingTop: "40px",
});

export const languageGroup = style({
  display: "flex",
  flexDirection: "column",
  gap: "24px",
});

export const groupGap = style({
  marginTop: "32px",
});

export const profileSection = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
});

export const profileImageButton = style({
  position: "relative",
  display: "inline-flex",
  padding: 0,
  border: 0,
  borderRadius: vars.radius.max,
  background: "transparent",
  cursor: "pointer",
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

export const profileImageEditIcon = style({
  position: "absolute",
  right: 0,
  bottom: 0,
  pointerEvents: "none",
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

export const activityGroup = style({
  marginTop: "32px",
});

export const rowButton = style({
  width: "100%",
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
  textAlign: "left",
});

export const settingRow = style({
  width: "100%",
  minHeight: "48px",
  display: "flex",
  alignItems: "center",
  padding: `0 ${vars.spacing[16]}`,
  border: `2px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.scale[6],
  boxSizing: "border-box",
  backgroundColor: vars.color.bg.default,
  selectors: {
    "& + &": {
      marginTop: "-2px",
    },
  },
});

export const languageSettingRow = style({
  width: "100%",
  minHeight: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.spacing[8],
  padding: `0 ${vars.spacing[16]}`,
  border: `2px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.scale[6],
  boxSizing: "border-box",
  backgroundColor: vars.color.bg.default,
});

export const languageSettingRowCheck = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  flexShrink: 0,
});

export const settingRowSelected = style({
  borderColor: vars.color.border.focus,
});

export const settingRowText = style({
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: vars.typography.lineHeight.normal,
  color: vars.color.text.title,
});

export const settingRowValue = style({
  marginLeft: "auto",
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: vars.typography.lineHeight.normal,
});

export const settingRowValueText = style({
  marginLeft: "auto",
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: vars.typography.lineHeight.normal,
  color: vars.color.text.title,
});

export const languageList = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: vars.spacing[8],
  marginTop: vars.spacing[12],
});

export const versionText = style({
  marginTop: vars.spacing[16],
  paddingLeft: vars.spacing[16],
  color: vars.color.palette.gray[600],
  fontSize: vars.typography.fontSize[12],
  lineHeight: vars.typography.lineHeight.normal,
});

export const logoutSlot = style({
  display: "flex",
  justifyContent: "center",
  paddingTop: vars.spacing[24],
});

export const logoutButton = style({
  minWidth: "112px",
  paddingLeft: vars.spacing[24],
  paddingRight: vars.spacing[24],
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[18],
});
