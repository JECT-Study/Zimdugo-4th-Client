import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { HeaderSkeleton } from "@repo/ui/components/layout/header";
import type { CSSProperties, ReactNode } from "react";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import { header, page } from "./settings.css.ts";

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
  return <HeaderSkeleton className={header} />;
}

export function SettingsSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "32px 16px 24px",
      }}
    >
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "40px 16px 16px",
      }}
    >
      <SettingsLanguageSkeletonRow />
      <SettingsLanguageSkeletonRow />
      <SettingsLanguageSkeletonRow />
      <SettingsLanguageSkeletonRow />
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
        width: "100%",
        minHeight: "48px",
        padding: "0 16px",
        border: "2px solid #e5e5e5",
        borderRadius: "6px",
        marginTop: attached ? "-2px" : 0,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        background: "#f5f5f5",
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
