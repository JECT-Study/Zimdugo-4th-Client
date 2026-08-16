import { m } from "@repo/i18n";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { useDelayedVisibility } from "#/shared/hooks/useDelayedVisibility";
import { backdrop, overlay, spinner } from "./PageTransitionOverlay.css";

const PAGE_TRANSITION_DELAY_MS = 180;

interface PageTransitionOverlayProps {
  isActive: boolean;
}

interface PageTransitionContentBoundaryProps {
  isBlocked: boolean;
  children: ReactNode;
}

export function PageTransitionContentBoundary({
  isBlocked,
  children,
}: PageTransitionContentBoundaryProps) {
  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!isBlocked) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isBlocked || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      inert={isBlocked || undefined}
      style={{ display: "contents" }}
      onClickCapture={handleClickCapture}
      onKeyDownCapture={handleKeyDownCapture}
    >
      {children}
    </div>
  );
}

export function PageTransitionOverlay({
  isActive,
}: PageTransitionOverlayProps) {
  const isVisible = useDelayedVisibility(isActive, PAGE_TRANSITION_DELAY_MS);

  if (!isVisible) return null;

  return (
    <output
      className={overlay}
      aria-live="polite"
      aria-label={m.page_transition_loading_aria()}
    >
      <div className={backdrop} aria-hidden="true" />
      <div className={spinner} aria-hidden="true" />
    </output>
  );
}
