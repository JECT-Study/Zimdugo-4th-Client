import {
  appShellMaxWidth,
  appShellMaxWidthVar,
  compactDeviceSelector,
  layoutScale,
} from "@repo/ui/tokens/layout/layout.css";
import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";
import {
  MAP_CONTROL_BOTTOM,
  MAP_CONTROL_MIN_VIEWPORT_HEIGHT_PX,
} from "#/entities/map/ui/map-control-stack-fallback";

// routes/-index.css.ts의 locationControlStack과 같은 레이아웃 토큰을 쓴다.
// 세로 위치는 여기 bottom 이 아니라 컴포넌트가 bottomPx 로 받아 인라인으로 덮는다.
// 실제 컨트롤과 같은 계산 결과를 써야 교체 시점에 위치가 튀지 않는다.
//
// zIndex 는 실제 컨트롤(350)과 다르다. 로딩 중에는 시트가 렌더되지 않아 가려질
// 일이 없어 그대로 두었다. 계층 통일은 별도로 다룬다.
export const controlStack = style({
  vars: {
    [appShellMaxWidthVar]: vars.layout.appMaxWidth,
  },
  position: "fixed",
  left: "50%",
  bottom: MAP_CONTROL_BOTTOM,
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: appShellMaxWidth,
  paddingRight: vars.layout.safeAreaInlineEnd,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: vars.spacing[12],
  zIndex: vars.zIndex.ui,
  pointerEvents: "none",
  selectors: {
    [compactDeviceSelector]: {
      vars: {
        [appShellMaxWidthVar]: "100%",
      },
    },
  },
  "@media": {
    // 스켈레톤은 하이드레이션 전 정적 HTML 에서 이미 그려진다. 그 시점에는
    // 뷰포트 높이를 모르니 JS 의 배치 불가 판정(null)이 아직 돌지 않았고,
    // 프리렌더된 bottom 70px 그대로 낮은 화면의 검색 바를 덮은 채 남았다.
    // 같은 경계를 CSS 로도 걸어 첫 페인트부터 숨긴다.
    //
    // 측정 전에는 시트만큼 밀어 올리지 않으므로 bottom 은 항상 폴백 위치다.
    // 그래서 이 한 조건이 하이드레이션 전 배치 불가를 전부 덮는다.
    //
    // important 는 인라인 폴백 때문이다. 이 컴포넌트는 CSS 청크가 늦어도 모양이
    // 잡히도록 display: flex 를 인라인으로 갖고 있는데, 인라인은 미디어 쿼리보다
    // 우선한다. 배치 불가는 인라인 폴백보다 강해야 하는 판정이라 여기서만 쓴다.
    [`screen and (max-height: ${MAP_CONTROL_MIN_VIEWPORT_HEIGHT_PX - 1}px)`]: {
      display: "none !important",
    },
    [`screen and (min-width: ${layoutScale.tabletBreakpoint})`]: {
      vars: {
        [appShellMaxWidthVar]: vars.layout.tabletAppMaxWidth,
      },
      selectors: {
        [compactDeviceSelector]: {
          vars: {
            [appShellMaxWidthVar]: "100%",
          },
        },
      },
    },
  },
});

export const controlButton = style({
  width: "42px",
  height: "42px",
  borderRadius: vars.radius.max,
  border: `1px solid ${vars.color.palette.gray[300]}`,
  boxShadow: vars.shadow[1],
});
