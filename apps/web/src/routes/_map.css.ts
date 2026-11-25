import {
  appShellMaxWidthVar,
  desktopLayoutSelector,
  desktopMediaQuery,
} from "@repo/ui/tokens/layout/layout.css";
import { style } from "@vanilla-extract/css";

/**
 * 지도와 그 위 화면이 함께 놓이는 상자.
 *
 * 지도를 `flex: 1` 로 두던 자리를 그대로 물려받는다. `_map.index.tsx` 의
 * `pageWrapper` 가 하던 몫인데, 지도가 레이아웃으로 올라오면서 화면보다 바깥에
 * 있어야 해 이쪽으로 옮겼다.
 */
export const mapLayoutShell = style({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  flex: 1,
  position: "relative",
});

/**
 * 지도 화면일 때 앱 바깥 틀(AppContainer)에 붙는 클래스.
 *
 * 데스크톱에서는 지도가 화면 전체를 채우고 그 위에 카드가 떠야 해서, 모바일 열
 * 폭(480px) 제한을 푼다. 지도를 쓰지 않는 화면(설정·내 정보·신고 등)은 이 클래스를
 * 받지 않아 지금처럼 가운데 열로 남는다.
 *
 * 틀 자체의 클래스도 같은 변수를 미디어 쿼리로 정한다. 플래그 셀렉터(html[...] &)가
 * 그보다 구체적이라 순서에 기대지 않고 이긴다.
 *
 * 좌우 테두리와 그림자는 가운데 열을 바탕과 구분하려는 장식인데, 화면을 꽉 채우면
 * 양 끝에 1px 회색 선만 남는다. CSS 가 붙기 전 첫 페인트용으로 AppContainer 가
 * 인라인으로 넣는 값이라 클래스로는 덮을 수 없어, 이 좁은 경우에만 !important 를 쓴다.
 */
export const mapAppContainer = style({
  "@media": {
    [desktopMediaQuery]: {
      selectors: {
        [desktopLayoutSelector]: {
          vars: {
            [appShellMaxWidthVar]: "100%",
          },
          borderLeft: "0 !important",
          borderRight: "0 !important",
          boxShadow: "none !important",
        },
      },
    },
  },
});
