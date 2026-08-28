import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

export const overlay = style({
  position: "fixed",
  inset: 0,
  zIndex: vars.zIndex.modal,
  display: "flex",
  justifyContent: "center",
  padding:
    "max(24px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left))",
  overflowY: "auto",
  overscrollBehavior: "contain",
  backgroundColor: "rgba(10, 13, 15, 0.38)",
  boxSizing: "border-box",
});

export const modal = style({
  width: "min(327px, calc(100vw - 48px))",
  margin: "auto 0",
  outline: 0,
});

export const dialog = style({
  outline: 0,
});

export const container = style({
  width: "100%",
  overflow: "hidden",
  borderRadius: "20px",
  backgroundColor: vars.color.bg.default,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
});

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "54px",
  margin: "0 14px",
  padding: "0 6px",
  paddingTop: vars.spacing[8],
  borderBottom: `1px solid ${vars.color.border.default}`,
  boxSizing: "border-box",
});

export const title = style({
  margin: 0,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[18],
  fontWeight: vars.typography.fontWeight.Bold,
  lineHeight: vars.typography.lineHeight.normal,
});

export const closeButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  padding: 0,
  border: 0,
  borderRadius: vars.radius.max,
  background: "transparent",
  color: vars.color.icon.default,
  cursor: "pointer",
});

export const content = style({
  display: "flex",
  flexDirection: "column",
  padding: `17px 14px ${vars.spacing[20]}`,
});

export const copy = style({
  padding: "0 6px",
});

export const heading = style({
  margin: 0,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "1.2",
});

export const helper = style({
  margin: "3px 0 0",
  color: vars.color.text.surface,
  fontSize: "11px",
  fontWeight: vars.typography.fontWeight.Regular,
  lineHeight: "normal",
});

export const dropdown = style({
  width: "calc(100% - 6px)",
  marginTop: vars.spacing[20],
});

export const detailsField = style({
  width: "calc(100% - 12px)",
  marginLeft: "5px",
  marginTop: vars.spacing[20],
});

export const submitButton = style({
  width: "calc(100% + 3px)",
  // 에러 자리(20px)와 합쳐 기존 22px 간격을 유지한다.
  marginTop: "2px",
});

globalStyle(`${submitButton}${submitButton}[data-disabled]`, {
  backgroundColor: vars.color.bg.disable,
  color: vars.color.text.white,
});

/**
 * 에러 문구 자리. 문구가 없을 때도 한 줄을 차지해, 실패 순간 버튼이
 * 밀려 내려가며 오조작을 유발하지 않게 한다.
 */
export const submitError = style({
  margin: 0,
  fontSize: vars.typography.fontSize[12],
  lineHeight: vars.typography.lineHeight.normal,
  minHeight: vars.typography.lineHeight.normal,
  color: vars.color.palette.red[300],
  textAlign: "center",
});
