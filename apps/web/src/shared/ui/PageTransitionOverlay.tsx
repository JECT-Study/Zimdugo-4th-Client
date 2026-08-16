import { m } from "@repo/i18n";
import { useDelayedVisibility } from "#/shared/hooks/useDelayedVisibility";
import { backdrop, overlay, spinner } from "./PageTransitionOverlay.css";

const PAGE_TRANSITION_DELAY_MS = 180;

interface PageTransitionOverlayProps {
  isActive: boolean;
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
