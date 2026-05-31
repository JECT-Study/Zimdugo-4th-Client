import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import type { CSSProperties } from "react";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import { controlButton, controlStack } from "./MapControlsSkeleton.css";

// CSS 청크 로드 전에도 정확한 위치에 그려지도록 인라인 폴백을 함께 제공한다.
// (className만 의존하면 vanilla-extract CSS가 늦게 도착할 때 스켈레톤이 한참 뒤에 나타남)
// 값은 controlStack(MapControlsSkeleton.css)과 동일: bottomNav(60px) + 52px = 112px, zIndex.ui = 20.
const controlStackFallbackStyle: CSSProperties = {
  position: "fixed",
  right: "max(16px, calc((100vw - 375px) / 2 + 16px))",
  bottom: 112,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  zIndex: 20,
  pointerEvents: "none",
};

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
      style={controlStackFallbackStyle}
      aria-hidden="true"
    >
      <Skeleton
        width={48}
        height={48}
        borderRadius={9999}
        variant="circle"
        className={controlButton}
        style={controlButtonStyle}
      />
      <Skeleton
        width={48}
        height={48}
        borderRadius={9999}
        variant="circle"
        className={controlButton}
        style={controlButtonStyle}
      />
    </div>
  );
}
