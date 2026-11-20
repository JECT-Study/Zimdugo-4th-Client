import {
  appShellMaxWidthVar,
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
 * 틀 자체의 클래스도 같은 변수를 미디어 쿼리로 정하므로, 순서에 기대지 않도록
 * `body &` 로 한 단계 더 구체적으로 쓴다.
 */
export const mapAppContainer = style({
  "@media": {
    [desktopMediaQuery]: {
      selectors: {
        "body &": {
          vars: {
            [appShellMaxWidthVar]: "100%",
          },
        },
      },
    },
  },
});
