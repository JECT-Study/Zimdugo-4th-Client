import {
  type CSSProperties,
  type ReactNode,
} from "react";
import { shell, main } from "./AppShell.css.ts";
import { APP_BOTTOM_NAV_HEIGHT } from "./app-container/AppContainer";

export interface AppShellProps {
  header?: ReactNode;
  bottomTabBar?: ReactNode;
  children: ReactNode;
}

const fallbackShellStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

export function AppShell({ header, bottomTabBar, children }: AppShellProps) {
  const fallbackMainStyle = {
    flex: 1,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    paddingBottom: bottomTabBar ? APP_BOTTOM_NAV_HEIGHT : 0,
  } as const;

  return (
    <div className={shell} style={fallbackShellStyle}>
      {header}
      <main className={main} style={fallbackMainStyle}>
        {children}
      </main>
      {bottomTabBar}
    </div>
  );
}
