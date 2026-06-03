import { SKELETON_SURFACE_STYLE as UI_SKELETON_SURFACE_STYLE } from "@repo/ui/components/feedback/skeleton/theme";
import type { CSSProperties } from "react";

/**
 * Skeleton surface fallback shared by web app skeletons.
 *
 * Use this as an inline `style` when a skeleton must be visible before
 * vanilla-extract CSS chunks are applied. The UI package skeleton normally
 * uses `bg.surface`, which can be difficult to distinguish on some page or
 * map backgrounds during the first paint.
 */
export const SKELETON_SURFACE_STYLE: CSSProperties = {
  ...UI_SKELETON_SURFACE_STYLE,
};

/**
 * Skeleton fallback convention:
 * 1. Put critical layout values such as position, display, and size inline.
 * 2. Reuse `SKELETON_SURFACE_STYLE` for the visible skeleton surface.
 * 3. Keep screen-specific skeleton markup close to the screen or component.
 */
