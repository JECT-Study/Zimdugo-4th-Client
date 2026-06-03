export const APP_LOCALES = ["ko", "en", "ja", "zh"] as const;

export const BASE_LOCALE = "ko";

export const LOCALE_COOKIE_NAME = "PARAGLIDE_LOCALE";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type AppLocale = (typeof APP_LOCALES)[number];

export const isAppLocale = (value: string): value is AppLocale => {
  return APP_LOCALES.includes(value as AppLocale);
};

export const normalizeLocale = (value?: string | null): AppLocale | null => {
  if (!value) return null;

  const lower = value.toLowerCase();
  if (lower.startsWith("ko")) return "ko";
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("zh")) return "zh";

  return null;
};
