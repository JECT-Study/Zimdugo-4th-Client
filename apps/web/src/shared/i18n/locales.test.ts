import { describe, expect, it } from "vitest";

import {
  normalizeLocale,
  parsePathLocale,
  resolveBrowserLanguageCandidates,
  stripLocalePathPrefix,
  UNSUPPORTED_LOCALE_FALLBACK,
} from "./locales";

describe("normalizeLocale", () => {
  it("maps browser and backend tags to app locales", () => {
    expect(normalizeLocale("ko-KR")).toBe("ko");
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("ja-JP")).toBe("ja");
    expect(normalizeLocale("zh-CN")).toBe("zh");
    expect(normalizeLocale("zh")).toBe("zh");
    expect(normalizeLocale("zh-TW")).toBe("zh-TW");
    expect(normalizeLocale("zh-Hant")).toBe("zh-TW");
    expect(normalizeLocale("zh-HK")).toBe("zh-TW");
  });
});

describe("locale path helpers", () => {
  it("parses zh-TW before zh in the pathname", () => {
    expect(parsePathLocale("/zh-TW/settings")).toBe("zh-TW");
    expect(parsePathLocale("/zh/settings")).toBe("zh");
    expect(stripLocalePathPrefix("/zh-TW/settings/language")).toBe(
      "/settings/language",
    );
  });
});

describe("resolveBrowserLanguageCandidates", () => {
  it("falls back to English when browser languages are unsupported", () => {
    expect(resolveBrowserLanguageCandidates(["fr-FR", "de-DE"])).toBe(
      UNSUPPORTED_LOCALE_FALLBACK,
    );
    expect(resolveBrowserLanguageCandidates(["ko-KR"])).toBe("ko");
    expect(resolveBrowserLanguageCandidates([])).toBeNull();
  });
});
