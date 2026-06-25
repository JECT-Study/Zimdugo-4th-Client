import type { CSSProperties, ReactNode } from "react";
import { documentMain, documentShell, main, shell } from "./AppShell.css.ts";
import { APP_BOTTOM_NAV_HEIGHT } from "./app-container/AppContainer";

export interface AppShellProps {
  header?: ReactNode;
  bottomTabBar?: ReactNode;
  children: ReactNode;
  mode?: "app" | "document";
}

const fallbackShellStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const fallbackDocumentShellStyle: CSSProperties = {
  ...fallbackShellStyle,
  height: "auto",
  minHeight: "100dvh",
  overflow: "visible",
};

export function AppShell({
  header,
  bottomTabBar,
  children,
  mode = "app",
}: AppShellProps) {
  const isDocumentMode = mode === "document";
  const fallbackMainStyle = {
    flex: 1,
    minHeight: 0,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    paddingBottom: bottomTabBar ? APP_BOTTOM_NAV_HEIGHT : 0,
    overflow: isDocumentMode ? "visible" : undefined,
  } as const;

  return (
    <div
      className={[shell, isDocumentMode ? documentShell : ""]
        .filter(Boolean)
        .join(" ")}
      style={isDocumentMode ? fallbackDocumentShellStyle : fallbackShellStyle}
    >
      {header}
      <main
        className={[main, isDocumentMode ? documentMain : ""]
          .filter(Boolean)
          .join(" ")}
        style={fallbackMainStyle}
      >
        {children}
      </main>
      {bottomTabBar}
    </div>
  );
}
