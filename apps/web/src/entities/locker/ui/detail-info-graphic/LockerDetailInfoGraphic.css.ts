import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

export const root = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[12],
  padding: `${vars.spacing[4]} 0 ${vars.spacing[16]}`,
});

export const sizeGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: vars.spacing[8],
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const sizeCard = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2px",
  minWidth: 0,
  padding: `${vars.spacing[12]} ${vars.spacing[8]}`,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius[12],
  boxSizing: "border-box",
});

/**
 * 그림 자리. 크기별 그림은 높이가 달라(소형이 가장 낮다) 그대로 두면 아래 이름 줄이
 * 카드마다 어긋난다. 가장 큰 그림 높이로 자리를 고정하고 바닥에 붙인다.
 */
export const sizeIconSlot = style({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  // 가장 큰 그림(대형)의 높이.
  height: "69px",
  marginBottom: vars.spacing[4],
});

export const sizeName = style({
  color: vars.color.text.title,
  fontSize: "13px",
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "18px",
});

export const sizePrice = style({
  color: vars.color.text.content,
  fontSize: "13px",
  lineHeight: "18px",
  whiteSpace: "nowrap",
});

export const sizeCount = style({
  color: vars.color.text.disable,
  fontSize: "12px",
  lineHeight: "16px",
});

/** 남은 칸 / 전체 칸 게이지. 실시간 정보가 있을 때만 그린다. */
export const gauge = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "2px",
  width: "100%",
  marginTop: vars.spacing[4],
});

export const gaugeTrack = style({
  height: "6px",
  overflow: "hidden",
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.bg.surface,
});

export const gaugeFill = style({
  height: "100%",
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.bg.brand.default,
});

export const gaugeLabel = style({
  color: vars.color.text.content,
  fontSize: "11px",
  lineHeight: "14px",
  textAlign: "center",
  fontVariantNumeric: "tabular-nums",
});

export const basis = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.spacing[4],
  margin: 0,
  color: vars.color.text.disable,
  fontSize: "12px",
  lineHeight: "16px",
});

globalStyle(`${basis} svg`, {
  width: "14px",
  height: "14px",
});

export const extraLines = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
  margin: 0,
  padding: 0,
  listStyle: "none",
  color: vars.color.text.content,
  fontSize: "13px",
  lineHeight: "18px",
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
});

export const visuallyHidden = style({
  position: "absolute",
  width: "1px",
  height: "1px",
  margin: "-1px",
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
});
