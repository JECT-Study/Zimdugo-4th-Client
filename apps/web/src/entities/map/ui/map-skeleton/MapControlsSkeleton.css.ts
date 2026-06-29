import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

// routes/-index.css.ts의 locationControlStack과 동일한 토큰/계층을 공유한다.
// 실제 컨트롤과 위치가 정확히 일치하도록 토큰을 그대로 사용.
export const controlStack = style({
  position: "fixed",
  left: "50%",
  bottom: `calc(${vars.layout.bottomNav} + 52px)`,
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: vars.layout.appMaxWidth,
  paddingRight: vars.layout.safeAreaInlineEnd,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: vars.spacing[8],
  zIndex: vars.zIndex.ui,
  pointerEvents: "none",
});

export const controlButton = style({
  width: "48px",
  height: "48px",
  borderRadius: vars.radius.max,
  border: `1px solid ${vars.color.palette.gray[300]}`,
  boxShadow: vars.shadow[1],
  pointerEvents: "auto",
});
