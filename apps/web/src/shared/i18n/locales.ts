export const APP_LOCALES = ["ko", "en", "ja", "zh", "zh-TW"] as const;

export const BASE_LOCALE = "ko";

export const LOCALE_COOKIE_NAME = "PARAGLIDE_LOCALE";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Match /zh-TW before /zh so hyphenated locale is not truncated. */
export const LOCALE_PATH_PREFIX = /^\/(?:ko|en|ja|zh-tw|zh)(?=\/|$)/i;

export type AppLocale = (typeof APP_LOCALES)[number];

/** Browser Accept-Language / navigator has no supported app locale. */
export const UNSUPPORTED_LOCALE_FALLBACK = "en" satisfies AppLocale;

export const normalizeLocale = (value?: string | null): AppLocale | null => {
  if (!value) return null;

  const lower = value.toLowerCase().replace(/_/g, "-");

  if (lower.startsWith("ko")) return "ko";
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("ja")) return "ja";
  if (
    lower.startsWith("zh-tw") ||
    lower.startsWith("zh-hant") ||
    lower.startsWith("zh-hk") ||
    lower.startsWith("zh-mo")
  ) {
    return "zh-TW";
  }
  if (lower.startsWith("zh")) return "zh";

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

export const resolveBrowserLanguageCandidates = (
  candidates: readonly string[],
): AppLocale | null => {
  for (const candidate of candidates) {
    const normalized = normalizeLocale(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return candidates.length > 0 ? UNSUPPORTED_LOCALE_FALLBACK : null;
};
