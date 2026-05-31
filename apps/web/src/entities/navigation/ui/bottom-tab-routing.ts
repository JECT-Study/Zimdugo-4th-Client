import type { BottomTabKey } from "@repo/ui/tokens/icons";

/**
 * 하단 탭 → 경로 매핑. 모듈 상수(안정적 레퍼런스)이므로 그대로 전달해도 리렌더를 유발하지 않는다.
 */
export const BOTTOM_TAB_LINKS: Record<BottomTabKey, string> = {
  home: "/",
  report: "/report",
  my: "/my",
  settings: "/settings",
};

const LOCALE_PREFIX = /^\/(?:ko|en|ja|zh)(?=\/|$)/;

const stripLocale = (pathname: string) =>
  pathname.replace(LOCALE_PREFIX, "") || "/";

/**
 * 현재 경로에 해당하는 활성 탭을 계산한다. (로케일 프리픽스 방어적 제거)
 */
export const getActiveBottomTab = (pathname: string): BottomTabKey => {
  const normalizedPath = stripLocale(pathname);

  if (normalizedPath === "/report" || normalizedPath.startsWith("/report/")) {
    return "report";
  }
  if (normalizedPath === "/my" || normalizedPath.startsWith("/my/")) {
    return "my";
  }
  if (
    normalizedPath === "/settings" ||
    normalizedPath.startsWith("/settings/")
  ) {
    return "settings";
  }

  return "home";
};

/**
 * 하단 탭바를 노출할지 여부. (로그인 화면에서는 숨김)
 */
export const shouldShowBottomTab = (pathname: string): boolean =>
  stripLocale(pathname) !== "/login";
