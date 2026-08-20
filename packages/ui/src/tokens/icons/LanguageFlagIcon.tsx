import { flagFrame, flagFrameBorder, flagImage } from "./LanguageFlagIcon.css";

const flagUrlByLanguage = {
  ko: new URL("./assets/flags/flag-korea.svg", import.meta.url).href,
  en: new URL("./assets/flags/flag-united-states.svg", import.meta.url).href,
  ja: new URL("./assets/flags/flag-japan.svg", import.meta.url).href,
  zh: new URL("./assets/flags/flag-china.svg", import.meta.url).href,
  "zh-TW": new URL("./assets/flags/flag-taiwan.svg", import.meta.url).href,
} as const;

export type LanguageFlag = keyof typeof flagUrlByLanguage;

interface LanguageFlagIconProps {
  language: LanguageFlag;
}

export function LanguageFlagIcon({ language }: LanguageFlagIconProps) {
  const hasBorder = language === "ko" || language === "ja";

  return (
    <span
      className={[flagFrame, hasBorder ? flagFrameBorder : ""]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <img className={flagImage} src={flagUrlByLanguage[language]} alt="" />
    </span>
  );
}
