import type { AppLocale } from "#/shared/i18n/locales";
import {
  APP_LOCALES,
  BASE_LOCALE,
  parsePathLocale,
  stripLocalePathPrefix,
} from "#/shared/i18n/locales";
import { SITE_ORIGIN } from "#/shared/lib/site-url";

const HREF_LANG_BY_LOCALE = {
  ko: "ko",
  en: "en",
  ja: "ja",
  zh: "zh",
  "zh-TW": "zh-TW",
} as const satisfies Record<AppLocale, string>;

const getLocalePathPrefix = (locale: AppLocale): string =>
  locale === BASE_LOCALE ? "" : `/${locale}`;

export const getSeoLocaleFromPathname = (pathname?: string | null): AppLocale =>
  parsePathLocale(pathname ?? "") ?? BASE_LOCALE;

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
