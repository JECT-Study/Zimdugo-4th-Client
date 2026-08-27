import {
  APP_LOCALES,
  type AppLocale,
  BASE_LOCALE,
  LOCALE_CHOICE_PATH,
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
 * 언어 선택 링크의 주소.
 *
 * 고른 로케일과 돌아갈 자리를 전용 경로에 담는다. 서버가 선호 쿠키를 기록한
 * 뒤 그 자리로 돌려보낸다.
 *
 * 쿠키를 여기서 쓰지 않는 이유가 있다. 이 주소는 <a href> 로도 쓰이는데,
 * 그 클릭은 하이드레이션 전에도 일어난다. 그때는 우리 스크립트가 아직 없다.
 * 기록을 서버 한 곳에 두면 링크로 눌리든 스크립트로 이동하든 결과가 같다.
 */
export const getLanguageSwitchHref = (
  href: string,
  language: AppLanguage,
): string => {
  const url = new URL(href, HREF_PARSE_BASE_ORIGIN);
  const basePathname = url.pathname.replace(LOCALE_PATH_PREFIX, "");

  return `${LOCALE_CHOICE_PATH}/${language}${basePathname}${url.search}${url.hash}`;
};

/**
 * 스크립트로 언어를 바꾸는 경로. 링크와 같은 주소로 이동할 뿐이다.
 * 현재 로케일은 URL 이 정하므로 런타임을 제자리에서 바꾸지 않고 다시 띄운다.
 */
export const switchAppLanguage = (language: AppLanguage) => {
  if (!APP_LANGUAGES.includes(language)) {
    return;
  }

  const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  window.location.assign(getLanguageSwitchHref(currentHref, language));
};

export const appLanguageLabelMap: Record<AppLanguage, string> = {
  ko: "\uD55C\uAD6D\uC5B4",
  en: "English",
  ja: "\u65E5\u672C\u8A9E",
  zh: "\u7B80\u4F53\u4E2D\u6587",
  "zh-TW": "\u7E41\u9AD4\u4E2D\u6587",
};
