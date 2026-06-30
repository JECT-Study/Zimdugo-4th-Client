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

describe("localized SEO URL helpers", () => {
  it("resolves SEO locale from localized pathnames", () => {
    expect(getSeoLocaleFromPathname("/")).toBe("ko");
    expect(getSeoLocaleFromPathname("/en")).toBe("en");
    expect(getSeoLocaleFromPathname("/ja/notices")).toBe("ja");
    expect(getSeoLocaleFromPathname("/zh-TW/notices")).toBe("zh-TW");
  });

  it("resolves SEO locale from the public href before router-rewritten pathnames", () => {
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

  it("resolves SEO pathname from the public href before router-rewritten pathnames", () => {
    expect(getSeoPathname({ publicHref: "/zh/notices", pathname: "/" })).toBe(
      "/zh/notices",
    );
    expect(getSeoPathname({ pathname: "/notices" })).toBe("/notices");
  });

  it("keeps the service title English except Korean SEO metadata", () => {
    expect(getSeoSiteName("ko")).toBe("\uC9D0\uB450\uACE0 (Zimdugo)");
    expect(getSeoSiteName("en")).toBe("Zimdugo");
    expect(getSeoSiteName("ja")).toBe("Zimdugo");
  });

  it("creates locale-prefixed pathnames while keeping Korean as the root path", () => {
    expect(createLocalizedPathname("/", "ko")).toBe("/");
    expect(createLocalizedPathname("/", "en")).toBe("/en");
    expect(createLocalizedPathname("/ja/notices", "zh-TW")).toBe(
      "/zh-TW/notices",
    );
  });

  it("creates canonical URLs for the current pathname locale", () => {
    expect(createCanonicalUrlForPathname("/")).toBe("https://zimdugo.com");
    expect(createCanonicalUrlForPathname("/en")).toBe("https://zimdugo.com/en");
    expect(createCanonicalUrlForPathname("/zh/notices")).toBe(
      "https://zimdugo.com/zh/notices",
    );
  });

  it("creates alternate links for all supported locales and x-default", () => {
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

  it("keeps search params when creating localized URLs", () => {
    expect(
      createLocalizedUrl({
        pathname: "/",
        locale: "en",
        search: "?locker=515-Gangnam",
      }),
    ).toBe("https://zimdugo.com/en?locker=515-Gangnam");
  });
});
