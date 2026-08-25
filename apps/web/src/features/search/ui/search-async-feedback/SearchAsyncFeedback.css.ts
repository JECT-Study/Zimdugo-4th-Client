import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const root = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.spacing[12],
  width: "100%",
  // spacing 스케일은 28 까지다. 40 은 없어서 undefined 가 들어갔고, padding
  // 선언 전체가 무효가 돼 여백이 아예 없는 상태였다. 의도한 값으로 되돌린다.
  padding: `40px ${vars.spacing[20]}`,
  boxSizing: "border-box",
  textAlign: "center",
});

export const iconSlot = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const title = style({
  margin: 0,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  color: vars.color.text.title,
  lineHeight: 1.4,
});

export const helper = style({
  margin: 0,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Regular,
  color: vars.color.text.surface,
  lineHeight: 1.5,
  whiteSpace: "pre-line",
});

export const hint = style({
  margin: 0,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Regular,
  color: vars.color.text.surface,
  lineHeight: 1.5,
  whiteSpace: "pre-line",
});

export const errorActions = style({
  marginTop: vars.spacing[4],
});
