import { describe, expect, it } from "vitest";

import {
  isAppLocale,
  normalizeLocale,
  parsePathLocale,
  stripLocalePathPrefix,
} from "./locales";

describe("normalizeLocale", () => {
  it("브라우저·백엔드 태그를 앱 로케일로 옮긴다", () => {
    expect(normalizeLocale("ko-KR")).toBe("ko");
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("ja-JP")).toBe("ja");
    expect(normalizeLocale("zh-CN")).toBe("zh");
    expect(normalizeLocale("zh")).toBe("zh");
    expect(normalizeLocale("zh-TW")).toBe("zh-TW");
    expect(normalizeLocale("zh-Hant")).toBe("zh-TW");
    expect(normalizeLocale("zh-Hant-TW")).toBe("zh-TW");
    expect(normalizeLocale("zh-Hant-HK")).toBe("zh-TW");
    expect(normalizeLocale("zh-HK")).toBe("zh-TW");
  });
});

describe("isAppLocale", () => {
  it("정규 표기 로케일만 받는다", () => {
    expect(isAppLocale("ko")).toBe(true);
    expect(isAppLocale("zh-TW")).toBe(true);
    expect(isAppLocale("ko-KR")).toBe(false);
    expect(isAppLocale("zh-Hant-TW")).toBe(false);
  });
});

describe("로케일 경로 헬퍼", () => {
  it("경로에서 zh 보다 zh-TW 를 먼저 읽는다", () => {
    expect(parsePathLocale("/zh-TW/settings")).toBe("zh-TW");
    expect(parsePathLocale("/zh/settings")).toBe("zh");
    expect(stripLocalePathPrefix("/zh-TW/settings/language")).toBe(
      "/settings/language",
    );
  });
});
