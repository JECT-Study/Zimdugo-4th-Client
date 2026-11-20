import {
  compactDeviceSelector,
  layoutScale,
} from "@repo/ui/tokens/layout/layout.css";
import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const sheetWrapper = style({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  margin: "0 auto",
  width: "100%",
  /*
   * 실제 시트(BottomSheetFrame)와 같은 폭으로 제한한다. 안쪽 interactiveContent 는
   * 포인터를 받으므로, 감싸는 틀이 넓으면 시트 양옆의 지도까지 조작이 막힌다.
   * 앱 틀이 이미 같은 폭인 모바일에서는 달라지는 것이 없다.
   */
  maxWidth: vars.layout.appMaxWidth,
  // Bottom sheet should cover Naver map controls.
  zIndex: vars.zIndex.bottomSheet,
  height: "100dvh",
  // Keep content scroll gestures available on mobile.
  touchAction: "auto",
  pointerEvents: "none",
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
  },
});

export const sheetSurface = style({
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  maxHeight: "100dvh",
  overflow: "hidden",
  willChange: "height",
  pointerEvents: "none",
});

export const dragHandleZone = style({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "24px",
  zIndex: 1,
  cursor: "ns-resize",
  touchAction: "none",
  pointerEvents: "auto",
  userSelect: "none",
  WebkitUserSelect: "none",
});

export const interactiveContent = style({
  height: "100%",
  pointerEvents: "auto",
});
