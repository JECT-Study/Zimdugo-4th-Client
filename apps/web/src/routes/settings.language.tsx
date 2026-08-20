import { languageTag, m } from "@repo/i18n";
import { Header } from "@repo/ui/components/layout/header";
import { IconCheck24 } from "@repo/ui/tokens/icons";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createNoIndexNoFollowHead } from "#/features/seo/model/robots-meta";
import { useSettingsStyleReady } from "#/features/settings/model/useSettingsStyleReady";
import {
  SettingsHeaderSkeleton,
  SettingsLanguageSkeleton,
  SettingsSkeletonFrame,
} from "#/features/settings/ui/SettingsRouteSkeleton";
import {
  content,
  header,
  languageContent,
  languageGroup,
  languageSettingRow,
  languageSettingRowCheck,
  page,
  rowButton,
  settingRowSelected,
  settingRowText,
} from "#/features/settings/ui/settings.css.ts";
import {
  settingsLanguageContentInlineFallbackStyle,
  settingsLanguageGroupInlineFallbackStyle,
  settingsLanguageSettingRowInlineFallbackStyle,
  settingsPageInlineFallbackStyle,
} from "#/features/settings/ui/settings-page-fallback";
import { BASE_LOCALE } from "#/shared/i18n/locales";
import {
  APP_LANGUAGES,
  type AppLanguage,
  appLanguageLabelMap,
  normalizeLanguage,
  switchAppLanguage,
} from "#/shared/store/language";

export const Route = createFileRoute("/settings/language")({
  head: createNoIndexNoFollowHead,
  component: SettingsLanguagePage,
});

function SettingsLanguagePage() {
  const navigate = useNavigate();
  const { isStyleReady, isStyleTimedOut } = useSettingsStyleReady();
  const applyFallbackStyle = isStyleTimedOut;
  const currentLanguage = normalizeLanguage(languageTag()) ?? BASE_LOCALE;

  const handleSelectLanguage = (language: AppLanguage) => {
    switchAppLanguage(language);
  };

  if (!isStyleReady) {
    return (
      <SettingsSkeletonFrame>
        <SettingsHeaderSkeleton />
        <SettingsLanguageSkeleton />
      </SettingsSkeletonFrame>
    );
  }

  return (
    <div
      className={page}
      style={applyFallbackStyle ? settingsPageInlineFallbackStyle : undefined}
    >
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={m.settings_language()}
        onBack={() => navigate({ to: "/settings" })}
      />

      <main
        className={[content, languageContent].join(" ")}
        style={
          applyFallbackStyle
            ? settingsLanguageContentInlineFallbackStyle
            : undefined
        }
      >
        <section
          className={languageGroup}
          style={
            applyFallbackStyle
              ? settingsLanguageGroupInlineFallbackStyle
              : undefined
          }
        >
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
                style={
                  applyFallbackStyle
                    ? settingsLanguageSettingRowInlineFallbackStyle
                    : undefined
                }
                aria-pressed={isCurrent}
                onClick={() => handleSelectLanguage(language)}
              >
                <span className={settingRowText}>
                  {appLanguageLabelMap[language]}
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
      </main>
    </div>
  );
}
