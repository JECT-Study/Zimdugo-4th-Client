import { languageTag, m } from "@repo/i18n";
import { Header } from "@repo/ui/components/layout/header";
import { createFileRoute } from "@tanstack/react-router";
import { createNoIndexNoFollowHead } from "#/features/seo/model/robots-meta";
import { useSettingsStyleReady } from "#/features/settings/model/useSettingsStyleReady";
import { LanguageSettingList } from "#/features/settings/ui/LanguageSettingList";
import {
  SettingsHeaderSkeleton,
  SettingsLanguageSkeleton,
  SettingsSkeletonFrame,
} from "#/features/settings/ui/SettingsRouteSkeleton";
import {
  content,
  header,
  languageContent,
  page,
} from "#/features/settings/ui/settings.css.ts";
import {
  settingsLanguageContentInlineFallbackStyle,
  settingsLanguageGroupInlineFallbackStyle,
  settingsLanguageSettingRowInlineFallbackStyle,
  settingsPageInlineFallbackStyle,
} from "#/features/settings/ui/settings-page-fallback";
import { useBackNavigation } from "#/shared/hooks/useBackNavigation";
import { BASE_LOCALE } from "#/shared/i18n/locales";
import {
  type AppLanguage,
  normalizeLanguage,
  switchAppLanguage,
} from "#/shared/store/language";

export const Route = createFileRoute("/settings/language")({
  head: createNoIndexNoFollowHead,
  component: SettingsLanguagePage,
});

function SettingsLanguagePage() {
  const { isStyleReady, isStyleTimedOut } = useSettingsStyleReady();
  const handleBack = useBackNavigation("/settings");
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
        onBack={handleBack}
      />

      <main
        className={[content, languageContent].join(" ")}
        style={
          applyFallbackStyle
            ? settingsLanguageContentInlineFallbackStyle
            : undefined
        }
      >
        <LanguageSettingList
          currentLanguage={currentLanguage}
          onSelectLanguage={handleSelectLanguage}
          groupFallbackStyle={
            applyFallbackStyle
              ? settingsLanguageGroupInlineFallbackStyle
              : undefined
          }
          rowFallbackStyle={
            applyFallbackStyle
              ? settingsLanguageSettingRowInlineFallbackStyle
              : undefined
          }
        />
      </main>
    </div>
  );
}
