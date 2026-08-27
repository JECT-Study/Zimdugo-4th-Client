import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const IMAGE_HEIGHT_PX = 160;

/** 한 장일 때는 꽉 채우고, 여러 장일 때는 다음 장 가장자리를 남겨 스와이프를 알린다. */
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
});

export const item = style({
  position: "relative",
  height: `${IMAGE_HEIGHT_PX}px`,
  flex: `0 0 ${PEEK_ITEM_WIDTH}`,
  scrollSnapAlign: "start",
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
  height: `${IMAGE_HEIGHT_PX}px`,
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
  height: `${IMAGE_HEIGHT_PX}px`,
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
