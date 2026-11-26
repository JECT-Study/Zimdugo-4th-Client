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

export const moreBadge = style({
  minWidth: "40px",
});

/*
 * 뱃지와 `+N` 칩은 필터 화면에서 칩을 골랐을 때(ControlChip choice 활성)와 같은
 * 진초록 채움에 흰 글자로 둔다. 해제·펼침 버튼이라 선택 상태(aria-pressed)를 알리는
 * choice 변형은 쓰지 않고, filter 변형의 활성 선택자(클래스 + 속성)를 이기도록
 * 클래스를 한 번 더 걸어 색만 덮는다. × 아이콘도 글자와 같은 흰색이다.
 */
globalStyle(
  `${badge}${badge}[data-active='true'], ${moreBadge}${moreBadge}[data-active='true']`,
  {
    backgroundColor: vars.color.bg.brand.active,
    borderColor: "transparent",
    color: vars.color.palette.gray[100],
  },
);

globalStyle(`${badge} svg path`, {
  stroke: "currentColor",
});
