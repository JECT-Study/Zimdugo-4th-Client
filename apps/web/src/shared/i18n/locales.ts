export const APP_LOCALES = ["ko", "en", "ja", "zh", "zh-TW"] as const;

export const BASE_LOCALE = "ko";

export const LOCALE_COOKIE_NAME = "PARAGLIDE_LOCALE";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * 언어 선택 전용 경로. `/set-language/en/settings` 처럼 고른 로케일과 돌아갈
 * 자리를 담는다. 서버는 이 경로로 들어온 요청만 사용자의 선택으로 보고 선호
 * 쿠키를 기록한다. 로케일 URL 을 그냥 방문한 것과 구분하는 유일한 신호다.
 *
 * 쿼리 파라미터가 아니라 경로인 이유가 있다. 프리렌더된 화면은 정적 파일이
 * 서버 핸들러보다 먼저 응답해서, 같은 경로에 표시만 달아서는 가드가 아예
 * 돌지 않는다. 특히 기본 로케일 자리는 대부분 프리렌더 대상이다.
 */
export const LOCALE_CHOICE_PATH = "/set-language";

/** Match /zh-TW before /zh so hyphenated locale is not truncated. */
export const LOCALE_PATH_PREFIX = /^\/(?:ko|en|ja|zh-tw|zh)(?=\/|$)/i;

export type AppLocale = (typeof APP_LOCALES)[number];

export const LOCALE_NORMALIZATION_GROUPS = [
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

/**
 * URL 경로 조각을 로케일로 읽는다. 표기 차이(zh-tw)만 받아 주고 그 외에는
 * 정확히 일치해야 한다.
 *
 * normalizeLocale 을 쓰면 안 된다. 그쪽은 Accept-Language 의 en-US 같은
 * 태그를 받으려고 접두사 일치를 쓰는데, 경로에 대고 쓰면 english 가 en 으로,
 * javascript 가 ja 로 통과해 버린다.
 */
export const parseLocaleSegment = (
  segment?: string | null,
): AppLocale | null => {
  if (!segment) return null;

  const lower = segment.toLowerCase();

  return APP_LOCALES.find((locale) => locale.toLowerCase() === lower) ?? null;
};

export const stripLocalePathPrefix = (pathname: string): string =>
  pathname.replace(LOCALE_PATH_PREFIX, "") || "/";

export const parsePathLocale = (pathname: string): AppLocale | null => {
  const match = pathname.match(LOCALE_PATH_PREFIX);
  if (!match) return null;

  return normalizeLocale(match[0].slice(1));
};
