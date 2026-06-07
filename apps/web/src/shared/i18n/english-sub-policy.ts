import type { AppLanguage } from "#/shared/store/language";

export type EnglishSubPolicy = "auto" | "always" | "never";

interface ResolveEnglishSubOptions {
  appLanguage: AppLanguage;
  policy?: EnglishSubPolicy;
}

export const resolveEnglishSubVisibility = ({
  appLanguage,
  policy = "auto",
}: ResolveEnglishSubOptions): boolean => {
  if (policy === "always") {
    return true;
  }

  if (policy === "never") {
    return false;
  }

  // auto: 영어 UI에서는 영어 sub를 숨겨 중복 문구를 줄인다.
  return appLanguage !== "en";
};
