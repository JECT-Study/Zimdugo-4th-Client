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
  });

  it("prefers the URL locale over the persisted app language", async () => {
    writePersistedLanguage("en");
    const useAppLanguageStore = await loadLanguageStore();

    useAppLanguageStore.getState().initializeLanguage("ja");

    expect(useAppLanguageStore.getState().appLanguage).toBe("ja");
    expect(languageTag()).toBe("ja");
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
  });

  it("falls back to the default language when the persisted language is invalid", async () => {
    writePersistedLanguage("fr-FR");
    const useAppLanguageStore = await loadLanguageStore();

    useAppLanguageStore.getState().initializeLanguage(null);

    expect(useAppLanguageStore.getState().appLanguage).toBe(
      "ko" satisfies AppLanguage,
    );
    expect(languageTag()).toBe("ko");
  });
});
