import { m } from "@repo/i18n";
import { Header } from "@repo/ui/components/layout/header";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  type AppLanguage,
  appLanguageLabelMap,
  useAppLanguageStore,
} from "#/shared/store/language";
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
} from "./-settings.css.ts";
import { useSettingsStyleReady } from "./-useSettingsStyleReady";
import {
  SettingsHeaderSkeleton,
  SettingsLanguageSkeleton,
  SettingsSkeletonFrame,
} from "./route-skeletons/-SettingsRouteSkeleton";

export const Route = createFileRoute("/settings/language")({
  loader: async () => {
    await new Promise((resolve) => setTimeout(resolve, 120));
  },
  pendingMs: 0,
  pendingMinMs: 180,
  pendingComponent: () => (
    <SettingsSkeletonFrame>
      <SettingsHeaderSkeleton />
      <SettingsLanguageSkeleton />
    </SettingsSkeletonFrame>
  ),
  component: SettingsLanguagePage,
});

const languageOrder: AppLanguage[] = ["ko", "en", "ja", "zh"];

function SettingsLanguagePage() {
  const navigate = useNavigate();
  const appLanguage = useAppLanguageStore((state) => state.appLanguage);
  const setAppLanguage = useAppLanguageStore((state) => state.setAppLanguage);
  const { isStyleReady } = useSettingsStyleReady();

  if (!isStyleReady) {
    return (
      <SettingsSkeletonFrame>
        <SettingsHeaderSkeleton />
        <SettingsLanguageSkeleton />
      </SettingsSkeletonFrame>
    );
  }

  return (
    <div className={page}>
      <Header
        className={header}
        leading="back"
        titleType="text"
        title={m.settings_language()}
        onBack={() => navigate({ to: "/settings" })}
      />

      <main className={[content, languageContent].join(" ")}>
        <section className={languageGroup}>
          {languageOrder.map((language) => {
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
                aria-current={isCurrent ? "true" : undefined}
                onClick={() => setAppLanguage(language)}
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
