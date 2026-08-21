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
  // `SocialLoginStack.css.ts` stack과 동일한 열 구성.
  // 폴백이 CSS와 다른 레이아웃을 그리면 CSS가 늦게 도착할 때 정렬이 튄다.
  display: "grid",
  gridTemplateColumns: "1fr auto minmax(0, auto) 1fr",
  columnGap: 10,
  rowGap: LOGIN_STACK_GAP_PX,
};

const loginSocialButtonInlineFallbackBase: CSSProperties = {
  gridColumn: "1 / -1",
  alignItems: "center",
  width: "100%",
  height: LOGIN_BUTTON_HEIGHT_PX,
  boxSizing: "border-box",
  padding: 0,
  borderRadius: LOGIN_BUTTON_RADIUS_PX,
  border: "none",
  textDecoration: "none",
  cursor: "pointer",
};

export const loginSocialButtonInlineFallbackStyle: CSSProperties = {
  ...loginSocialButtonInlineFallbackBase,
  display: "grid",
  gridTemplateColumns: "subgrid",
};

/**
 * subgrid 미지원 브라우저용 인라인 폴백. `SocialLoginStack.css.ts`의
 * `@supports not (grid-template-columns: subgrid)` 분기와 같은 레이아웃이다.
 *
 * 인라인 스타일에는 `@supports`를 쓸 수 없다. 그대로 두면 `subgrid` 값만
 * 무효로 버려지고 `display: grid`는 남아, 버튼마다 암시적 열이 생기면서
 * 묶음이 가운데로 오지도 않고 시작선도 서로 어긋난다.
 */
export const loginSocialButtonFlexInlineFallbackStyle: CSSProperties = {
  ...loginSocialButtonInlineFallbackBase,
  display: "flex",
  justifyContent: "center",
  gap: 10,
};

export const isSubgridSupported = () =>
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("grid-template-columns", "subgrid");

export const LOGIN_BACK_BUTTON_TOP_PX = 20;
export const LOGIN_BACK_BUTTON_LEFT_PX = 16;
export const LOGIN_BACK_BUTTON_SIZE_PX = 24;

/** `-login.css.ts` backButton과 동기화 */
export const loginBackButtonInlineFallbackStyle: CSSProperties = {
  position: "absolute",
  top: `calc(env(safe-area-inset-top, 0px) + ${LOGIN_BACK_BUTTON_TOP_PX}px)`,
  left: LOGIN_BACK_BUTTON_LEFT_PX,
  zIndex: 1,
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: LOGIN_BACK_BUTTON_SIZE_PX,
  height: LOGIN_BACK_BUTTON_SIZE_PX,
};

/** `SocialLoginStack.css.ts` labelBase와 동기화 */
export const loginSocialLabelInlineFallbackStyle: CSSProperties = {
  display: "block",
  textAlign: "left",
  lineHeight: 1.2,
  maxWidth: "100%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
