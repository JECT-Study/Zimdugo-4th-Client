import { describe, expect, it } from "vitest";
import {
  createAlternateLinksForPathname,
  createCanonicalUrlForPathname,
  createLocalizedPathname,
  createLocalizedUrl,
  getSeoLocale,
  getSeoLocaleFromPathname,
  getSeoPathname,
  getSeoSiteName,
} from "./localized-seo-head";

describe("로케일별 SEO 주소 헬퍼", () => {
  it("로케일이 붙은 경로에서 SEO 로케일을 정한다", () => {
    expect(getSeoLocaleFromPathname("/")).toBe("ko");
    expect(getSeoLocaleFromPathname("/en")).toBe("en");
    expect(getSeoLocaleFromPathname("/ja/notices")).toBe("ja");
    expect(getSeoLocaleFromPathname("/zh-TW/notices")).toBe("zh-TW");
  });

  it("라우터가 고친 경로보다 공개 주소를 먼저 보고 로케일을 정한다", () => {
    expect(
      getSeoLocale({
        publicHref: "/en",
        pathname: "/",
        runtimeLocale: "ko",
      }),
    ).toBe("en");
    expect(
      getSeoLocale({
        pathname: "/zh/notices",
        runtimeLocale: "ko",
      }),
    ).toBe("zh");
    expect(
      getSeoLocale({
        pathname: "/",
        runtimeLocale: "ja",
      }),
    ).toBe("ja");
  });

  it("라우터가 고친 경로보다 공개 주소를 먼저 보고 경로를 정한다", () => {
    expect(getSeoPathname({ publicHref: "/zh/notices", pathname: "/" })).toBe(
      "/zh/notices",
    );
    expect(getSeoPathname({ pathname: "/notices" })).toBe("/notices");
  });

  it("한국어가 아니면 서비스 이름을 영문으로 둔다", () => {
    expect(getSeoSiteName("ko")).toBe("\uC9D0\uB450\uACE0 (Zimdugo)");
    expect(getSeoSiteName("en")).toBe("Zimdugo");
    expect(getSeoSiteName("ja")).toBe("Zimdugo");
  });

  it("한국어는 루트로 두고 나머지에만 접두사를 붙인다", () => {
    expect(createLocalizedPathname("/", "ko")).toBe("/");
    expect(createLocalizedPathname("/", "en")).toBe("/en");
    expect(createLocalizedPathname("/ja/notices", "zh-TW")).toBe(
      "/zh-TW/notices",
    );
  });

  it("현재 경로의 로케일에 맞는 canonical 주소를 만든다", () => {
    expect(createCanonicalUrlForPathname("/")).toBe("https://zimdugo.com");
    expect(createCanonicalUrlForPathname("/en")).toBe("https://zimdugo.com/en");
    expect(createCanonicalUrlForPathname("/zh/notices")).toBe(
      "https://zimdugo.com/zh/notices",
    );
  });

  it("지원하는 모든 로케일과 x-default 의 대체 링크를 만든다", () => {
    const links = createAlternateLinksForPathname("/en/notices");

    expect(links).toEqual([
      {
        rel: "alternate",
        hrefLang: "ko",
        href: "https://zimdugo.com/notices",
      },
      {
        rel: "alternate",
        hrefLang: "en",
        href: "https://zimdugo.com/en/notices",
      },
      {
        rel: "alternate",
        hrefLang: "ja",
        href: "https://zimdugo.com/ja/notices",
      },
      {
        rel: "alternate",
        hrefLang: "zh",
        href: "https://zimdugo.com/zh/notices",
      },
      {
        rel: "alternate",
        hrefLang: "zh-TW",
        href: "https://zimdugo.com/zh-TW/notices",
      },
      {
        rel: "alternate",
        hrefLang: "x-default",
        href: "https://zimdugo.com/notices",
      },
    ]);
  });

  it("로케일 주소를 만들 때 쿼리를 지킨다", () => {
    expect(
      createLocalizedUrl({
        pathname: "/",
        locale: "en",
        search: "?locker=515-Gangnam",
      }),
    ).toBe("https://zimdugo.com/en?locker=515-Gangnam");
  });
});
