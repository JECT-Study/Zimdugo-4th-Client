import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import type { CSSProperties, ReactNode } from "react";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import { page } from "../-settings.css.ts";

const settingsSkeletonPageFallbackStyle: CSSProperties = {
  minHeight: "100dvh",
  background: "#f5f5f5",
  paddingTop: "calc(env(safe-area-inset-top, 0px) + 56px)",
};

const skeletonSurfaceStyle: CSSProperties = SKELETON_SURFACE_STYLE;

export function SettingsSkeletonFrame({ children }: { children: ReactNode }) {
  return (
    <div className={page} style={settingsSkeletonPageFallbackStyle}>
      {children}
    </div>
  );
}

export function SettingsHeaderSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
      }}
    >
      <Skeleton
        width={24}
        height={24}
        borderRadius={6}
        style={skeletonSurfaceStyle}
      />
      <Skeleton
        width={100}
        height={18}
        borderRadius={6}
        style={skeletonSurfaceStyle}
      />
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "16px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <SettingsSkeletonRow width={128} />
        <SettingsSkeletonRow attached width={112} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <SettingsSkeletonRow width={124} />
        <SettingsSkeletonRow attached width={116} />
        <SettingsSkeletonRow attached width={108} />
        <SettingsSkeletonRow attached width={132} />
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "16px",
      }}
    >
      <SettingsLanguageSkeletonRow />
      <SettingsLanguageSkeletonRow />
      <SettingsLanguageSkeletonRow />
      <SettingsLanguageSkeletonRow />
    </div>
  );
}

export function SettingsThemeSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "16px",
      }}
    >
      <SettingsLanguageSkeletonRow />
      <SettingsLanguageSkeletonRow />
    </div>
  );
}

export function SettingsWithdrawSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "16px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Skeleton
          width={200}
          height={20}
          borderRadius={6}
          style={skeletonSurfaceStyle}
        />
        <Skeleton
          width={280}
          height={16}
          borderRadius={6}
          style={skeletonSurfaceStyle}
        />
        <Skeleton
          width={260}
          height={16}
          borderRadius={6}
          style={skeletonSurfaceStyle}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginTop: "24px",
        }}
      >
        <Skeleton
          width="100%"
          height={48}
          borderRadius={12}
          style={skeletonSurfaceStyle}
        />
        <Skeleton
          width="100%"
          height={48}
          borderRadius={12}
          style={skeletonSurfaceStyle}
        />
      </div>
    </div>
  );
}

function SettingsLanguageSkeletonRow() {
  return (
    <div style={{ padding: "12px 0" }}>
      <Skeleton
        width={112}
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
    <div
      style={{
        padding: "16px 0",
        borderBottom: attached ? "none" : "1px solid #eee",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Skeleton
        width={width}
        height={14}
        borderRadius={6}
        style={skeletonSurfaceStyle}
      />
    </div>
  );
}
