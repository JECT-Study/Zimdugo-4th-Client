import { languageTag } from "@repo/i18n";

import { type AppLocale, BASE_LOCALE, normalizeLocale } from "./locales";

/**
 * 백엔드에 언어를 알릴 때 쓰는 한 벌의 어휘.
 *
 * 값이 두 군데로 나간다. 요청마다 붙는 `Accept-Language` 헤더와, 푸시 구독에
 * 저장돼 나중에 알림 문구를 만들 때 쓰이는 `locale` 본문 필드다. 후자는 발송
 * 시점에 요청이 없어 헤더로 대신할 수 없다.
 *
 * 두 곳이 받아 주는 범위가 달라 교집합으로 맞췄다. 구독 본문은 `zh-Hans`·
 * `zh-Hant` 만 받고 `zh-CN`·`zh-TW` 는 400 으로 막는다. 반대로 헤더는 문자
 * 서브태그와 지역 없는 형태를 모두 해석한다(스펙의 enum 은 실제보다 좁게 적혀
 * 있다). 그래서 이 표기가 양쪽 모두에서 통한다.
 *
 * 중국어를 지역이 아니라 문자로 가르는 편이 알림 문구에도 맞다. 홍콩·싱가포르
 * 사용자에게 필요한 구분은 나라가 아니라 간체·번체다.
 */
export type ApiLocale = "ko" | "en" | "ja" | "zh-Hans" | "zh-Hant";

const APP_TO_API_LOCALE: Record<AppLocale, ApiLocale> = {
  ko: "ko",
  en: "en",
  ja: "ja",
  zh: "zh-Hans",
  "zh-TW": "zh-Hant",
};

/** Server maps `*` fallback to English; no need to pin en-US in the list. */
const ACCEPT_LANGUAGE_WILDCARD = "*;q=0.5";

export const toAcceptLanguage = (locale: AppLocale): ApiLocale =>
  APP_TO_API_LOCALE[locale];

export const buildAcceptLanguageHeader = (locale: AppLocale): string =>
  `${toAcceptLanguage(locale)}, ${ACCEPT_LANGUAGE_WILDCARD}`;

/** Backend i18n applies only to locker/place read APIs. */
const LOCKER_PLACE_ACCEPT_LANGUAGE_PATH =
  /^\/api\/v1\/(?:lockers|places|documents)(?:\/|$)/;

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
