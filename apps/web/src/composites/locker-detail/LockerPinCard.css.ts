import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

/** 고른 핀(44px 를 1.5 배로 키운 66px)의 위 끝에서 카드 꼬리까지 띄우는 거리. */
const PIN_TOP_GAP_PX = 40;
const TAIL_SIZE_PX = 8;

/**
 * 카드를 좌표 원점 위에 아래 가운데로 맞춘다. 원점은 핀의 가운데라 핀 반쪽과 꼬리만큼
 * 더 올린다.
 */
export const anchor = style({
  position: "absolute",
  left: 0,
  bottom: `${PIN_TOP_GAP_PX}px`,
  transform: "translateX(-50%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  filter: "drop-shadow(0 4px 16px rgb(0 0 0 / 16%))",
  cursor: "default",
});

export const card = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[12],
  width: "300px",
  padding: `${vars.spacing[16]} ${vars.spacing[16]} ${vars.spacing[12]}`,
  boxSizing: "border-box",
  borderRadius: vars.radius[16],
  backgroundColor: vars.color.bg.default,
  textAlign: "left",
});

export const tail = style({
  width: 0,
  height: 0,
  borderLeft: `${TAIL_SIZE_PX}px solid transparent`,
  borderRight: `${TAIL_SIZE_PX}px solid transparent`,
  borderTop: `${TAIL_SIZE_PX}px solid ${vars.color.bg.default}`,
});

export const header = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.spacing[8],
});

export const titleColumn = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
  flex: 1,
  minWidth: 0,
});

export const title = style({
  margin: 0,
  color: vars.color.text.title,
  fontSize: "15px",
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "20px",
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
});

export const meta = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: vars.spacing[4],
  color: vars.color.text.surface,
  fontSize: "12px",
  lineHeight: "16px",
});

globalStyle(`${meta} svg`, {
  width: "14px",
  height: "14px",
});

export const metaItem = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "2px",
});

export const favoriteButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: "32px",
  height: "32px",
  padding: 0,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.bg.default,
  color: vars.color.icon.lighten,
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
    "&[aria-pressed='true']": {
      color: vars.color.icon.primary,
    },
  },
});

globalStyle(`${favoriteButton} svg`, {
  width: "18px",
  height: "18px",
});

export const realtime = style({
  display: "flex",
  justifyContent: "center",
});

export const actions = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: vars.spacing[8],
});

export const actionButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  height: "36px",
  padding: `0 ${vars.spacing[12]}`,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.content,
  fontSize: "13px",
  fontWeight: vars.typography.fontWeight.SemiBold,
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&:hover": {
      backgroundColor: vars.color.bg.surface,
    },
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

/** 카드의 주된 동작. 상세 패널을 연다. */
export const primaryActionButton = style({
  borderColor: "transparent",
  backgroundColor: vars.color.bg.brand.active,
  color: vars.color.text.white,
  selectors: {
    "&:hover": {
      backgroundColor: vars.color.bg.brand.active,
      filter: "brightness(1.08)",
    },
  },
});

globalStyle(`${actionButton} svg`, {
  width: "16px",
  height: "16px",
  flexShrink: 0,
});
