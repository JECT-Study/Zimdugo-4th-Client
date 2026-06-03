import type { CSSProperties } from "react";
import { color } from "@repo/ui/tokens/color/color.css";
import { layoutScale } from "@repo/ui/tokens/layout/layout.css";
import { radius } from "@repo/ui/tokens/radius/radius.css";
import { spacing } from "@repo/ui/tokens/spacing/spacing.css";

/**
 * `settings.css.ts` vars와 동기화 — vanilla-extract CSS 청크 도착 전 인라인 스타일에만 사용한다.
 */
export const SETTINGS_PAGE_BG = color.bg.default;
export const SETTINGS_ROW_BG = color.bg.default;
export const SETTINGS_ROW_BORDER = color.border.default;
export const SETTINGS_ROW_MIN_HEIGHT = layoutScale.touchTarget;
export const SETTINGS_ROW_PADDING_X = spacing.scale[16];
export const SETTINGS_ROW_BORDER_RADIUS = radius.scale[6];
export const SETTINGS_HEADER_HEIGHT = layoutScale.header;
export const SETTINGS_CONTENT_MAX_WIDTH = layoutScale.containerWidth;

const settingsContentLayoutFallbackStyle: CSSProperties = {
  width: "100%",
  maxWidth: SETTINGS_CONTENT_MAX_WIDTH,
  margin: "0 auto",
  boxSizing: "border-box",
};

export const settingsPageSkeletonInlineFallbackStyle: CSSProperties = {
  minHeight: "100dvh",
  background: SETTINGS_PAGE_BG,
  paddingTop: `calc(env(safe-area-inset-top, 0px) + ${SETTINGS_HEADER_HEIGHT})`,
};

export const settingsSkeletonContentInlineFallbackStyle: CSSProperties = {
  ...settingsContentLayoutFallbackStyle,
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  padding: "32px 16px 24px",
};

export const settingsLanguageSkeletonContentInlineFallbackStyle: CSSProperties = {
  ...settingsContentLayoutFallbackStyle,
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  padding: "40px 16px 24px",
};

export const settingsSettingRowSkeletonInlineFallbackStyle = (options?: {
  attached?: boolean;
}): CSSProperties => {
  return {
    width: "100%",
    minHeight: SETTINGS_ROW_MIN_HEIGHT,
    padding: `0 ${SETTINGS_ROW_PADDING_X}`,
    border: `2px solid ${SETTINGS_ROW_BORDER}`,
    borderRadius: SETTINGS_ROW_BORDER_RADIUS,
    marginTop: options?.attached ? "-2px" : 0,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    background: SETTINGS_ROW_BG,
  };
};

export const settingsLanguageSettingRowSkeletonInlineFallbackStyle: CSSProperties =
  settingsSettingRowSkeletonInlineFallbackStyle();
