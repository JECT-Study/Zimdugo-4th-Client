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
  selectors: {
    // 이 보관함에 없는 크기. 자리는 남기되 점선으로 비어 있음을 보인다.
    "&[data-state='absent']": {
      borderStyle: "dashed",
    },
  },
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
  selectors: {
    "[data-state='absent'] > &": {
      color: vars.color.text.surface,
    },
  },
  fontSize: "13px",
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "18px",
});

/** 요금 자리. 요금이 없어도 높이를 지켜 카드끼리 줄을 맞춘다. */
export const sizePrice = style({
  minHeight: "18px",
  color: vars.color.text.content,
  fontSize: "13px",
  lineHeight: "18px",
  whiteSpace: "nowrap",
});

/** 칸 수 자리. 남은 칸이 있으면 "12/32칸 남음", 없으면 "32칸"·"0칸"·"없음". */
export const sizeCount = style({
  minHeight: "16px",
  color: vars.color.text.surface,
  fontVariantNumeric: "tabular-nums",
  fontSize: "12px",
  lineHeight: "16px",
});

/** 남은 칸 게이지. 카드들이 게이지를 두면 칸이 없는 카드도 같은 자리에 빈 막대를 둔다. */
export const gaugeTrack = style({
  display: "block",
  width: "100%",
  margin: `${vars.spacing[4]} 0 2px`,
  height: "6px",
  selectors: {
    // 없는 크기는 자리만 남긴다. 빈 막대는 "남은 칸 0" 으로 읽힌다.
    "[data-state='absent'] > &": {
      visibility: "hidden",
    },
  },
  overflow: "hidden",
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.bg.surface,
});

/**
 * 게이지 노랑. 팔레트에 노랑이 없어 이 게이지에서만 쓴다. 다른 곳에서도 쓰게 되면
 * 팔레트로 올린다.
 */
const GAUGE_YELLOW = "#FFB020";

/** 남은 칸 비율에 따라 넉넉함(초록)·적음(노랑)·거의 없음(빨강)으로 칠한다. */
export const gaugeFill = style({
  display: "block",
  height: "100%",
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.bg.brand.default,
  selectors: {
    "&[data-level='low']": {
      backgroundColor: GAUGE_YELLOW,
    },
    "&[data-level='critical']": {
      backgroundColor: vars.color.palette.red[300],
    },
  },
});

/** 요금 기준 안내. 카드 아래 한 줄. 넘치면 말줄임 대신 줄을 바꾼다. */
export const note = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.spacing[4],
  minWidth: 0,
  margin: 0,
  color: vars.color.text.surface,
  fontSize: "12px",
  lineHeight: "16px",
});

globalStyle(`${note} svg`, {
  width: "14px",
  height: "14px",
  marginTop: "1px",
  flexShrink: 0,
});

export const noteText = style({
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
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
