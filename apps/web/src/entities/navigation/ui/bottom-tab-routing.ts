import type { BottomTabKey } from "@repo/ui/assets/icons";
import { stripLocalePathPrefix } from "#/shared/i18n/locales";

/**
 * Bottom tab route map. Keep this object stable so the shell can pass it
 * through without changing references on every render.
 */
export const BOTTOM_TAB_LINKS: Record<BottomTabKey, string> = {
  home: "/",
  report: "/report",
  my: "/settings",
  settings: "/settings",
};

const stripLocale = stripLocalePathPrefix;

/**
 * Calculates the active tab for the current route, ignoring locale prefixes.
 */
export const getActiveBottomTab = (pathname: string): BottomTabKey => {
  const normalizedPath = stripLocale(pathname);

  if (normalizedPath === "/report" || normalizedPath.startsWith("/report/")) {
    return "report";
  }
  if (
    normalizedPath === "/my" ||
    normalizedPath.startsWith("/my/") ||
    normalizedPath === "/settings" ||
    normalizedPath.startsWith("/settings/")
  ) {
    return "settings";
  }

  return "home";
};
