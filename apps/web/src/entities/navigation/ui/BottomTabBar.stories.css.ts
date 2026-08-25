import { style } from "@vanilla-extract/css";
import type { CSSProperties } from "react";

export const storyRelativeFrame = style({
  position: "relative",
  left: 0,
  transform: "none",
  bottom: "auto",
  selectors: {
    // vanilla-extract 의 타입에는 !important 가 없다. 스토리에서 고정 위치를
    // 풀어야 해서 문자열 그대로 넣는다.
    "&": {
      position: "relative !important" as CSSProperties["position"],
      left: "0 !important" as CSSProperties["left"],
      transform: "none !important" as CSSProperties["transform"],
      bottom: "auto !important" as CSSProperties["bottom"],
    },
  },
});
