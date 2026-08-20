import {
  APP_LOCALES,
  type AppLocale,
  BASE_LOCALE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  LOCALE_PATH_PREFIX,
  normalizeLocale,
} from "#/shared/i18n/locales";

export const APP_LANGUAGES = APP_LOCALES;

export type AppLanguage = AppLocale;

const DEFAULT_APP_LANGUAGE: AppLanguage = BASE_LOCALE;
const HREF_PARSE_BASE_ORIGIN = "http://zimdugo.local";

export const normalizeLanguage = normalizeLocale;

export const getLocalizedHref = (
  href: string,
  language: AppLanguage,
): string => {
  const isProtocolRelative = href.startsWith("//");
  const isAbsolute = /^[a-z][a-z\d+\-.]*:/i.test(href);
  const url = new URL(
    href,
    isProtocolRelative ? `http:${href}` : HREF_PARSE_BASE_ORIGIN,
  );
  const basePathname = url.pathname.replace(LOCALE_PATH_PREFIX, "") || "/";
  const localizedPathname =
    language === DEFAULT_APP_LANGUAGE
      ? basePathname
      : `/${language}${basePathname === "/" ? "" : basePathname}`;

  url.pathname = localizedPathname;

  if (isProtocolRelative) {
    return `//${url.host}${url.pathname}${url.search}${url.hash}`;
  }

  if (isAbsolute) {
    return url.href;
  }

  return `${url.pathname}${url.search}${url.hash}`;
};

/**
 * 현재 로케일은 URL 이 정하고(paraglide url 전략), 사용자 선호는 이 쿠키가 정한다.
 * 서버의 로케일 가드가 prefix 없는 문서 요청을 판정할 때 이 값을 가장 먼저 본다.
 */
export const setAppLanguage = (language: AppLanguage) => {
  if (!APP_LANGUAGES.includes(language) || typeof document === "undefined") {
    return;
  }

  document.cookie = `${LOCALE_COOKIE_NAME}=${language};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};SameSite=Lax`;
};

export const appLanguageLabelMap: Record<AppLanguage, string> = {
  ko: "\uD55C\uAD6D\uC5B4",
  en: "English",
  ja: "\u65E5\u672C\u8A9E",
  zh: "\u7B80\u4F53\u4E2D\u6587",
  "zh-TW": "\u7E41\u9AD4\u4E2D\u6587",
};
