import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { HeaderSkeleton } from "@repo/ui/components/layout/header";
import type { CSSProperties, ReactNode } from "react";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import {
  settingsLanguageSettingRowSkeletonInlineFallbackStyle,
  settingsLanguageSkeletonContentInlineFallbackStyle,
  settingsPageSkeletonInlineFallbackStyle,
  settingsSettingRowSkeletonInlineFallbackStyle,
  settingsSkeletonContentInlineFallbackStyle,
} from "#/features/settings/ui/settings-page-fallback";
import { header, page } from "./settings.css.ts";

const skeletonSurfaceStyle: CSSProperties = SKELETON_SURFACE_STYLE;

export function SettingsSkeletonFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className={page}
      style={settingsPageSkeletonInlineFallbackStyle}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

export function SettingsHeaderSkeleton() {
  return <HeaderSkeleton className={header} />;
}

export function SettingsSkeleton() {
  return (
    <div style={settingsSkeletonContentInlineFallbackStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <SettingsSkeletonRow width={128} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <SettingsSkeletonRow width={124} />
        <SettingsSkeletonRow attached width={116} />
        <SettingsSkeletonRow attached width={108} />
        <SettingsSkeletonRow attached width={132} />
      </div>
      <div style={{ display: "flex", paddingLeft: "16px" }}>
        <Skeleton
          width={112}
          height={14}
          borderRadius={6}
          style={{ ...skeletonSurfaceStyle, flexShrink: 0 }}
        />
      </div>
    </div>
  );
}

export function SettingsLanguageSkeleton() {
  return (
    <div style={settingsLanguageSkeletonContentInlineFallbackStyle}>
      <SettingsLanguageSkeletonRow width={112} />
      <SettingsLanguageSkeletonRow width={128} />
      <SettingsLanguageSkeletonRow width={116} />
      <SettingsLanguageSkeletonRow width={120} />
    </div>
  );
}

function SettingsLanguageSkeletonRow({ width }: { width: number }) {
  return (
    <div style={settingsLanguageSettingRowSkeletonInlineFallbackStyle}>
      <Skeleton
        width={width}
        height={14}
        borderRadius={6}
        style={skeletonSurfaceStyle}
      />
    </div>
  );
}

function SettingsSkeletonRow({
  attached,
  width,
}: {
  attached?: boolean;
  width: number;
}) {
  return (
    <div style={settingsSettingRowSkeletonInlineFallbackStyle({ attached })}>
      <Skeleton
        width={width}
        height={14}
        borderRadius={6}
        style={skeletonSurfaceStyle}
      />
    </div>
  );
}
