import { describe, expect, it } from "vitest";

import {
  buildAcceptLanguageHeader,
  resolveAcceptLanguageHeader,
  shouldAttachAcceptLanguage,
  toAcceptLanguage,
} from "./api-locale";

describe("toAcceptLanguage", () => {
  it("앱 로케일을 백엔드에 보내는 한 벌의 어휘로 옮긴다", () => {
    expect(toAcceptLanguage("ko")).toBe("ko");
    expect(toAcceptLanguage("en")).toBe("en");
    expect(toAcceptLanguage("ja")).toBe("ja");
    expect(toAcceptLanguage("zh")).toBe("zh-Hans");
    expect(toAcceptLanguage("zh-TW")).toBe("zh-Hant");
  });

  it("중국어를 지역이 아니라 문자로 가른다", () => {
    // 푸시 구독 본문은 zh-CN·zh-TW 를 400 으로 막는다. 그 값으로 되돌아가면
    // 구독 등록이 실패하므로 표기를 고정해 둔다.
    expect(toAcceptLanguage("zh")).not.toBe("zh-CN");
    expect(toAcceptLanguage("zh-TW")).not.toBe("zh-TW");
  });
});

describe("buildAcceptLanguageHeader", () => {
  it("서버 영어에서는 앱 로케일을 먼저, 와일드카드를 나중에 쓴다", () => {
    expect(buildAcceptLanguageHeader("ko")).toBe("ko, *;q=0.5");
    expect(buildAcceptLanguageHeader("zh-TW")).toBe("zh-Hant, *;q=0.5");
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
      "zh-Hant, *;q=0.5",
    );
  });
});
