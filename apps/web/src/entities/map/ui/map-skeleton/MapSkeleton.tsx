import type { CSSProperties } from "react";
import {
  mapArea,
  skeletonContainer,
} from "./MapSkeleton.css";

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

export function MapSkeleton() {
  return (
    <div className={skeletonContainer} style={skeletonContainerFallbackStyle}>
      <div className={mapArea} style={mapAreaFallbackStyle} />
    </div>
  );
}
