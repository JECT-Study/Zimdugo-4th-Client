import { m } from "@repo/i18n";
import { Header } from "@repo/ui/components/layout/header";
import { createFileRoute, useRouter } from "@tanstack/react-router";
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
  const router = useRouter();
  const { isStyleReady, isStyleTimedOut } = useSettingsStyleReady();
  const { preference, setPreference } = useMapColorSchemePreference();
  const applyFallbackStyle = isStyleTimedOut;

  // navigate 는 히스토리를 쌓는다. 뒤로가기로 쓰면 누를수록 스택이 자라
  // 브라우저·OS 뒤로가기가 앱을 빠져나가지 못한다. 앱 안에서 들어왔으면 직전
  // 화면으로 돌아가고, 바로 들어온 경우에만 설정으로 보낸다(login.tsx 와 동일).
  const handleBack = () => {
    if (router.history.canGoBack()) {
      router.history.back();
      return;
    }

    router.navigate({ to: "/settings", replace: true });
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
        title={m.settings_dark_mode()}
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
