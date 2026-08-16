import type { CSSProperties } from "react";
import {
  loadingContent,
  loadingLabel,
  loadingSpinner,
  mapArea,
  skeletonContainer,
} from "./MapSkeleton.css";

const containerFallbackStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#eef0f3",
  pointerEvents: "auto",
  touchAction: "none",
};

const mapAreaFallbackStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  zIndex: 1,
  background: "#eef0f3",
};

interface MapLoadingOverlayProps {
  label: string;
  message: string;
}

export function MapLoadingOverlay({ label, message }: MapLoadingOverlayProps) {
  return (
    <output
      className={skeletonContainer}
      style={containerFallbackStyle}
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={mapArea}
        style={mapAreaFallbackStyle}
        aria-hidden="true"
      />
      <div className={loadingContent}>
        <div className={loadingSpinner} aria-hidden="true" />
        <p className={loadingLabel}>{message}</p>
      </div>
    </output>
  );
}
