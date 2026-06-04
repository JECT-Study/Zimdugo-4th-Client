import { color } from "@repo/ui/tokens/color/color.css";
import { layoutScale } from "@repo/ui/tokens/layout/layout.css";
import { radius } from "@repo/ui/tokens/radius/radius.css";
import { spacing } from "@repo/ui/tokens/spacing/spacing.css";
import type { CSSProperties } from "react";

/**
 * `settings.css.ts` vars와 동기화 — vanilla-extract CSS 청크 도착 전·timeout 인라인 스타일에만 사용한다.
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

export const settingsPageInlineFallbackStyle: CSSProperties = {
  minHeight: "100dvh",
  background: SETTINGS_PAGE_BG,
  paddingTop: `calc(env(safe-area-inset-top, 0px) + ${SETTINGS_HEADER_HEIGHT})`,
};

/** 스켈레톤 전용 (클릭 차단) */
export const settingsPageSkeletonInlineFallbackStyle: CSSProperties = {
  ...settingsPageInlineFallbackStyle,
  pointerEvents: "none",
};

export const settingsContentInlineFallbackStyle: CSSProperties = {
  ...settingsContentLayoutFallbackStyle,
  padding: "32px 16px 24px",
};

export const settingsLanguageContentInlineFallbackStyle: CSSProperties = {
  ...settingsContentLayoutFallbackStyle,
  padding: "40px 16px 24px",
};

export const settingsGroupInlineFallbackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

export const settingsGroupGapInlineFallbackStyle: CSSProperties = {
  marginTop: "32px",
};

export const settingsLanguageGroupInlineFallbackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

export const settingsSkeletonContentInlineFallbackStyle: CSSProperties = {
  ...settingsContentInlineFallbackStyle,
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

export const settingsLanguageSkeletonContentInlineFallbackStyle: CSSProperties =
  {
    ...settingsLanguageContentInlineFallbackStyle,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  };

export const settingsSettingRowInlineFallbackStyle = (options?: {
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

export const settingsLanguageSettingRowInlineFallbackStyle: CSSProperties =
  settingsSettingRowInlineFallbackStyle();
