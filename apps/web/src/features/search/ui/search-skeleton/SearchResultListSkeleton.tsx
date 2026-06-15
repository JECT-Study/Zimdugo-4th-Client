import { m } from "@repo/i18n";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { vars } from "@repo/ui/vars";
import type { CSSProperties } from "react";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";

const skeletonSurfaceStyle: CSSProperties = SKELETON_SURFACE_STYLE;

const listStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
  width: "100%",
};

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: vars.spacing[8],
  minHeight: "88px",
  padding: `${vars.spacing[8]} 0`,
  boxSizing: "border-box",
};

const textColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  flex: 1,
  minWidth: 0,
};

const RESULT_SKELETON_ROW_COUNT = 3;

export function SearchResultListSkeleton() {
  return (
    <div
      style={listStyle}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={m.search_result_loading_aria()}
    >
      {Array.from({ length: RESULT_SKELETON_ROW_COUNT }, (_, index) => (
        <div key={index} style={rowStyle}>
          <Skeleton
            width={24}
            height={24}
            borderRadius={6}
            style={skeletonSurfaceStyle}
          />
          <div style={textColumnStyle}>
            <Skeleton
              width="64%"
              height={16}
              borderRadius={6}
              style={skeletonSurfaceStyle}
            />
            <Skeleton
              width="48%"
              height={14}
              borderRadius={6}
              style={skeletonSurfaceStyle}
            />
            <Skeleton
              width="76%"
              height={14}
              borderRadius={6}
              style={skeletonSurfaceStyle}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
