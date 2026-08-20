import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  installTestLanguage,
  type LanguageRuntime,
} from "#/shared/test/language-runtime";

import type { AppLanguage } from "./language";

const APP_LANGUAGE_STORAGE_KEY = "app-language";
const LOCALE_COOKIE_NAME = "PARAGLIDE_LOCALE";

const writePersistedLanguage = (appLanguage: unknown) => {
  window.localStorage.setItem(
    APP_LANGUAGE_STORAGE_KEY,
    JSON.stringify({
      state: { appLanguage },
      version: 0,
    }),
  );
};

const clearLocaleCookie = () => {
  document.cookie = `${LOCALE_COOKIE_NAME}=;path=/;max-age=0`;
};

const readLocaleCookie = () => {
  const entry = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${LOCALE_COOKIE_NAME}=`));

  return entry?.split("=").slice(1).join("=") ?? null;
};

// vi.resetModules() 를 쓰므로 스토어가 보는 paraglide 런타임도 매번 새 인스턴스다.
// 언어 고정과 검증은 그 인스턴스 기준으로 해야 한다.
let currentRuntime: LanguageRuntime | null = null;

const languageTag = () => currentRuntime?.getLocale() ?? null;

const setRuntimeLanguage = (locale: AppLanguage) => {
  if (currentRuntime) {
    installTestLanguage(currentRuntime, locale);
  }
};

const loadLanguageStore = async () => {
  currentRuntime = (await import("@repo/i18n")) as unknown as LanguageRuntime;
  installTestLanguage(currentRuntime);

  const languageModule = await import("./language");
  return languageModule.useAppLanguageStore;
};

describe("useAppLanguageStore", () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
    clearLocaleCookie();
    currentRuntime = null;
  });

  it("keeps the persisted app language when URL locale is missing", async () => {
    writePersistedLanguage("en");
    const useAppLanguageStore = await loadLanguageStore();

    useAppLanguageStore.getState().initializeLanguage(null);

    expect(useAppLanguageStore.getState().appLanguage).toBe("en");
    expect(languageTag()).toBe("en");
    expect(readLocaleCookie()).toBe("en");
  });

  it("resyncs the runtime when the store is already initialized but runtime state drifts", async () => {
    writePersistedLanguage("en");
    const useAppLanguageStore = await loadLanguageStore();

    useAppLanguageStore.getState().initializeLanguage(null);
    setRuntimeLanguage("ko");
    clearLocaleCookie();
    useAppLanguageStore.getState().initializeLanguage(null);

    expect(useAppLanguageStore.getState().appLanguage).toBe("en");
    expect(languageTag()).toBe("en");
    expect(readLocaleCookie()).toBe("en");
  });

  it("prefers the URL locale over the persisted app language", async () => {
    writePersistedLanguage("en");
    const useAppLanguageStore = await loadLanguageStore();

    useAppLanguageStore.getState().initializeLanguage("ja");

    expect(useAppLanguageStore.getState().appLanguage).toBe("ja");
    expect(languageTag()).toBe("ja");
    expect(readLocaleCookie()).toBe("ja");
  });

  it("does not reset to the default language on locale-less routes after initialization", async () => {
    writePersistedLanguage("en");
    const useAppLanguageStore = await loadLanguageStore();

    useAppLanguageStore.getState().initializeLanguage(null);
    useAppLanguageStore.getState().initializeLanguage(null);

    expect(useAppLanguageStore.getState().appLanguage).toBe("en");
    expect(languageTag()).toBe("en");
  });

  it("normalizes the persisted language to an app locale", async () => {
    writePersistedLanguage("zh-tw");
    const useAppLanguageStore = await loadLanguageStore();

    useAppLanguageStore.getState().initializeLanguage(null);

    expect(useAppLanguageStore.getState().appLanguage).toBe("zh-TW");
    expect(languageTag()).toBe("zh-TW");
    expect(readLocaleCookie()).toBe("zh-TW");
  });

  it("falls back to the default language when the persisted language is invalid", async () => {
    writePersistedLanguage("fr-FR");
    const useAppLanguageStore = await loadLanguageStore();

    useAppLanguageStore.getState().initializeLanguage(null);

    expect(useAppLanguageStore.getState().appLanguage).toBe(
      "ko" satisfies AppLanguage,
    );
    expect(languageTag()).toBe("ko");
    expect(readLocaleCookie()).toBe("ko");
  });
});

describe("getUrlLanguage", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("reads the locale from the first path segment", async () => {
    const { getUrlLanguage } = await import("./language");

    expect(getUrlLanguage("/en/settings")).toBe("en");
    expect(getUrlLanguage("/zh-TW")).toBe("zh-TW");
    expect(getUrlLanguage("https://zimdugo.com/ja/notices")).toBe("ja");
  });

  it("returns null for locale-less paths", async () => {
    const { getUrlLanguage } = await import("./language");

    expect(getUrlLanguage("/")).toBeNull();
    expect(getUrlLanguage("/settings")).toBeNull();
  });

  it("does not treat a path segment that merely starts with a locale as a locale", async () => {
    const { getUrlLanguage } = await import("./language");

    expect(getUrlLanguage("/japan")).toBeNull();
    expect(getUrlLanguage("/korea")).toBeNull();
    expect(getUrlLanguage("/enterprise")).toBeNull();
  });
});

describe("resolveLanguageSyncAction", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("redirects locale-less routes to the persisted non-default language", async () => {
    const { resolveLanguageSyncAction } = await import("./language");

    expect(
      resolveLanguageSyncAction({
        href: "/settings?tab=language#current",
        urlLanguage: null,
        persistedLanguage: "en",
        runtimeLanguage: "ko",
      }),
    ).toEqual({
      kind: "redirect",
      href: "/en/settings?tab=language#current",
    });
  });

  it("redirects prefixed routes to the persisted language when they drift", async () => {
    const { resolveLanguageSyncAction } = await import("./language");

    expect(
      resolveLanguageSyncAction({
        href: "/ja/settings",
        urlLanguage: "ja",
        persistedLanguage: "en",
        runtimeLanguage: "ko",
      }),
    ).toEqual({ kind: "redirect", href: "/en/settings" });
  });

  it("strips the URL locale when the persisted language is the base language", async () => {
    const { resolveLanguageSyncAction } = await import("./language");

    expect(
      resolveLanguageSyncAction({
        href: "/en/settings?tab=language#current",
        urlLanguage: "en",
        persistedLanguage: "ko",
        runtimeLanguage: "en",
      }),
    ).toEqual({
      kind: "redirect",
      href: "/settings?tab=language#current",
    });
  });

  it("syncs explicit URL locale when it matches the persisted language", async () => {
    const { resolveLanguageSyncAction } = await import("./language");

    expect(
      resolveLanguageSyncAction({
        href: "/ja/settings",
        urlLanguage: "ja",
        persistedLanguage: "ja",
        runtimeLanguage: "ko",
      }),
    ).toEqual({ kind: "sync", language: "ja" });
  });

  it("keeps the runtime language when locale-less route already matches persisted language", async () => {
    const { resolveLanguageSyncAction } = await import("./language");

    expect(
      resolveLanguageSyncAction({
        href: "/en/settings",
        urlLanguage: null,
        persistedLanguage: "en",
        runtimeLanguage: "en",
      }),
    ).toEqual({ kind: "sync", language: "en" });
  });

  it("keeps the base runtime language on locale-less routes when persisted language is base", async () => {
    const { resolveLanguageSyncAction } = await import("./language");

    expect(
      resolveLanguageSyncAction({
        href: "/settings",
        urlLanguage: null,
        persistedLanguage: "ko",
        runtimeLanguage: "ko",
      }),
    ).toEqual({ kind: "sync", language: "ko" });
  });

  it("does not redirect to the current href when the locale prefix is already correct", async () => {
    const { resolveLanguageSyncAction } = await import("./language");

    expect(
      resolveLanguageSyncAction({
        href: "/en",
        urlLanguage: null,
        persistedLanguage: "en",
        runtimeLanguage: "ko",
      }),
    ).toEqual({ kind: "sync", language: "en" });
  });

  it("does not redirect to the current nested href when the locale prefix is already correct", async () => {
    const { resolveLanguageSyncAction } = await import("./language");

    expect(
      resolveLanguageSyncAction({
        href: "/en/settings",
        urlLanguage: null,
        persistedLanguage: "en",
        runtimeLanguage: "ko",
      }),
    ).toEqual({ kind: "sync", language: "en" });
  });

  it("treats a trailing slash href as the current href", async () => {
    const { resolveLanguageSyncAction } = await import("./language");

    expect(
      resolveLanguageSyncAction({
        href: "/en/settings/",
        urlLanguage: null,
        persistedLanguage: "en",
        runtimeLanguage: "ko",
      }),
    ).toEqual({ kind: "sync", language: "en" });
  });

  it("does not redirect when the URL locale branch already points at the current href", async () => {
    const { resolveLanguageSyncAction } = await import("./language");

    expect(
      resolveLanguageSyncAction({
        href: "/en/settings",
        urlLanguage: "ja",
        persistedLanguage: "en",
        runtimeLanguage: "ko",
      }),
    ).toEqual({ kind: "sync", language: "en" });
  });

  it("still redirects when the target href differs from the current href", async () => {
    const { resolveLanguageSyncAction } = await import("./language");

    expect(
      resolveLanguageSyncAction({
        href: "/settings",
        urlLanguage: null,
        persistedLanguage: "en",
        runtimeLanguage: "ko",
      }),
    ).toEqual({ kind: "redirect", href: "/en/settings" });

    expect(
      resolveLanguageSyncAction({
        href: "/ja/settings",
        urlLanguage: "ja",
        persistedLanguage: "en",
        runtimeLanguage: "ko",
      }),
    ).toEqual({ kind: "redirect", href: "/en/settings" });

    expect(
      resolveLanguageSyncAction({
        href: "/en/settings?tab=language#current",
        urlLanguage: "en",
        persistedLanguage: "ko",
        runtimeLanguage: "en",
      }),
    ).toEqual({
      kind: "redirect",
      href: "/settings?tab=language#current",
    });
  });
});
