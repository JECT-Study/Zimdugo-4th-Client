import {
  compactDeviceSelector,
  desktopMediaQuery,
  layoutScale,
} from "@repo/ui/tokens/layout/layout.css";
import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

/**
 * 데스크톱 왼쪽 위 검색 카드의 아래 끝.
 *
 * 카드 위치(16) + 로고 줄(72) + 검색 입력(48) + 카드 아래 여백(20).
 * 바텀시트를 패널로 옮기기 전까지, 끝까지 올린 시트가 이 카드와 겹치지 않게 막는 데 쓴다.
 */
const DESKTOP_SEARCH_CARD_BOTTOM = `calc(${vars.layout.desktopInset} + ${vars.layout.desktopHeader} + 48px + ${vars.spacing[20]})`;

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
  "@media": {
    /*
     * 데스크톱 임시 처리: 가운데 시트가 좁은 데스크톱 폭(1200~1311px)에서 왼쪽 위
     * 검색 카드와 가로로 겹친다. 끝까지 올려도 카드 아래 간격(12px)에서 멈추게 한다.
     * 목록·상세를 패널로 옮기면 이 규칙은 함께 지운다.
     */
    [desktopMediaQuery]: {
      maxHeight: `calc(100dvh - ${DESKTOP_SEARCH_CARD_BOTTOM} - ${vars.layout.desktopPanelGap})`,
    },
  },
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
