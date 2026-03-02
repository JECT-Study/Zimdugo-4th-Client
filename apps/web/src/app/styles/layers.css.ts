import { globalLayer } from "@vanilla-extract/css";

/**
 * CSS Cascade Layers 정의
 *
 * 레이어 순서 (낮은 우선순위 → 높은 우선순위):
 * 1. reset - 브라우저 기본 스타일 초기화
 */

export const resetLayer = globalLayer("reset");
