import * as defaultLanguageRuntime from "@repo/i18n";
import { afterEach } from "vitest";
import { type AppLocale, BASE_LOCALE } from "#/shared/i18n/locales";

/**
 * paraglide 는 URL 우선 전략이라 런타임 언어가 주소에서 나온다.
 * jsdom 주소는 항상 "/" 라서 setLocale 로는 언어를 바꿀 수 없으므로,
 * 테스트에서는 런타임 구현 자체를 갈아끼워 언어를 고정한다.
 */
export interface LanguageRuntime {
  getLocale: () => AppLocale;
  setLocale: (locale: AppLocale, options?: { reload?: boolean }) => void;
  overwriteGetLocale: (fn: () => AppLocale) => void;
  overwriteSetLocale: (fn: (locale: AppLocale) => void) => void;
}

interface InstalledRuntime {
  locale: AppLocale;
  originalGetLocale: LanguageRuntime["getLocale"];
  originalSetLocale: LanguageRuntime["setLocale"];
}

const installedRuntimes = new Map<LanguageRuntime, InstalledRuntime>();

/**
 * `vi.resetModules()` 를 쓰는 테스트는 런타임 인스턴스가 새로 만들어진다.
 * 그 경우 새 인스턴스를 넘겨서 같은 처리를 적용한다.
 */
const installTestLanguage = (
  runtime: LanguageRuntime,
  locale: AppLocale = BASE_LOCALE,
) => {
  const installed = installedRuntimes.get(runtime);

  if (installed) {
    installed.locale = locale;
    return;
  }

  const state: InstalledRuntime = {
    locale,
    originalGetLocale: runtime.getLocale,
    originalSetLocale: runtime.setLocale,
  };

  installedRuntimes.set(runtime, state);

  runtime.overwriteGetLocale(() => state.locale);
  runtime.overwriteSetLocale((nextLocale) => {
    state.locale = nextLocale;
  });
};

export const setTestLanguage = (locale: AppLocale) => {
  installTestLanguage(defaultLanguageRuntime as LanguageRuntime, locale);
};

const restoreTestLanguage = () => {
  for (const [runtime, state] of installedRuntimes) {
    runtime.overwriteGetLocale(state.originalGetLocale);
    runtime.overwriteSetLocale(state.originalSetLocale);
  }

  installedRuntimes.clear();
};

// 런타임 구현은 전역 상태라 테스트 간 누수가 곧바로 산발적 실패가 된다.
// 헬퍼를 import 한 파일은 예외 없이 복원되도록 여기서 직접 등록한다.
afterEach(() => {
  restoreTestLanguage();
});
