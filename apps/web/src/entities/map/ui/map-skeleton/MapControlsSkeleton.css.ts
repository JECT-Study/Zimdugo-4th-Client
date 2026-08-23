import {
  appShellMaxWidth,
  appShellMaxWidthVar,
  compactDeviceSelector,
  layoutScale,
} from "@repo/ui/tokens/layout/layout.css";
import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";
import { MAP_CONTROL_BOTTOM } from "#/entities/map/ui/map-control-stack-fallback";

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
