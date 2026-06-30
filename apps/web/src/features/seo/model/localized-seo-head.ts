import type { AppLocale } from "#/shared/i18n/locales";
import {
  APP_LOCALES,
  BASE_LOCALE,
  normalizeLocale,
  parsePathLocale,
  stripLocalePathPrefix,
} from "#/shared/i18n/locales";
import { SITE_ORIGIN } from "#/shared/lib/site-url";

const URL_PARSE_BASE = "https://zimdugo.local";

const HREF_LANG_BY_LOCALE = {
  ko: "ko",
  en: "en",
  ja: "ja",
  zh: "zh",
  "zh-TW": "zh-TW",
} as const satisfies Record<AppLocale, string>;

const getLocalePathPrefix = (locale: AppLocale): string =>
  locale === BASE_LOCALE ? "" : `/${locale}`;

export const getSeoSiteName = (locale: AppLocale): string =>
  locale === BASE_LOCALE ? "\uC9D0\uB450\uACE0 (Zimdugo)" : "Zimdugo";

const getPathnameFromHref = (href?: string | null): string | null => {
  if (!href) return null;

  try {
    return new URL(href, URL_PARSE_BASE).pathname;
  } catch {
    return null;
  }
};

export const getSeoLocaleFromPathname = (pathname?: string | null): AppLocale =>
  parsePathLocale(pathname ?? "") ?? BASE_LOCALE;

export const getSeoLocale = ({
  publicHref,
  pathname,
  runtimeLocale,
}: {
  publicHref?: string | null;
  pathname?: string | null;
  runtimeLocale?: string | null;
}): AppLocale =>
  parsePathLocale(getPathnameFromHref(publicHref) ?? "") ??
  parsePathLocale(pathname ?? "") ??
  normalizeLocale(runtimeLocale) ??
  BASE_LOCALE;

export const getSeoPathname = ({
  publicHref,
  pathname,
}: {
  publicHref?: string | null;
  pathname?: string | null;
}): string => getPathnameFromHref(publicHref) ?? pathname ?? "/";

export const createLocalizedPathname = (
  pathname: string,
  locale: AppLocale,
): string => {
  const basePathname = stripLocalePathPrefix(pathname);
  const prefix = getLocalePathPrefix(locale);

  if (basePathname === "/") {
    return prefix || "/";
  }

  return `${prefix}${basePathname}`;
};

export const createLocalizedUrl = ({
  pathname,
  locale,
  search = "",
}: {
  pathname: string;
  locale: AppLocale;
  search?: string;
}): string => {
  const url = new URL(createLocalizedPathname(pathname, locale), SITE_ORIGIN);
  url.search = search;

  return url.toString().replace(/\/$/, "");
};

export const createCanonicalUrlForPathname = (
  pathname: string,
  search = "",
): string =>
  createLocalizedUrl({
    pathname,
    locale: getSeoLocaleFromPathname(pathname),
    search,
  });

export const createAlternateLinksForPathname = (
  pathname: string,
  search = "",
) => {
  const links = APP_LOCALES.map((locale) => ({
    rel: "alternate",
    hrefLang: HREF_LANG_BY_LOCALE[locale],
    href: createLocalizedUrl({ pathname, locale, search }),
  }));

  return [
    ...links,
    {
      rel: "alternate",
      hrefLang: "x-default",
      href: createLocalizedUrl({ pathname, locale: BASE_LOCALE, search }),
    },
  ];
};
