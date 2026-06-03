import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const page = style({
  minHeight: "100dvh",
  background: vars.color.bg.default,
  paddingTop: `calc(env(safe-area-inset-top, 0px) + ${vars.layout.header})`,
});

export const header = style({
  background: vars.color.bg.default,
  borderBottom: `1px solid ${vars.color.palette.gray[200]}`,
});

export const content = style({
  width: "100%",
  maxWidth: vars.layout.containerWidth,
  margin: "0 auto",
  padding: `32px ${vars.spacing[16]} ${vars.spacing[24]}`,
  boxSizing: "border-box",
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
  padding: `0 ${vars.spacing[16]}`,
  border: `2px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.scale[6],
  boxSizing: "border-box",
  backgroundColor: vars.color.bg.default,
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
