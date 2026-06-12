import { m } from "@repo/i18n";
import type { CSSProperties } from "react";
import {
  loadingContent,
  loadingLabel,
  loadingSpinner,
  mapArea,
  skeletonContainer,
} from "./MapSkeleton.css";

const skeletonContainerFallbackStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#eef0f3",
  pointerEvents: "none",
};

const mapAreaFallbackStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  zIndex: 1,
  background: "#eef0f3",
};

/**
 * 지도 SDK·인스턴스 부트스트랩 중 표시되는 플레이스홀더.
 *
 * 컨트롤 버튼(새로고침/내 위치) 스켈레톤은 이 컴포넌트 안에 두지 않는다.
 * `NaverMapCanvas`의 root는 `isolation: isolate`로 스태킹이 갇혀 있어, 실제
 * `locationControlStack`(상위 형제, z-index ui)보다 위로 올라올 수 없기 때문이다.
 * 따라서 컨트롤 스켈레톤은 라우트에서 실제 컨트롤과 같은 계층/토큰으로 토글한다.
 */
export function MapSkeleton() {
  return (
    <div
      className={skeletonContainer}
      style={skeletonContainerFallbackStyle}
      role="status"
      aria-live="polite"
      aria-label={m.map_loading_aria()}
    >
      <div className={mapArea} style={mapAreaFallbackStyle} aria-hidden="true" />
      <div className={loadingContent}>
        <div className={loadingSpinner} aria-hidden="true" />
        <p className={loadingLabel}>{m.map_loading_message()}</p>
      </div>
    </div>
  );
}
