export const APP_LOCALES = ["ko", "en", "ja", "zh", "zh-TW"] as const;

export const BASE_LOCALE = "ko";

export const LOCALE_COOKIE_NAME = "PARAGLIDE_LOCALE";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * base locale 은 무접두가 정규 주소라 /ko 를 떼는 순간 "URL 이 로케일을
 * 명시했다"는 사실이 사라진다. 그 한 번의 리다이렉트 동안만 의도를 나르는
 * 일회용 마커이고, 선호 채널인 LOCALE_COOKIE_NAME 과는 별개다.
 */
export const LOCALE_INTENT_COOKIE_NAME = "ZIMDUGO_LOCALE_INTENT";

export const LOCALE_INTENT_COOKIE_MAX_AGE = 10;

/** Match /zh-TW before /zh so hyphenated locale is not truncated. */
export const LOCALE_PATH_PREFIX = /^\/(?:ko|en|ja|zh-tw|zh)(?=\/|$)/i;

export type AppLocale = (typeof APP_LOCALES)[number];

const LOCALE_NORMALIZATION_GROUPS = [
  { locale: "ko", prefixes: ["ko"] },
  { locale: "en", prefixes: ["en"] },
  { locale: "ja", prefixes: ["ja"] },
  { locale: "zh-TW", prefixes: ["zh-tw", "zh-hant", "zh-hk", "zh-mo"] },
  { locale: "zh", prefixes: ["zh"] },
] as const satisfies readonly {
  locale: AppLocale;
  prefixes: readonly string[];
}[];

/** Browser Accept-Language / navigator has no supported app locale. */
export const UNSUPPORTED_LOCALE_FALLBACK = "en" satisfies AppLocale;

export const normalizeLocale = (value?: string | null): AppLocale | null => {
  if (!value) return null;

  const lower = value.toLowerCase().replace(/_/g, "-");

  for (const group of LOCALE_NORMALIZATION_GROUPS) {
    if (group.prefixes.some((prefix) => lower.startsWith(prefix))) {
      return group.locale;
    }
  }

  return null;
};

export const isAppLocale = (value: string): value is AppLocale =>
  APP_LOCALES.includes(value as AppLocale);

export const stripLocalePathPrefix = (pathname: string): string =>
  pathname.replace(LOCALE_PATH_PREFIX, "") || "/";

export const parsePathLocale = (pathname: string): AppLocale | null => {
  const match = pathname.match(LOCALE_PATH_PREFIX);
  if (!match) return null;

  return normalizeLocale(match[0].slice(1));
};
