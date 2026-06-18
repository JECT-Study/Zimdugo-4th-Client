import { describe, expect, it } from "vitest";

import {
  buildAcceptLanguageHeader,
  resolveAcceptLanguageHeader,
  shouldAttachAcceptLanguage,
  toAcceptLanguage,
} from "./api-locale";

describe("toAcceptLanguage", () => {
  it("maps app locales to backend Accept-Language values", () => {
    expect(toAcceptLanguage("ko")).toBe("ko-KR");
    expect(toAcceptLanguage("en")).toBe("en-US");
    expect(toAcceptLanguage("ja")).toBe("ja-JP");
    expect(toAcceptLanguage("zh")).toBe("zh-CN");
    expect(toAcceptLanguage("zh-TW")).toBe("zh-TW");
  });
});

describe("buildAcceptLanguageHeader", () => {
  it("uses app locale first and wildcard fallback for server-side English", () => {
    expect(buildAcceptLanguageHeader("ko")).toBe("ko-KR, *;q=0.5");
    expect(buildAcceptLanguageHeader("zh-TW")).toBe("zh-TW, *;q=0.5");
  });
});

describe("shouldAttachAcceptLanguage", () => {
  it("matches locker, place, and document read APIs", () => {
    expect(shouldAttachAcceptLanguage("/api/v1/lockers/pin")).toBe(true);
    expect(shouldAttachAcceptLanguage("/api/v1/lockers/keyword")).toBe(true);
    expect(shouldAttachAcceptLanguage("/api/v1/lockers/42")).toBe(true);
    expect(shouldAttachAcceptLanguage("/api/v1/places/99")).toBe(true);
    expect(
      shouldAttachAcceptLanguage("https://api.zimdugo.com/api/v1/lockers/pin"),
    ).toBe(true);

    expect(shouldAttachAcceptLanguage("/api/v1/me/profile")).toBe(false);
    expect(
      shouldAttachAcceptLanguage("/api/v1/me?next=/api/v1/lockers/1"),
    ).toBe(false);
    expect(shouldAttachAcceptLanguage("/api/v1/me/favorite-lockers/1")).toBe(
      false,
    );
    expect(shouldAttachAcceptLanguage("/api/v1/lockers/1/votes")).toBe(true);

    expect(shouldAttachAcceptLanguage("/api/v1/documents")).toBe(true);
    expect(shouldAttachAcceptLanguage("/api/v1/documents?type=NOTICE")).toBe(
      true,
    );
  });
});

describe("resolveAcceptLanguageHeader", () => {
  it("returns undefined outside locker/place APIs", () => {
    expect(
      resolveAcceptLanguageHeader("/api/v1/me/profile", "ja"),
    ).toBeUndefined();
  });

  it("returns app locale with wildcard for locker/place APIs", () => {
    expect(resolveAcceptLanguageHeader("/api/v1/lockers/keyword", "zh-TW")).toBe(
      "zh-TW, *;q=0.5",
    );
  });
});
