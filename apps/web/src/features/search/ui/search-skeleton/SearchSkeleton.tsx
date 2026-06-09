import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import type { CSSProperties } from "react";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";

const searchSkeletonContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  padding: "16px",
};

const searchHistoryListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const skeletonSurfaceStyle: CSSProperties = SKELETON_SURFACE_STYLE;

export function SearchSkeleton() {
  return (
    <div style={searchSkeletonContainerStyle}>
      <Skeleton height={48} borderRadius={8} style={skeletonSurfaceStyle} />

      <Skeleton
        width={180}
        height={20}
        borderRadius={6}
        style={skeletonSurfaceStyle}
      />

      <div style={searchHistoryListStyle}>
        <Skeleton height={48} borderRadius={8} style={skeletonSurfaceStyle} />
        <Skeleton height={48} borderRadius={8} style={skeletonSurfaceStyle} />
        <Skeleton height={48} borderRadius={8} style={skeletonSurfaceStyle} />
      </div>
    </div>
  );
}
