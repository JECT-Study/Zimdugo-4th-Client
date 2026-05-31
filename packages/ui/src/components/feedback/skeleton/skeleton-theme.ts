import type { CSSProperties } from "react";

/**
 * 스켈레톤 공통 스타일 토큰.
 *
 * - BASE/HIGHLIGHT: 스켈레톤 명암 대비
 * - DURATION: 애니메이션 속도
 * - SURFACE_STYLE: CSS 청크 도착 전 인라인 폴백에도 동일한 시각 톤을 유지하기 위한 스타일
 */
export const SKELETON_BASE_COLOR = "rgba(212, 218, 228, 0.96)";
export const SKELETON_HIGHLIGHT_COLOR = "rgba(246, 248, 252, 0.96)";
export const SKELETON_SHIMMER_DURATION_MS = 1900;
export const SKELETON_PULSE_DURATION_MS = 3200;

export const SKELETON_SURFACE_STYLE: CSSProperties = {
  backgroundColor: SKELETON_BASE_COLOR,
  backgroundImage: `linear-gradient(
    100deg,
    ${SKELETON_BASE_COLOR} 0%,
    ${SKELETON_HIGHLIGHT_COLOR} 45%,
    ${SKELETON_BASE_COLOR} 100%
  )`,
};
