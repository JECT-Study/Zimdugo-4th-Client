import type { ReactNode } from "react";
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
  width: "min(100vw, 375px)",
  maxWidth: "min(100vw, 375px)",
  height: "60px",
  display: "flex",
  alignItems: "stretch",
  justifyContent: "space-evenly",
  boxSizing: "border-box",
  background: "#ffffff",
  borderTop: "1px solid #e6e8eb",
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
