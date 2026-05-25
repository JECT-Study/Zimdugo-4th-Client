export type NaverMapLanguage = "ko" | "en" | "ja" | "zh";

const NAVER_MAP_LANGUAGES: readonly NaverMapLanguage[] = [
  "ko",
  "en",
  "ja",
  "zh",
];

export const DEFAULT_NAVER_MAP_LANGUAGE: NaverMapLanguage = "ko";

export const normalizeNaverMapLanguage = (
  language?: string | null,
): NaverMapLanguage => {
  if (!language) {
    return DEFAULT_NAVER_MAP_LANGUAGE;
  }

  const normalized = language.toLowerCase();
  const matchedLanguage = NAVER_MAP_LANGUAGES.find((naverMapLanguage) =>
    normalized.startsWith(naverMapLanguage),
  );

  return matchedLanguage ?? DEFAULT_NAVER_MAP_LANGUAGE;
};
