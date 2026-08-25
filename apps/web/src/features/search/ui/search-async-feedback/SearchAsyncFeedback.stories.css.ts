import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";
import { root } from "./SearchAsyncFeedback.css.ts";

export const comparisonGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
  gap: vars.spacing[24],
  alignItems: "start",
  width: "100%",
  maxWidth: 760,
});

export const panel = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
});

export const panelTitle = style({
  margin: 0,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.SemiBold,
  color: vars.color.text.title,
});

export const panelNote = style({
  margin: 0,
  fontSize: vars.typography.fontSize[12],
  color: vars.color.text.surface,
});

/** 컴포넌트가 차지하는 영역을 눈으로 보려고 테두리를 준다. */
export const surface = style({
  border: `1px dashed ${vars.color.text.surface}`,
  borderRadius: vars.radius[8],
});

/**
 * 수정 전 상태 재현.
 *
 * `vars.spacing[40]` 이 없는 토큰이라 `padding: "undefined 20px"` 가 되고,
 * 브라우저가 선언 전체를 버려 여백이 0 이었다. 같은 결과를 만들려고 padding 을
 * 0 으로 되돌린다.
 */
export const beforeSurface = style({});

globalStyle(`${beforeSurface} .${root}`, {
  padding: 0,
});
