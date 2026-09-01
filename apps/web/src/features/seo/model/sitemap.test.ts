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

describe("사이트 주소 상수", () => {
  it("사이트맵 위치에 프로덕션 도메인을 쓴다", () => {
    expect(SITE_ORIGIN).toBe("https://zimdugo.com");
    expect(SITE_SITEMAP_URL).toBe("https://zimdugo.com/sitemap.xml");
  });
});

describe("createSitemapXml", () => {
  it("사이트맵 주소를 프로덕션 도메인으로만 만든다", () => {
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

  it("보관함 상세 주소에 hreflang 대체와 x-default 를 붙인다", () => {
    const xml = createSitemapXml(SEO_LOCKERS);

    expect(xml).toContain('hreflang="ko"');
    expect(xml).toContain('hreflang="en"');
    expect(xml).toContain('hreflang="ja"');
    expect(xml).toContain('hreflang="zh"');
    expect(xml).toContain('hreflang="zh-TW"');
    expect(xml).toContain('hreflang="x-default"');
  });

  it("XML 속성에 안전하도록 쿼리 구분자를 이스케이프한다", () => {
    const xml = createSitemapXml(SEO_LOCKERS);

    expect(xml).toContain(
      'href="https://zimdugo.com/?locker=515-%EA%B0%95%EB%82%A8%EC%97%AD-4%EB%B2%88-%EC%B6%9C%EA%B5%AC-B1%EC%B8%B5"',
    );
  });

  it("로케일 이름이 없으면 보관함 id 로 물러선다", () => {
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
