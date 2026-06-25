import { languageTag, setLanguageTag } from "@repo/i18n";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

const loadLanguageStore = async () => {
  const languageModule = await import("./language");
  return languageModule.useAppLanguageStore;
};

describe("useAppLanguageStore", () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
    clearLocaleCookie();
    setLanguageTag("ko", { reload: false });
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
    setLanguageTag("ko", { reload: false });
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
});
