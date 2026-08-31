import { languageTag } from "@repo/i18n";
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

/**
 * 언어 전환은 선호 쿠키를 쓰고 로케일이 적용된 주소로 이동하는 것이 전부다.
 * 현재 로케일은 URL 이 정하므로 런타임을 제자리에서 바꾸지 않고 페이지를 다시 띄운다.
 */
export const switchAppLanguage = (language: AppLanguage) => {
  setAppLanguage(language);

  const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const localizedHref = getLocalizedHref(currentHref, language);

  if (localizedHref !== currentHref) {
    // 같은 화면을 다른 언어로 다시 여는 것이라 되돌아갈 지점이 아니다. assign 은
    // 항목을 쌓아, 언어를 바꾼 뒤 뒤로가기를 누르면 이전 화면이 아니라 예전
    // 언어로 돌아가고 한 번 더 눌러야 빠져나간다.
    window.location.replace(localizedHref);
    return;
  }

  const currentLanguage =
    normalizeLanguage(languageTag()) ?? DEFAULT_APP_LANGUAGE;

  if (currentLanguage !== language) {
    window.location.reload();
  }
};

export const appLanguageLabelMap: Record<AppLanguage, string> = {
  ko: "\uD55C\uAD6D\uC5B4",
  en: "English",
  ja: "\u65E5\u672C\u8A9E",
  zh: "\u7B80\u4F53\u4E2D\u6587",
  "zh-TW": "\u7E41\u9AD4\u4E2D\u6587",
};
