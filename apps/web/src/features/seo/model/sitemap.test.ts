import { describe, expect, it } from "vitest";
import type { ClientDocumentResponse } from "#/shared/api/documents";
import type { SeoLockerItem } from "#/shared/api/lockers";
import { SITE_ORIGIN, SITE_SITEMAP_URL } from "#/shared/lib/site-url";
import { createSitemapXml } from "./sitemap";

const SEO_LOCKERS: SeoLockerItem[] = [
  {
    lockerId: 515,
    names: {
      ko: "\uAC15\uB0A8\uC5ED 4\uBC88 \uCD9C\uAD6C B1\uCE35",
      en: "Gangnam Station Exit 4 B1",
      ja: "Gangnam Station Exit 4 B1",
      zh: "Gangnam Station Exit 4 B1",
      "zh-TW": "Gangnam Station Exit 4 B1",
    },
  },
];

const NOTICES: ClientDocumentResponse[] = [
  {
    id: 12,
    type: "NOTICE",
    title: "Service notice",
    appliedAt: "2026-01-01",
    sections: [],
  },
];

describe("SITE URL constants", () => {
  it("uses the production domain for sitemap discovery", () => {
    expect(SITE_ORIGIN).toBe("https://zimdugo.com");
    expect(SITE_SITEMAP_URL).toBe("https://zimdugo.com/sitemap.xml");
  });
});

describe("createSitemapXml", () => {
  it("creates sitemap locations with the production domain only", () => {
    const xml = createSitemapXml(SEO_LOCKERS, NOTICES);

    expect(xml).toContain("<loc>https://zimdugo.com</loc>");
    expect(xml).toContain("<loc>https://zimdugo.com/en/notices</loc>");
    expect(xml).toContain("<loc>https://zimdugo.com/notices/12</loc>");
    expect(xml).not.toContain("/settings/terms");
    expect(xml).not.toContain("/settings/privacy");
    expect(xml).toContain("https://zimdugo.com/?locker=515-");
    expect(xml).toContain("https://zimdugo.com/en/?locker=515-");
    expect(xml).not.toContain("zimdugo-web.vercel.app");
  });

  it("adds hreflang alternates and x-default for locker detail URLs", () => {
    const xml = createSitemapXml(SEO_LOCKERS);

    expect(xml).toContain('hreflang="ko"');
    expect(xml).toContain('hreflang="en"');
    expect(xml).toContain('hreflang="ja"');
    expect(xml).toContain('hreflang="zh"');
    expect(xml).toContain('hreflang="zh-TW"');
    expect(xml).toContain('hreflang="x-default"');
  });

  it("escapes query separators for XML attribute safety", () => {
    const xml = createSitemapXml(SEO_LOCKERS);

    expect(xml).toContain(
      'href="https://zimdugo.com/?locker=515-%EA%B0%95%EB%82%A8%EC%97%AD-4%EB%B2%88-%EC%B6%9C%EA%B5%AC-B1%EC%B8%B5"',
    );
  });

  it("falls back to locker id when runtime data is missing localized names", () => {
    const xml = createSitemapXml([
      {
        lockerId: 77,
        names: null,
      } as unknown as SeoLockerItem,
    ]);

    expect(xml).toContain("https://zimdugo.com/?locker=77");
    expect(xml).toContain("https://zimdugo.com/en/?locker=77");
  });
});
