import { languageTag, m } from "@repo/i18n";
import { Header } from "@repo/ui/components/layout/header";
import {
  createFileRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { createNoIndexNoFollowHead } from "#/features/seo/model/robots-meta";
import { useSettingsStyleReady } from "#/features/settings/model/useSettingsStyleReady";
import { LanguageSettingList } from "#/features/settings/ui/LanguageSettingList";
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
import { BASE_LOCALE } from "#/shared/i18n/locales";
import {
  type AppLanguage,
  getLanguageSwitchHref,
  normalizeLanguage,
} from "#/shared/store/language";

export const Route = createFileRoute("/settings/language")({
  head: createNoIndexNoFollowHead,
  component: SettingsLanguagePage,
});

/**
 * 언어 목록은 스켈레톤 뒤에 두지 않는다.
 *
 * 스켈레톤은 화면을 다 그린 것처럼 보이면서 pointer-events 를 막는다. 언어를
 * 바꾸면 전체 페이지가 다시 로드되는데, 그 직후 다시 누른 클릭이 이 구간에
 * 걸려 사라졌다. 눌러도 아무 일이 없는 것처럼 보이던 원인이다(#152).
 *
 * 목록을 처음부터 내고 행을 링크로 두면, 스타일 청크가 아직이든 하이드레이션
 * 전이든 브라우저가 클릭을 그대로 처리한다.
 */
function SettingsLanguagePage() {
  const navigate = useNavigate();
  const { isStyleReady } = useSettingsStyleReady();
  // 스타일이 확인되기 전에는 인라인 폴백으로 그린다. 폴백은 클래스와 같은
  // 배치를 담고 있어서 스켈레톤 없이도 화면이 튀지 않는다.
  const applyFallbackStyle = !isStyleReady;
  const currentLanguage = normalizeLanguage(languageTag()) ?? BASE_LOCALE;
  // 라우터가 주는 위치라 서버와 클라이언트가 같은 주소를 만든다. window 를
  // 보면 SSR 에서 값이 없어 하이드레이션 때 href 가 어긋난다.
  const currentHref = useRouterState({
    select: (state) => `${state.location.pathname}${state.location.searchStr}`,
  });

  const getLanguageHref = (language: AppLanguage) =>
    getLanguageSwitchHref(currentHref, language);

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
        <LanguageSettingList
          currentLanguage={currentLanguage}
          getLanguageHref={getLanguageHref}
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
