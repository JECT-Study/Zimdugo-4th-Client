import { IconCheck24, LanguageFlagIcon } from "@repo/ui/tokens/icons";
import type { CSSProperties } from "react";
import {
  APP_LANGUAGES,
  type AppLanguage,
  appLanguageLabelMap,
} from "#/shared/store/language";
import {
  languageGroup,
  languageSettingLink,
  languageSettingRow,
  languageSettingRowCheck,
  languageSettingRowLabel,
  settingRowSelected,
  settingRowText,
} from "./settings.css";

interface LanguageSettingListProps {
  currentLanguage: AppLanguage;
  /**
   * 각 언어로 가는 주소. 링크라서 하이드레이션 전에 눌러도 동작한다.
   * 선호 기록은 서버가 맡으므로 여기에 클릭 핸들러가 필요 없다.
   */
  getLanguageHref: (language: AppLanguage) => string;
  groupFallbackStyle?: CSSProperties;
  rowFallbackStyle?: CSSProperties;
}

export function LanguageSettingList({
  currentLanguage,
  getLanguageHref,
  groupFallbackStyle,
  rowFallbackStyle,
}: LanguageSettingListProps) {
  return (
    <section className={languageGroup} style={groupFallbackStyle}>
      {APP_LANGUAGES.map((language) => {
        const isCurrent = language === currentLanguage;

        return (
          <a
            key={language}
            href={getLanguageHref(language)}
            className={[
              languageSettingLink,
              languageSettingRow,
              isCurrent ? settingRowSelected : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={rowFallbackStyle}
            aria-current={isCurrent ? true : undefined}
          >
            <span className={languageSettingRowLabel}>
              <LanguageFlagIcon language={language} />
              <span className={settingRowText}>
                {appLanguageLabelMap[language]}
              </span>
            </span>
            {isCurrent ? (
              <span className={languageSettingRowCheck}>
                <IconCheck24 />
              </span>
            ) : null}
          </a>
        );
      })}
    </section>
  );
}
