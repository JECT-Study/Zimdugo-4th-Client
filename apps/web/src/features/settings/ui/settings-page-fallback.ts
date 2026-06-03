import type { CSSProperties } from "react";

/**
 * `settings.css.ts`·`layoutScale`(header 56px)·palette와 동기화된 정적 폴백 값.
 * vanilla-extract CSS 청크 도착 전 인라인 스타일에만 사용한다.
 */
export const SETTINGS_PAGE_BG = "#FFFFFF";
export const SETTINGS_ROW_BG = "#FFFFFF";
export const SETTINGS_ROW_BORDER = "#EEEEEE";
export const SETTINGS_ROW_MIN_HEIGHT_PX = 48;
export const SETTINGS_ROW_PADDING_X_PX = 16;
export const SETTINGS_ROW_BORDER_RADIUS_PX = 6;
export const SETTINGS_HEADER_HEIGHT_PX = 56;
/** `settings.css.ts` `content` · `layoutScale.containerWidth` */
export const SETTINGS_CONTENT_MAX_WIDTH_PX = 375;

const settingsContentLayoutFallbackStyle: CSSProperties = {
  width: "100%",
  maxWidth: SETTINGS_CONTENT_MAX_WIDTH_PX,
  margin: "0 auto",
  boxSizing: "border-box",
};

export const settingsPageSkeletonInlineFallbackStyle: CSSProperties = {
  minHeight: "100dvh",
  background: SETTINGS_PAGE_BG,
  paddingTop: `calc(env(safe-area-inset-top, 0px) + ${SETTINGS_HEADER_HEIGHT_PX}px)`,
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

export function settingsSettingRowSkeletonInlineFallbackStyle(options?: {
  attached?: boolean;
}): CSSProperties {
  return {
    width: "100%",
    minHeight: SETTINGS_ROW_MIN_HEIGHT_PX,
    padding: `0 ${SETTINGS_ROW_PADDING_X_PX}px`,
    border: `2px solid ${SETTINGS_ROW_BORDER}`,
    borderRadius: SETTINGS_ROW_BORDER_RADIUS_PX,
    marginTop: options?.attached ? "-2px" : 0,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    background: SETTINGS_ROW_BG,
  };
}

export const settingsLanguageSettingRowSkeletonInlineFallbackStyle: CSSProperties =
  {
    width: "100%",
    minHeight: SETTINGS_ROW_MIN_HEIGHT_PX,
    padding: `0 ${SETTINGS_ROW_PADDING_X_PX}px`,
    border: `2px solid ${SETTINGS_ROW_BORDER}`,
    borderRadius: SETTINGS_ROW_BORDER_RADIUS_PX,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    background: SETTINGS_ROW_BG,
  };
