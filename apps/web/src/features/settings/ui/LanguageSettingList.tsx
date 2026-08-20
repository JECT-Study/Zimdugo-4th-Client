import { IconCheck24, LanguageFlagIcon } from "@repo/ui/tokens/icons";
import type { CSSProperties } from "react";
import {
  APP_LANGUAGES,
  type AppLanguage,
  appLanguageLabelMap,
} from "#/shared/store/language";
import {
  languageGroup,
  languageSettingRow,
  languageSettingRowCheck,
  languageSettingRowLabel,
  rowButton,
  settingRowSelected,
  settingRowText,
} from "./settings.css";

interface LanguageSettingListProps {
  currentLanguage: AppLanguage;
  onSelectLanguage: (language: AppLanguage) => void;
  groupFallbackStyle?: CSSProperties;
  rowFallbackStyle?: CSSProperties;
}

export function LanguageSettingList({
  currentLanguage,
  onSelectLanguage,
  groupFallbackStyle,
  rowFallbackStyle,
}: LanguageSettingListProps) {
  return (
    <section className={languageGroup} style={groupFallbackStyle}>
      {APP_LANGUAGES.map((language) => {
        const isCurrent = language === currentLanguage;

        return (
          <button
            key={language}
            type="button"
            className={[
              rowButton,
              languageSettingRow,
              isCurrent ? settingRowSelected : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={rowFallbackStyle}
            aria-pressed={isCurrent}
            onClick={() => onSelectLanguage(language)}
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
          </button>
        );
      })}
    </section>
  );
}
