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
 * Skeleton UI policy (web app):
 *
 * - A skeleton must reflect a real loading cause.
 *   - Data/query loading -> data loading skeleton (no style probe).
 *   - SDK loading (map, etc.) -> SDK loading skeleton (no style probe).
 *   - CSS chunk delay on first paint -> style-probe skeleton via `useStyleReadyProbe`.
 *   - Font loading -> do not hide behind skeleton; allow swap/FOUT.
 * - Favicon is out of scope for skeleton policy.
 * - Static document pages (terms, privacy) -> no skeleton, no style probe.
 * - Unimplemented routes (notices) -> 404/placeholder, no skeleton.
 * - App chrome (BottomTabBar) -> probe once per session (module cache); Header fallback TODO.
 * - Settings subtree -> style probe on first visit; reuse cache like chrome after CSS resolves.
 *
 * Inline fallback convention:
 * 1. Put critical layout values (position, display, size) inline on skeleton or timed-out UI.
 * 2. Reuse `SKELETON_SURFACE_STYLE` for visible skeleton surfaces.
 * 3. Keep screen-specific skeleton markup close to the screen or feature.
 * 4. On style-probe timeout, render real UI with inline fallback styles (see login/settings routes).
 */
