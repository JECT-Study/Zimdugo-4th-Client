import { m } from "@repo/i18n";
import { Header } from "@repo/ui/components/layout/header";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import {
  APP_LANGUAGES,
  type AppLanguage,
  appLanguageLabelMap,
  getLocalizedHref,
  useAppLanguageStore,
} from "#/shared/store/language";

export const Route = createFileRoute("/settings/language")({
  component: SettingsLanguagePage,
});

function SettingsLanguagePage() {
  const navigate = useNavigate();
  const appLanguage = useAppLanguageStore((state) => state.appLanguage);
  const setAppLanguage = useAppLanguageStore((state) => state.setAppLanguage);
  const { isStyleReady, isStyleTimedOut } = useSettingsStyleReady();
  const applyFallbackStyle = isStyleTimedOut;

  const handleSelectLanguage = (language: AppLanguage) => {
    setAppLanguage(language);

    const localizedHref = getLocalizedHref(
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
      language,
    );

    navigate({ href: localizedHref, replace: true });
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
            const isCurrent = language === appLanguage;
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
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
}
