import {
  compactDeviceSelector,
  desktopLayoutSelector,
  desktopMediaQuery,
  layoutScale,
} from "@repo/ui/tokens/layout/layout.css";
import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const overlay = style({
  position: "fixed",
  top: 0,
  bottom: 0,
  left: "50%",
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: vars.layout.appMaxWidth,
  height: "100dvh",
  backgroundColor: vars.color.bg.default,
  zIndex: vars.zIndex.modal,
  display: "flex",
  flexDirection: "column",
  overscrollBehavior: "contain",
  selectors: {
    [compactDeviceSelector]: {
      maxWidth: "100%",
    },
  },
  "@media": {
    [`screen and (min-width: ${layoutScale.tabletBreakpoint})`]: {
      maxWidth: vars.layout.tabletAppMaxWidth,
      selectors: {
        [compactDeviceSelector]: {
          maxWidth: "100%",
        },
      },
    },
    /*
     * 데스크톱: 화면 전체를 덮지 않고 왼쪽 위 검색 카드 자리에서 화면 아래까지
     * 이어지는 카드가 된다. 지도는 그대로 보이고 눌린다.
     *
     * 윗부분(로고 줄)은 비워 둔다. 헤더(ui + 1)가 이 위층에서 로고를 그대로
     * 그리고, 이 카드는 검색 카드·결과 패널과 같은 ui 층에서 나중에 그려져 그
     * 둘을 덮는다. 입력창은 검색 카드의 입력창과 같은 자리에 온다.
     */
    [desktopMediaQuery]: {
      selectors: {
        [desktopLayoutSelector]: {
          top: vars.layout.desktopInset,
          bottom: vars.layout.desktopInset,
          left: vars.layout.desktopInset,
          transform: "none",
          width: vars.layout.desktopPanelWidth,
          maxWidth: "none",
          height: "auto",
          paddingTop: vars.layout.desktopHeader,
          boxSizing: "border-box",
          borderRadius: vars.layout.desktopPanelRadius,
          boxShadow: vars.shadow[2],
          overflow: "hidden",
          zIndex: vars.zIndex.ui,
        },
      },
    },
  },
});

export const header = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[12],
  padding: `${vars.spacing[12]} ${vars.spacing[16]}`,
  paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
  "@media": {
    // 검색 카드의 입력 줄과 같은 여백·간격. 열 때 입력창이 제자리에 있다.
    [desktopMediaQuery]: {
      selectors: {
        [desktopLayoutSelector]: {
          gap: vars.spacing[8],
          padding: `0 ${vars.spacing[20]}`,
        },
      },
    },
  },
});

export const searchFieldSlot = style({
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
});

export const backButton = style({
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  color: vars.color.palette.gray[800],
  "@media": {
    // 검색 카드의 되돌아가기 버튼(HomeSearchBar leadingBackButton)과 같은 원형.
    [desktopMediaQuery]: {
      selectors: {
        [desktopLayoutSelector]: {
          flexShrink: 0,
          width: "48px",
          height: "48px",
          border: `2px solid ${vars.color.border.hover}`,
          borderRadius: vars.radius.max,
          backgroundColor: vars.color.bg.default,
          color: vars.color.text.surface,
        },
      },
    },
  },
});

export const backIcon = style({
  width: "24px",
  height: "24px",
});

export const content = style({
  flex: 1,
  paddingTop: vars.spacing[12], // 그룹 간 12px
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  paddingBottom: "env(safe-area-inset-bottom, 0px)",
});

export const sectionHeader = style({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  marginBottom: "17px",
  padding: `0 ${vars.spacing[20]}`,
});

export const deleteAllButton = style({
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  color: vars.color.text.surface,
  background: "none",
  border: "none",
  cursor: "pointer",
  paddingBottom: "2px",
  whiteSpace: "nowrap",
});

export const recentList = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: vars.spacing[8],
});

export const autocompleteList = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
});
