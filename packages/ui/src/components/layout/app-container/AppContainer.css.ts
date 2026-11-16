import { style } from "@vanilla-extract/css";
import {
  appShellMaxWidth,
  appShellMaxWidthVar,
  compactDeviceSelector,
  layoutScale,
} from "../../../tokens/layout/layout.css.ts";
import { vars } from "../../../vars.css.ts";

export const container = style({
  vars: {
    [appShellMaxWidthVar]: vars.layout.appMaxWidth,
  },
  width: "100%",
  maxWidth: appShellMaxWidth,
  margin: "0 auto",
  // 뷰포트 단위를 쓰지 않는다. html·body 가 이미 화면 높이(100%)로 고정돼
  // 있어 같은 값이 나오고, iOS 가 회전 중 뷰포트를 여러 번 바꿀 때 뷰포트
  // 단위가 이전 값에 남는 WebKit 문제를 피한다.
  height: "100%",
  minHeight: "100%",
  backgroundColor: vars.color.bg.default,
  boxShadow: vars.shadow[1],
  position: "relative",
  overflow: "hidden",
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
    },
  },
});

export const documentContainer = style({
  height: "auto",
  minHeight: "100dvh",
  overflow: "visible",
});
