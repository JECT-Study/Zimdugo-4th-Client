import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import type { CSSProperties } from "react";
import {
  MAP_CONTROL_TOP_RESERVED_PX,
  mapControlStackInlineFallbackStyle,
} from "#/entities/map/ui/map-control-stack-fallback";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import { controlButton, controlStack } from "./MapControlsSkeleton.css";

const controlButtonStyle: CSSProperties = {
  ...SKELETON_SURFACE_STYLE,
  boxShadow: "0 2px 8px rgba(22, 24, 28, 0.08)",
};

export interface MapControlsSkeletonProps {
  /** 실제 컨트롤과 같은 계산 결과. 시트가 없는 화면이면 폴백 위치가 들어온다. */
  bottomPx: number;
}

/**
 * 지도 우측 하단 컨트롤(새로고침/내 위치) 로딩 스켈레톤.
 *
 * 로딩 중 실제 컨트롤 대신 표시한다. 인라인 폴백 덕분에 첫 페인트에 즉시 보인다.
 *
 * 위치는 실제 컨트롤과 같은 계산 결과를 `bottomPx` 로 받는다. 예전에는 스켈레톤만
 * 폴백 위치(70px)에 고정돼 있어서, 상세를 열어 둔 채 새로고침하면 지도 SDK 가 붙는
 * 동안 70px 에 있다가 실제 컨트롤로 교체되며 하프 위치(203px)로 튀었다.
 */
export function MapControlsSkeleton({ bottomPx }: MapControlsSkeletonProps) {
  return (
    <div
      className={controlStack}
      style={{
        ...mapControlStackInlineFallbackStyle,
        // bottomPx 는 프리렌더 시점의 가정 높이로 계산된 값이라 실제 뷰포트가
        // 낮으면 스택이 검색 바 위로 올라온다. 하이드레이션이 끝나면 JS 가 같은
        // 경계를 적용한 값을 주므로, 교체 시점의 위치는 이 식과 일치한다.
        bottom: `min(${bottomPx}px, calc(100dvh - ${MAP_CONTROL_TOP_RESERVED_PX}px))`,
      }}
      aria-hidden="true"
    >
      <Skeleton
        width={42}
        height={42}
        borderRadius={9999}
        variant="rect"
        className={controlButton}
        style={controlButtonStyle}
      />
      <Skeleton
        width={42}
        height={42}
        borderRadius={9999}
        variant="rect"
        className={controlButton}
        style={controlButtonStyle}
      />
    </div>
  );
}
