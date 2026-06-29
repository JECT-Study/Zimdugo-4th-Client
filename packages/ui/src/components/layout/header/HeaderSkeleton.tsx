import {
  appShellMaxWidth,
  layoutScale,
} from "../../../tokens/layout/layout.css.ts";
import { Skeleton } from "../../feedback/skeleton/Skeleton.tsx";
import { SKELETON_SURFACE_STYLE } from "../../feedback/skeleton/skeleton-theme.ts";

import { centerContainer, ghostBox, headerRoot } from "./Header.css.ts";

export interface HeaderSkeletonProps {
  className?: string;
  titleType?: "logo" | "step" | "text";
}

const headerSkeletonFallbackStyle = {
  position: "fixed",
  top: "env(safe-area-inset-top, 0px)",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  maxWidth: appShellMaxWidth,
  height: layoutScale.header,
  padding: `12px ${layoutScale.safeAreaInlineEnd} 12px ${layoutScale.safeAreaInlineStart}`,
  boxSizing: "border-box",
  backgroundColor: "transparent",
} as const;

const skeletonSurfaceStyle = SKELETON_SURFACE_STYLE;

const iconSkeletonFallbackStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  flexShrink: 0,
  boxSizing: "border-box",
} as const;

const centerFallbackStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
} as const;

const ghostBoxFallbackStyle = {
  width: 24,
  height: 24,
  flexShrink: 0,
} as const;

export function HeaderSkeleton({
  className,
  titleType = "text",
}: HeaderSkeletonProps) {
  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: HeaderSkeleton is a decorative loading placeholder and has no focusable children.
    <header
      className={[headerRoot, className].filter(Boolean).join(" ")}
      style={headerSkeletonFallbackStyle}
      aria-hidden="true"
    >
      <div style={iconSkeletonFallbackStyle}>
        <Skeleton
          width={24}
          height={24}
          borderRadius={6}
          style={skeletonSurfaceStyle}
        />
      </div>

      <div
        className={centerContainer({ alignment: "center" })}
        style={centerFallbackStyle}
      >
        {titleType === "step" ? (
          <Skeleton
            width={48}
            height={24}
            borderRadius={9999}
            style={skeletonSurfaceStyle}
          />
        ) : titleType === "logo" ? (
          <div style={{ display: "flex", gap: 2 }}>
            <Skeleton
              width={32}
              height={16}
              borderRadius={4}
              style={skeletonSurfaceStyle}
            />
            <Skeleton
              width={44}
              height={16}
              borderRadius={4}
              style={skeletonSurfaceStyle}
            />
          </div>
        ) : (
          <Skeleton
            width={72}
            height={16}
            borderRadius={4}
            style={skeletonSurfaceStyle}
          />
        )}
      </div>

      <div className={ghostBox} style={ghostBoxFallbackStyle} />
    </header>
  );
}
