import type { CSSProperties } from "react";
import { SKELETON_SURFACE_STYLE as UI_SKELETON_SURFACE_STYLE } from "@repo/ui/components/feedback/skeleton/theme";

/**
 * 스켈레톤 공통 표면 색.
 *
 * vanilla-extract CSS 청크가 도착하기 전(첫 페인트 시점)에도 스켈레톤이 보이도록
 * 인라인 `style`로 강제하는 용도다. (UI의 `Skeleton`은 기본적으로 `bg.surface`(#F5F5F5)를
 * 사용하기 때문에 흰 배경/지도 배경에서 거의 구분되지 않는다.)
 *
 * 모든 스켈레톤은 이 상수를 재사용해 색을 한 곳에서 관리한다.
 */
export const SKELETON_SURFACE_STYLE: CSSProperties = {
  ...UI_SKELETON_SURFACE_STYLE,
};

/**
 * 스켈레톤 컨벤션 메모
 * -------------------
 * 1) 레이아웃에 중요한 속성(position/flex/size 등)은 className(vanilla-extract)과 함께
 *    "인라인 폴백 스타일"도 제공한다. CSS 청크가 늦게 로드돼도 첫 페인트에 올바르게 그려진다.
 * 2) 표면 색은 위 SKELETON_SURFACE_STYLE을 재사용한다.
 * 3) 컴포넌트별 스켈레톤은 해당 컴포넌트 옆에 `XxxSkeleton`으로 공동 배치한다.
 */
