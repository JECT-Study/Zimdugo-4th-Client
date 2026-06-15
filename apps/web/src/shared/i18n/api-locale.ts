import { languageTag } from "@repo/i18n";

import {
  type AppLocale,
  BASE_LOCALE,
  normalizeLocale,
} from "./locales";

export type ApiLocale = "ko-KR" | "en-US" | "ja-JP" | "zh-CN" | "zh-TW";

const APP_TO_API_LOCALE: Record<AppLocale, ApiLocale> = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
  zh: "zh-CN",
  "zh-TW": "zh-TW",
};

/** Server maps `*` fallback to English; no need to pin en-US in the list. */
const ACCEPT_LANGUAGE_WILDCARD = "*;q=0.5";

export const toAcceptLanguage = (locale: AppLocale): ApiLocale =>
  APP_TO_API_LOCALE[locale];

export const buildAcceptLanguageHeader = (locale: AppLocale): string =>
  `${toAcceptLanguage(locale)}, ${ACCEPT_LANGUAGE_WILDCARD}`;

/** Backend i18n applies only to locker/place read APIs. */
const LOCKER_PLACE_ACCEPT_LANGUAGE_PATH =
  /^\/api\/v1\/(?:lockers|places)(?:\/|$)/;

export const shouldAttachAcceptLanguage = (requestUrl: string | undefined) => {
  if (!requestUrl) {
    return false;
  }

  try {
    const pathname = new URL(requestUrl, "https://local.invalid").pathname;
    return LOCKER_PLACE_ACCEPT_LANGUAGE_PATH.test(pathname);
  } catch {
    return false;
  }
};

export const resolveAcceptLanguageHeader = (
  requestUrl: string | undefined,
  locale: AppLocale = normalizeLocale(languageTag()) ?? BASE_LOCALE,
): string | undefined => {
  if (!shouldAttachAcceptLanguage(requestUrl)) {
    return undefined;
  }

  return buildAcceptLanguageHeader(locale);
};
