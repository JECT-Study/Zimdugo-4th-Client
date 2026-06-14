import { m } from "@repo/i18n";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { vars } from "@repo/ui/vars";
import type { CSSProperties } from "react";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";

const skeletonSurfaceStyle: CSSProperties = SKELETON_SURFACE_STYLE;

const listStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
};

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: vars.spacing[8],
  minHeight: "72px",
  padding: `${vars.spacing[8]} ${vars.spacing[20]}`,
  boxSizing: "border-box",
};

const textColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  flex: 1,
  minWidth: 0,
};

const SUGGEST_SKELETON_ROW_COUNT = 4;

export function SearchSuggestListSkeleton() {
  return (
    <div style={listStyle} aria-busy="true" aria-label={m.search_suggest_loading_aria()}>
      {Array.from({ length: SUGGEST_SKELETON_ROW_COUNT }, (_, index) => (
        <div key={index} style={rowStyle}>
          <Skeleton
            width={24}
            height={24}
            borderRadius={6}
            style={skeletonSurfaceStyle}
          />
          <div style={textColumnStyle}>
            <Skeleton
              width="58%"
              height={16}
              borderRadius={6}
              style={skeletonSurfaceStyle}
            />
            <Skeleton
              width="82%"
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
