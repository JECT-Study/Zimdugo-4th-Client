import { beforeEach, describe, expect, it } from "vitest";

import { getLocalizedHref, setAppLanguage } from "./language";

const LOCALE_COOKIE_NAME = "PARAGLIDE_LOCALE";

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

describe("getLocalizedHref", () => {
  it("adds the locale prefix for non-base languages", () => {
    expect(getLocalizedHref("/settings", "en")).toBe("/en/settings");
    expect(getLocalizedHref("/", "ja")).toBe("/ja");
    expect(getLocalizedHref("/notices/1", "zh-TW")).toBe("/zh-TW/notices/1");
  });

  it("strips the locale prefix for the base language", () => {
    expect(getLocalizedHref("/en/settings", "ko")).toBe("/settings");
    expect(getLocalizedHref("/ja", "ko")).toBe("/");
  });

  it("replaces an existing locale prefix", () => {
    expect(getLocalizedHref("/en/settings", "ja")).toBe("/ja/settings");
  });

  it("keeps the search string and hash", () => {
    expect(getLocalizedHref("/settings?tab=language#current", "en")).toBe(
      "/en/settings?tab=language#current",
    );
  });

  it("keeps absolute hrefs absolute", () => {
    expect(getLocalizedHref("https://zimdugo.com/settings", "en")).toBe(
      "https://zimdugo.com/en/settings",
    );
  });
});

describe("setAppLanguage", () => {
  beforeEach(() => {
    clearLocaleCookie();
  });

  it("writes the selected language to the locale cookie", () => {
    setAppLanguage("en");

    expect(readLocaleCookie()).toBe("en");
  });

  it("overwrites a previously stored preference", () => {
    setAppLanguage("en");
    setAppLanguage("zh-TW");

    expect(readLocaleCookie()).toBe("zh-TW");
  });

  it("ignores values outside the supported locales", () => {
    setAppLanguage("fr" as never);

    expect(readLocaleCookie()).toBeNull();
  });
});
