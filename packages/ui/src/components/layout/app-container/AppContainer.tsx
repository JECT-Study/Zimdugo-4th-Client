import type { CSSProperties, ReactNode } from "react";
import { layoutScale } from "../../../tokens/layout/layout.css.ts";
import { container, documentContainer } from "./AppContainer.css.ts";

export interface AppContainerProps {
  children: ReactNode;
  className?: string;
  mode?: "app" | "document";
}

export const APP_SAFE_AREA_TOP =
  "var(--app-safe-area-top, env(safe-area-inset-top, 0px))";
export const APP_SAFE_AREA_BOTTOM =
  "var(--app-safe-area-bottom, env(safe-area-inset-bottom, 0px))";
export const APP_HEADER_HEIGHT = "var(--app-header-height, 56px)";
export const APP_BOTTOM_NAV_HEIGHT = "var(--app-bottom-nav-height, 60px)";
export const APP_HEADER_OFFSET = `calc(${APP_SAFE_AREA_TOP} + ${APP_HEADER_HEIGHT})`;

const fallbackContainerStyle: CSSProperties & Record<`--${string}`, string> = {
  "--app-safe-area-top": "env(safe-area-inset-top, 0px)",
  "--app-safe-area-bottom": "env(safe-area-inset-bottom, 0px)",
  "--app-header-height": "56px",
  "--app-bottom-nav-height": "60px",
  width: "100%",
  maxWidth: layoutScale.appMaxWidth,
  margin: "0 auto",
  boxSizing: "border-box",
  height: "100svh",
  minHeight: "100svh",
  backgroundColor: "#ffffff",
  position: "relative",
  overflow: "hidden",
  borderLeft: "1px solid #e6e8eb",
  borderRight: "1px solid #e6e8eb",
  boxShadow: "0 8px 24px rgba(22, 24, 28, 0.08)",
} as const;

const fallbackDocumentContainerStyle: CSSProperties &
  Record<`--${string}`, string> = {
  ...fallbackContainerStyle,
  height: "auto",
  minHeight: "100dvh",
  overflow: "visible",
};

export function AppContainer({
  children,
  className,
  mode = "app",
}: AppContainerProps) {
  const isDocumentMode = mode === "document";

  return (
    <div
      className={[container, isDocumentMode ? documentContainer : "", className]
        .filter(Boolean)
        .join(" ")}
      style={
        isDocumentMode ? fallbackDocumentContainerStyle : fallbackContainerStyle
      }
    >
      {children}
    </div>
  );
}
