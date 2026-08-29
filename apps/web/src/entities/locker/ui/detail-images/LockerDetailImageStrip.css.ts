import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

/** 사진 비율. 세로로 긴 보관함 사진이 많아 가로로 눌리지 않게 4:3 으로 둔다. */
const IMAGE_ASPECT_RATIO = "4 / 3";

/** 한 장일 때는 꽉 채우고, 여러 장일 때는 옆 장 가장자리를 남겨 스와이프를 알린다. */
const PEEK_ITEM_WIDTH = "85%";

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  flexShrink: 0,
});

export const strip = style({
  display: "flex",
  gap: vars.spacing[8],
  width: "100%",
  margin: 0,
  padding: 0,
  listStyle: "none",
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  scrollbarWidth: "none",
  WebkitOverflowScrolling: "touch",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  "@media": {
    // 스크롤바를 감춰 둔 터라 마우스 사용자에게는 끌 수 있다는 표시가 필요하다.
    "(pointer: fine)": {
      cursor: "grab",
    },
  },
});

export const item = style({
  position: "relative",
  aspectRatio: IMAGE_ASPECT_RATIO,
  flex: `0 0 ${PEEK_ITEM_WIDTH}`,
  /*
   * 가운데 정렬이라 중간 장은 양옆 사진이 함께 걸친다. 시작 정렬로 두면 남는
   * 폭이 전부 오른쪽으로 몰려 왼쪽에는 아무것도 보이지 않고, 앞으로 넘길 수
   * 있다는 신호가 사라진다.
   *
   * 첫 장과 끝 장은 스크롤 끝이라 가운데로 오지 못하고 한쪽만 걸친다.
   */
  scrollSnapAlign: "center",
});

export const singleItem = style({
  flexBasis: "100%",
});

export const itemButton = style({
  display: "block",
  width: "100%",
  height: "100%",
  padding: 0,
  border: 0,
  background: "transparent",
  cursor: "pointer",
  borderRadius: vars.radius[6],
  selectors: {
    "&:focus-visible": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: "2px",
    },
  },
});

export const image = style({
  display: "block",
  position: "relative",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: vars.radius[6],
  border: `1px solid ${vars.color.border.default}`,
  boxSizing: "border-box",
});

/**
 * 스켈레톤은 이미지 뒤에 깔린다. 이미지가 도착하기 전에도 자리를 잡아 두고,
 * onLoad 를 놓치더라도 도착한 이미지가 그대로 위를 덮으므로 화면이 막히지 않는다.
 */
export const imagePlaceholder = style({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  borderRadius: vars.radius[6],
  border: `1px solid ${vars.color.border.default}`,
  boxSizing: "border-box",
});

export const indicatorRow = style({
  display: "flex",
  justifyContent: "center",
  gap: vars.spacing[4],
});

export const indicatorDot = style({
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: vars.color.border.hover,
  transition: "background-color 150ms ease",
});

export const indicatorDotActive = style({
  backgroundColor: vars.color.text.surface,
});
