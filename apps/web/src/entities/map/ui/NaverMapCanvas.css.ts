import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const root = style({
  position: "relative",
  flex: 1,
  isolation: "isolate",
  overflow: "hidden",
  width: "100%",
  height: "100%",
  minHeight: "100%",
  minWidth: 0,
  minBlockSize: 0,
  backgroundColor: vars.color.bg.surface,
});

/**
 * 네이버 SDK 가 차지하는 상자. 크기는 여기서 정하지 않는다.
 *
 * `NaverMapCanvas` 가 바깥 section 크기를 재서 px 로 넣는다. 퍼센트로 두면
 * iOS 가 회전 중 뷰포트를 여러 번 바꿀 때 이 상자만 크기를 다시 계산받지
 * 못해 지도가 이전 방향 크기로 잘렸다. `position` 도 두지 않는다. SDK 가
 * 인라인으로 `relative` 를 넣는다.
 */
export const canvas = style({
  zIndex: 0,
  backgroundColor: vars.color.bg.default,
});
