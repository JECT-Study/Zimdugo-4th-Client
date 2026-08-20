import chinaBaseUrl from "../assets/flags/flag-china-base.svg";
import chinaStar1Url from "../assets/flags/flag-china-star-1.svg";
import chinaStar2Url from "../assets/flags/flag-china-star-2.svg";
import chinaStar3Url from "../assets/flags/flag-china-star-3.svg";
import chinaStar4Url from "../assets/flags/flag-china-star-4.svg";
import chinaStarLargeUrl from "../assets/flags/flag-china-star-large.svg";
import japanFlagUrl from "../assets/flags/flag-japan.svg";
import koreaFlagSymbolUrl from "../assets/flags/flag-korea-symbol.svg";
import taiwanFlagUrl from "../assets/flags/flag-taiwan.svg";
import unitedStatesFlagUrl from "../assets/flags/flag-united-states.svg";
import {
  chinaBase,
  chinaStar,
  flagFrame,
  flagFrameBorder,
  simpleFlagImage,
} from "./LanguageFlagIcon.css";

interface LanguageFlagIconProps {
  language: "ko" | "en" | "ja" | "zh" | "zh-TW";
}

export function LanguageFlagIcon({ language }: LanguageFlagIconProps) {
  if (language === "zh") {
    return (
      <span className={flagFrame} aria-hidden="true">
        <img className={chinaBase} src={chinaBaseUrl} alt="" />
        <img className={chinaStar.large} src={chinaStarLargeUrl} alt="" />
        <img className={chinaStar.first} src={chinaStar1Url} alt="" />
        <img className={chinaStar.second} src={chinaStar2Url} alt="" />
        <img className={chinaStar.third} src={chinaStar3Url} alt="" />
        <img className={chinaStar.fourth} src={chinaStar4Url} alt="" />
      </span>
    );
  }

  const flagByLanguage = {
    ko: {
      className: simpleFlagImage.korea,
      src: koreaFlagSymbolUrl,
      hasBorder: true,
    },
    en: {
      className: simpleFlagImage.unitedStates,
      src: unitedStatesFlagUrl,
      hasBorder: false,
    },
    ja: {
      className: simpleFlagImage.japan,
      src: japanFlagUrl,
      hasBorder: true,
    },
    "zh-TW": {
      className: simpleFlagImage.taiwan,
      src: taiwanFlagUrl,
      hasBorder: false,
    },
  } as const;
  const flag = flagByLanguage[language];

  return (
    <span
      className={[flagFrame, flag.hasBorder ? flagFrameBorder : ""]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <img className={flag.className} src={flag.src} alt="" />
    </span>
  );
}
