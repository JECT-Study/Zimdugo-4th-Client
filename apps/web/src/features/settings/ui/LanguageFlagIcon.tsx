import chinaFlagUrl from "../assets/flags/flag-china.svg";
import japanFlagUrl from "../assets/flags/flag-japan.svg";
import koreaFlagUrl from "../assets/flags/flag-korea.svg";
import taiwanFlagUrl from "../assets/flags/flag-taiwan.svg";
import unitedStatesFlagUrl from "../assets/flags/flag-united-states.svg";
import { flagFrame, flagFrameBorder, flagImage } from "./LanguageFlagIcon.css";

interface LanguageFlagIconProps {
  language: "ko" | "en" | "ja" | "zh" | "zh-TW";
}

export function LanguageFlagIcon({ language }: LanguageFlagIconProps) {
  const flagByLanguage = {
    ko: { src: koreaFlagUrl, hasBorder: true },
    en: { src: unitedStatesFlagUrl, hasBorder: false },
    ja: { src: japanFlagUrl, hasBorder: true },
    zh: { src: chinaFlagUrl, hasBorder: false },
    "zh-TW": { src: taiwanFlagUrl, hasBorder: false },
  } as const;
  const flag = flagByLanguage[language];

  return (
    <span
      className={[flagFrame, flag.hasBorder ? flagFrameBorder : ""]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <img className={flagImage} src={flag.src} alt="" />
    </span>
  );
}
