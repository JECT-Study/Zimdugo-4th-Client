import { describe, expect, it } from "vitest";

import {
  buildAcceptLanguageHeader,
  resolveAcceptLanguageHeader,
  shouldAttachAcceptLanguage,
  toAcceptLanguage,
} from "./api-locale";

describe("toAcceptLanguage", () => {
  it("앱 로케일을 백엔드 Accept-Language 값으로 옮긴다", () => {
    expect(toAcceptLanguage("ko")).toBe("ko-KR");
    expect(toAcceptLanguage("en")).toBe("en-US");
    expect(toAcceptLanguage("ja")).toBe("ja-JP");
    expect(toAcceptLanguage("zh")).toBe("zh-CN");
    expect(toAcceptLanguage("zh-TW")).toBe("zh-TW");
  });
});

describe("buildAcceptLanguageHeader", () => {
  it("서버 영어에서는 앱 로케일을 먼저, 와일드카드를 나중에 쓴다", () => {
    expect(buildAcceptLanguageHeader("ko")).toBe("ko-KR, *;q=0.5");
    expect(buildAcceptLanguageHeader("zh-TW")).toBe("zh-TW, *;q=0.5");
  });
});

describe("shouldAttachAcceptLanguage", () => {
  it("보관함·장소·문서 조회 API 에 걸린다", () => {
    expect(shouldAttachAcceptLanguage("/api/v1/lockers/pins")).toBe(true);
    expect(shouldAttachAcceptLanguage("/api/v1/lockers/search")).toBe(true);
    expect(shouldAttachAcceptLanguage("/api/v1/lockers/42")).toBe(true);
    expect(shouldAttachAcceptLanguage("/api/v1/places/99")).toBe(true);
    expect(
      shouldAttachAcceptLanguage("https://api.zimdugo.com/api/v1/lockers/pins"),
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
  it("보관함·장소 API 밖에서는 값을 주지 않는다", () => {
    expect(
      resolveAcceptLanguageHeader("/api/v1/me/profile", "ja"),
    ).toBeUndefined();
  });

  it("보관함·장소 API 에는 앱 로케일과 와일드카드를 함께 준다", () => {
    expect(resolveAcceptLanguageHeader("/api/v1/lockers/search", "zh-TW")).toBe(
      "zh-TW, *;q=0.5",
    );
  });
});
