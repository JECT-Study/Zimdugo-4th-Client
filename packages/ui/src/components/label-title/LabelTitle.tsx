import type { ReactNode } from "react";
import { root, subtitle as subtitleStyle, title as titleStyle } from "./LabelTitle.css.ts";

export type LabelTitleSize = "large" | "small";

export interface LabelTitleProps {
  children: ReactNode; // title -> children
  subtitle?: string;
  size?: LabelTitleSize;
  className?: string;
}

export function LabelTitle({
  children,
  subtitle,
  size = "large",
  className,
}: LabelTitleProps) {
  const showSubtitle = size === "large" && Boolean(subtitle);
  return (
    <div className={[root, className].filter(Boolean).join(" ")}>
      <div className={titleStyle({ size })}>{children}</div>
      {showSubtitle ? <div className={subtitleStyle}>{subtitle}</div> : null}
    </div>
  );
}
