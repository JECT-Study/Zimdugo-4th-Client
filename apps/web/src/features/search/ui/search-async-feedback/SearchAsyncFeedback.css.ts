import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const root = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.spacing[12],
  width: "100%",
  // 여백을 두지 않는다.
  //
  // 예전에는 `${vars.spacing[40]} ${vars.spacing[20]}` 이었는데 spacing 스케일이
  // 28 까지라 40 이 undefined 였다. `padding: "undefined 20px"` 는 브라우저가
  // 선언 전체를 버리므로 실제로는 여백이 0 이었고, 그 모습이 유지하기로 한
  // 디자인이다. 0 을 명시해 두어야 없는 토큰을 다시 참조하는 일이 없다.
  padding: 0,
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
