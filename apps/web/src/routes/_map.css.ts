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
