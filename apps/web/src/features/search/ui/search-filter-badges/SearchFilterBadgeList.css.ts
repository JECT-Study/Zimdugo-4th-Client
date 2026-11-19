import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

/**
 * 뱃지 줄. 넘치면 가로로 민다.
 *
 * 필터 아이콘은 이 줄 바깥에 두어, 펼친 뱃지를 밀어도 아이콘은 제자리에 남는다.
 */
export const badgeList = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  flex: 1,
  minWidth: 0,
  overflowX: "auto",
  overflowY: "hidden",
  overscrollBehaviorX: "contain",
  touchAction: "pan-x",
  msOverflowStyle: "none",
  scrollbarWidth: "none",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
});

export const badge = style({
  minWidth: "56px",
  gap: vars.spacing[4],
  paddingRight: vars.spacing[8],
});

/*
 * 글자는 활성 테두리와 같은 초록, × 아이콘은 회색으로 둔다. 칩의 활성
 * 선택자(클래스 + 속성)를 이기도록 클래스를 한 번 더 건다.
 * `+N` 칩도 글자·테두리를 같은 초록으로 맞춘다.
 */
globalStyle(`${badge}${badge}[data-active='true']`, {
  color: vars.color.focus,
});

globalStyle(`${badge} svg path`, {
  stroke: vars.color.palette.gray[500],
});

export const moreBadge = style({
  minWidth: "40px",
});

globalStyle(`${moreBadge}${moreBadge}`, {
  borderColor: vars.color.focus,
  color: vars.color.focus,
});
