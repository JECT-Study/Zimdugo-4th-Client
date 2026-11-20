import {
  createGlobalTheme,
  createVar,
  fallbackVar,
} from "@vanilla-extract/css";

export const appShellMaxWidthVar = createVar();
export const compactDeviceSelector =
  'html[data-compact-device="true"] &' as const;

export const layoutScale = {
  header: "56px",
  bottomNav: "60px",
  bottomCTA: "64px",
  contentBottomPadding: "60px",
  detailBottomPadding: "64px",
  designWidth: "375px",
  appMaxWidth: "430px",
  tabletAppMaxWidth: "480px",
  tabletBreakpoint: "600px",
  /**
   * 데스크톱 레이아웃이 시작되는 폭. 이 위에서는 바텀시트 대신 왼쪽 위에 뜬
   * 카드(로고 + 검색 + 목록)와 오른쪽 위 유틸 묶음을 쓴다. 1199px 이하는 그대로다.
   */
  desktopBreakpoint: "1200px",
  /** 데스크톱 카드의 폭. 목록 카드와 상세 카드가 같은 폭을 쓴다. */
  desktopPanelWidth: "400px",
  /** 목록 카드와 상세 카드 사이 간격. */
  desktopPanelGap: "12px",
  /** 화면 가장자리에서 데스크톱 카드·유틸 묶음까지의 거리. */
  desktopInset: "16px",
  /** 데스크톱 카드 모서리. radius 스케일에 없는 값이라 레이아웃 토큰으로 둔다. */
  desktopPanelRadius: "20px",
  /** 데스크톱 카드 안 로고 줄 높이. */
  desktopHeader: "72px",
  minimumSupportedWidth: "360px",
  containerWidth: "375px",
  touchTarget: "48px",
  sidePadding: "16px",
  safeAreaInlineStart: "max(16px, env(safe-area-inset-left, 0px))",
  safeAreaInlineEnd: "max(16px, env(safe-area-inset-right, 0px))",
} as const;

/** 데스크톱 레이아웃 미디어 쿼리. vanilla-extract `@media` 키로 쓴다. */
export const desktopMediaQuery =
  `screen and (min-width: ${layoutScale.desktopBreakpoint})` as const;

export const layoutTheme = createGlobalTheme(":root", {
  layout: layoutScale,
});

export const appShellMaxWidth = fallbackVar(
  appShellMaxWidthVar,
  layoutScale.appMaxWidth,
);

export const layout = {
  ...layoutTheme,
  scale: layoutScale,
};
