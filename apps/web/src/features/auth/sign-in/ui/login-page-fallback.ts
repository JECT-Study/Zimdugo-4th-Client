import type { CSSProperties } from "react";

/** `-login.css.ts` page·logo·loginStack와 동기화 */
export const LOGIN_PAGE_BG = "#FFFFFF";
export const LOGIN_LOGO_TOP_PX = 80;
export const LOGIN_LOGO_WIDTH_PX = 158;
export const LOGIN_LOGO_GAP_PX = 20;
export const LOGIN_STACK_MAX_WIDTH_PX = 313;
export const LOGIN_STACK_HORIZONTAL_INSET_PX = 40;
export const LOGIN_STACK_BOTTOM_PX = 60;
export const LOGIN_BUTTON_HEIGHT_PX = 48;
export const LOGIN_STACK_GAP_PX = 12;
export const LOGIN_BUTTON_RADIUS_PX = 8;

export const loginPageInlineFallbackStyle: CSSProperties = {
  width: "100%",
  minHeight: "100%",
  position: "relative",
  backgroundColor: LOGIN_PAGE_BG,
  overflow: "hidden",
};

export const loginLogoInlineFallbackStyle: CSSProperties = {
  position: "absolute",
  top: LOGIN_LOGO_TOP_PX,
  left: "50%",
  transform: "translateX(-50%)",
  width: LOGIN_LOGO_WIDTH_PX,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: LOGIN_LOGO_GAP_PX,
};

export const loginStackInlineFallbackStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: `max(${LOGIN_STACK_BOTTOM_PX}px, env(safe-area-inset-bottom))`,
  transform: "translateX(-50%)",
  width: `min(${LOGIN_STACK_MAX_WIDTH_PX}px, calc(100% - ${LOGIN_STACK_HORIZONTAL_INSET_PX}px))`,
  display: "flex",
  flexDirection: "column",
  gap: LOGIN_STACK_GAP_PX,
};


export const loginSocialButtonInlineFallbackStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: LOGIN_BUTTON_HEIGHT_PX,
  boxSizing: "border-box",
  padding: 0,
  borderRadius: LOGIN_BUTTON_RADIUS_PX,
  border: "none",
  textDecoration: "none",
  cursor: "pointer",
};
