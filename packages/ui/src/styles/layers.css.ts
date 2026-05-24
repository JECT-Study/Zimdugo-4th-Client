import { globalLayer } from "@vanilla-extract/css";

/**
 * CSS Cascade Layers 정의
 *
 * 레이어 순서 (낮은 우선순위 → 높은 우선순위):
 * 1. reset - 브라우저 기본 스타일 초기화
 */

export const normalize = globalLayer("normalize");

// 실제 CSS 출력을 보장하기 위해 빈 레이어에 스타일 할당
import { globalStyle } from "@vanilla-extract/css";
globalStyle("html", {
  "@layer": {
    [normalize]: {},
  },
});
