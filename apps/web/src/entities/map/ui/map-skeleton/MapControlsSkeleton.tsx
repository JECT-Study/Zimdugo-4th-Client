import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import type { CSSProperties } from "react";
import { mapControlStackInlineFallbackStyle } from "#/entities/map/ui/map-control-stack-fallback";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import { controlButton, controlStack } from "./MapControlsSkeleton.css";

const controlButtonStyle: CSSProperties = {
  ...SKELETON_SURFACE_STYLE,
  boxShadow: "0 2px 8px rgba(22, 24, 28, 0.08)",
};

/**
 * 지도 우측 하단 컨트롤(새로고침/내 위치) 로딩 스켈레톤.
 *
 * 실제 컨트롤(locationControlStack)과 동일한 위치/계층 토큰을 공유하며,
 * 로딩 중 실제 컨트롤 대신 표시한다. 인라인 폴백 덕분에 첫 페인트에 즉시 보인다.
 */
export function MapControlsSkeleton() {
  return (
    <div
      className={controlStack}
      style={mapControlStackInlineFallbackStyle}
      aria-hidden="true"
    >
      <Skeleton
        width={48}
        height={48}
        borderRadius={9999}
        variant="rect"
        className={controlButton}
        style={controlButtonStyle}
      />
      <Skeleton
        width={48}
        height={48}
        borderRadius={9999}
        variant="rect"
        className={controlButton}
        style={controlButtonStyle}
      />
    </div>
  );
}
