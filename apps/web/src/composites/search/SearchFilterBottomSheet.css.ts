import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

export const sheetColumn = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  minHeight: 0,
  paddingTop: vars.spacing[16],
});

export const scrollArea = style({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  WebkitOverflowScrolling: "touch",
  overscrollBehavior: "contain",
  touchAction: "pan-y",
  padding: `0 ${vars.spacing[16]} ${vars.spacing[24]}`,
  msOverflowStyle: "none",
  scrollbarWidth: "none",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: "14px",
});

export const sectionGap24 = style({
  marginTop: vars.spacing[24],
});

export const sizeCardSlot = style({
  marginTop: 0,
  display: "flex",
  justifyContent: "center",
});

export const indoorOutdoor = style({
  marginTop: 0,
});
globalStyle(`${indoorOutdoor} button`, {
  fontSize: "12px",
});

export const bottomActionBar = style({
  display: "flex",
  gap: vars.spacing[8],
  padding: `${vars.spacing[12]} ${vars.spacing[16]} calc(${vars.spacing[12]} + env(safe-area-inset-bottom, 0px))`,
  background: vars.color.palette.gray[100],
  borderTop: `1px solid ${vars.color.palette.gray[200]}`,
  flexShrink: 0,
});

export const resetButton = style({
  width: "112px",
  minWidth: "112px",
  color: vars.color.palette.gray[600],
  fontSize: vars.typography.fontSize[18],
  fontStyle: "normal",
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "normal",
  whiteSpace: "nowrap",
});

export const applyButton = style({
  flex: 1,
});

export const sizeGuideBox = style({
  fontSize: vars.typography.fontSize[12],
  color: vars.color.palette.gray[600],
  lineHeight: "1.6",
  backgroundColor: vars.color.palette.gray[100],
  padding: vars.spacing[12],
  borderRadius: vars.radius[8],
  marginTop: vars.spacing[12],
});

export const sizeGuideList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
  margin: 0,
  padding: 0,
  listStyle: "none",
});

/*
 * 데스크톱 필터 패널. 표면(패널 자리)은 결과 목록과 같은 desktopSearchPanel 을 쓴다.
 * 닫기는 검색 카드의 되돌아가기 버튼이 맡아 패널에는 제목만 둔다.
 *
 * 제목·구역·하단 버튼의 왼쪽 시작선을 검색 카드(좌우 20)와 같게 맞춘다. 칩 줄은
 * 모바일처럼 가운데 그대로 둔다. 모바일
 * 시트는 그대로 두고 이 패널 안에서만 덮어쓴다.
 */
const DESKTOP_FILTER_INLINE_PADDING = vars.spacing[20];

export const desktopFilterTitle = style({
  flexShrink: 0,
  margin: 0,
  // 제목 줄 60px(위 26 + 글자 20 + 아래 14) 안에서 Figma 와 같은 자리에 둔다.
  padding: `26px ${DESKTOP_FILTER_INLINE_PADDING} 14px`,
  color: vars.color.text.title,
  fontSize: "17px",
  fontWeight: vars.typography.fontWeight.Bold,
  lineHeight: "20px",
});

/** 패널 안에서는 제목 줄 아래 남은 높이를 채운다. 시트처럼 높이 100% 를 받지 않는다. */
export const desktopFilterScreen = style({
  flex: 1,
  height: "auto",
  paddingTop: 0,
});

globalStyle(`${desktopFilterScreen} ${scrollArea}`, {
  paddingLeft: DESKTOP_FILTER_INLINE_PADDING,
  paddingRight: DESKTOP_FILTER_INLINE_PADDING,
});

globalStyle(`${desktopFilterScreen} ${bottomActionBar}`, {
  paddingLeft: DESKTOP_FILTER_INLINE_PADDING,
  paddingRight: DESKTOP_FILTER_INLINE_PADDING,
});
