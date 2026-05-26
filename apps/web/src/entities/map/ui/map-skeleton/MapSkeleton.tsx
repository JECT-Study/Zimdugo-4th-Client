import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import type { CSSProperties } from "react";
import {
  bottomControlSkeleton,
  mapArea,
  skeletonContainer,
  topControlSkeleton,
} from "./MapSkeleton.css.ts";

const skeletonFallbackStyle: CSSProperties = {
  background: "rgba(230, 232, 235, 0.6)",
};

const skeletonContainerFallbackStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  zIndex: 1,
  pointerEvents: "none",
};

const mapAreaFallbackStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  zIndex: 1,
  background: "#f5f5f5",
};

const topControlFallbackStyle: CSSProperties = {
  position: "absolute",
  top: 112,
  right: 16,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  zIndex: 2,
};

const bottomControlFallbackStyle: CSSProperties = {
  position: "absolute",
  right: 16,
  bottom: 96,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  zIndex: 2,
};

const controlSkeletonStyle: CSSProperties = {
  ...skeletonFallbackStyle,
  borderRadius: "9999px",
  boxShadow: "0 2px 8px rgba(22, 24, 28, 0.08)",
};

export function MapSkeleton() {
  return (
    <div className={skeletonContainer} style={skeletonContainerFallbackStyle}>
      <div className={mapArea} style={mapAreaFallbackStyle} />

      <div className={topControlSkeleton} style={topControlFallbackStyle}>
        <Skeleton
          width={48}
          height={48}
          variant="circle"
          style={controlSkeletonStyle}
        />
        <Skeleton
          width={48}
          height={48}
          variant="circle"
          style={controlSkeletonStyle}
        />
      </div>

      <div className={bottomControlSkeleton} style={bottomControlFallbackStyle}>
        <Skeleton
          width={48}
          height={48}
          variant="circle"
          style={controlSkeletonStyle}
        />
        <Skeleton
          width={48}
          height={48}
          variant="circle"
          style={controlSkeletonStyle}
        />
      </div>
    </div>
  );
}
