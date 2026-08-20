import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { HeaderSkeleton } from "@repo/ui/components/layout/header";
import type { CSSProperties, ReactNode } from "react";
import {
  settingsLanguageSettingRowInlineFallbackStyle,
  settingsLanguageSkeletonContentInlineFallbackStyle,
  settingsPageSkeletonInlineFallbackStyle,
  settingsSettingRowInlineFallbackStyle,
  settingsSkeletonContentInlineFallbackStyle,
} from "#/features/settings/ui/settings-page-fallback";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
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

export function SettingsSkeleton({
  showProfile = false,
  isGuest = false,
} = {}) {
  return (
    <div style={settingsSkeletonContentInlineFallbackStyle}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <SettingsSkeletonRow width={128} />
        <SettingsSkeletonRow attached width={116} />
      </div>
      {showProfile ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Skeleton
            width={111}
            height={111}
            variant="circle"
            style={skeletonSurfaceStyle}
          />
          <Skeleton
            width={120}
            height={16}
            borderRadius={4}
            style={skeletonSurfaceStyle}
          />
        </div>
      ) : null}
      {showProfile ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {!isGuest ? <SettingsSkeletonRow width={72} /> : null}
          {!isGuest ? <SettingsSkeletonRow attached width={96} /> : null}
          <SettingsSkeletonRow attached={!isGuest} width={64} />
        </div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column" }}>
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
    <div style={settingsLanguageSettingRowInlineFallbackStyle}>
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
    <div style={settingsSettingRowInlineFallbackStyle({ attached })}>
      <Skeleton
        width={width}
        height={14}
        borderRadius={6}
        style={skeletonSurfaceStyle}
      />
    </div>
  );
}
