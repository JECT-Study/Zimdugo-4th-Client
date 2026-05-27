import { style } from "@vanilla-extract/css";
import { vars } from "@repo/ui/vars";

export const stack = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[12],
  width: "100%",
});

const loginBase = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "48px",
  boxSizing: "border-box",
  padding: 0,
  borderRadius: vars.radius[8],
  border: "none",
  textDecoration: "none",
  cursor: "pointer",
  outline: "none",
  gap: "10px",
  selectors: {
    "&[data-focus-visible]": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const naver = style([
  loginBase,
  {
    backgroundColor: "#04c65b",
    color: vars.color.palette.gray[100],
  },
]);

export const kakao = style([
  loginBase,
  {
    backgroundColor: "#ffe400",
    color: vars.color.palette.gray[800],
  },
]);

export const google = style([
  loginBase,
  {
    backgroundColor: "#1775f8",
    color: vars.color.palette.gray[100],
  },
]);

export const row = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "inherit",
  width: "207px",
});

export const icon19 = style({
  width: "24px",
  height: "24px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

export const icon24 = style({
  width: "24px",
  height: "24px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

export const labelContainer = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  width: "173px",
  lineHeight: 1.2,
});

export const labelTitle = style({
  textAlign: "left",
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
});

export const labelEn = style({
  textAlign: "left",
  fontSize: "10px",
  fontWeight: vars.typography.fontWeight.Regular,
  opacity: 0.9,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
});
