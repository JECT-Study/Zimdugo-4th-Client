import type { ReactNode } from "react";
import { layoutScale } from "../../tokens/layout/layout.css.ts";
import { frame } from "./BottomBarFrame.css.ts";

export interface BottomBarFrameProps {
  children: ReactNode;
  className?: string;
}

const fallbackFrameStyle = {
  position: "fixed",
  left: "50%",
  bottom: 0,
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: layoutScale.appMaxWidth,
  height: layoutScale.bottomNav,
  display: "flex",
  alignItems: "stretch",
  justifyContent: "space-evenly",
  boxSizing: "border-box",
  background: "#ffffff",
  borderTop: "1px solid #e6e8eb",
  zIndex: 20,
} as const;

export function BottomBarFrame({ children, className }: BottomBarFrameProps) {
  return (
    <nav
      className={[frame, className].filter(Boolean).join(" ")}
      style={fallbackFrameStyle}
    >
      {children}
    </nav>
  );
}
