import { m } from "@repo/i18n";
import { Header } from "@repo/ui/components/layout/header";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMapColorSchemePreference } from "#/entities/map";
import { createNoIndexNoFollowHead } from "#/features/seo/model/robots-meta";
import { useSettingsStyleReady } from "#/features/settings/model/useSettingsStyleReady";
import { MapColorSchemeSettingList } from "#/features/settings/ui/MapColorSchemeSettingList";
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

export const Route = createFileRoute("/settings/theme")({
  head: createNoIndexNoFollowHead,
  component: SettingsThemePage,
});

function SettingsThemePage() {
  const navigate = useNavigate();
  const { isStyleReady, isStyleTimedOut } = useSettingsStyleReady();
  const { preference, setPreference } = useMapColorSchemePreference();
  const applyFallbackStyle = isStyleTimedOut;

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
        title={m.settings_dark_mode()}
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
        <MapColorSchemeSettingList
          preference={preference}
          onSelectPreference={setPreference}
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
