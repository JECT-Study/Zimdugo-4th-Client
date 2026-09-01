import { describe, expect, it } from "vitest";
import {
  createLockerCanonicalUrl,
  createLockerDeepLinkSlug,
} from "#/features/search/lib/open-locker-deep-link";
import { parseLockerSearchParam } from "#/features/search/model/search-url-state";
import { createSitemapXml } from "#/features/seo/model/sitemap";
import type { SeoLockerItem } from "#/shared/api/lockers";
import {
  parseLegacyLockerUrl,
  resolveLegacyLockerPath,
} from "#/shared/lib/legacy-locker-url";

const at = (href: string) => new URL(href, "https://zimdugo.com");

describe("resolveLegacyLockerPath", () => {
  it("moves the sitemap shape onto the locker route", () => {
    expect(resolveLegacyLockerPath(at("/?locker=164-강남역-4번-출구"))).toBe(
      `/lockers/${encodeURIComponent("164-강남역-4번-출구")}`,
    );
  });

  it("moves the deep link shape onto the locker route", () => {
    expect(resolveLegacyLockerPath(at("/?openLockerId=164"))).toBe(
      "/lockers/164",
    );
  });

  it("keeps the locale prefix on the destination", () => {
    for (const prefix of ["/en", "/ja", "/zh", "/zh-TW"]) {
      expect(resolveLegacyLockerPath(at(`${prefix}/?locker=164`))).toBe(
        `${prefix}/lockers/164`,
      );
    }
  });

  it("carries the remaining search state to the destination", () => {
    expect(
      resolveLegacyLockerPath(at("/?locker=164&q=강남&detailSnap=full")),
    ).toBe(`/lockers/164?q=${encodeURIComponent("강남")}&detailSnap=full`);
  });

  it("drops the place list param that cannot coexist with a detail", () => {
    // 구 구조가 만들 수 있었던 모순된 주소(#215). 목적지는 하나여야 한다.
    expect(resolveLegacyLockerPath(at("/?locker=164&searchPlaceId=900"))).toBe(
      "/lockers/164",
    );
  });

  it("prefers the indexed param when both detail params are present", () => {
    expect(
      resolveLegacyLockerPath(at("/?locker=164-강남&openLockerId=999")),
    ).toBe(`/lockers/${encodeURIComponent("164-강남")}`);
  });

  it("leaves addresses that are not a legacy detail alone", () => {
    expect(resolveLegacyLockerPath(at("/"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/?q=강남"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/?searchPlaceId=900"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/settings?locker=164"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/en/notices?locker=164"))).toBeNull();
  });

  it("rejects ids that were never valid", () => {
    expect(resolveLegacyLockerPath(at("/?locker=0"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/?locker=-1"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/?locker=abc"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/?locker="))).toBeNull();
    expect(resolveLegacyLockerPath(at("/?openLockerId=12.5"))).toBeNull();
  });

  /**
   * 구 파라미터를 읽던 정규식은 하이픈 뒤를 무엇이든 받았다. 그 모양이 경로로
   * 그대로 넘어가면 다른 라우트나 다른 출처로 새어 나간다.
   */
  it("keeps an unsafe slug inside the locker route by dropping the name", () => {
    // 오늘 열리는 주소이므로 목적지는 있어야 한다. 다만 이름은 버리고 id 만 남는다.
    expect(resolveLegacyLockerPath(at("/?locker=164-a/b"))).toBe(
      "/lockers/164",
    );
    expect(resolveLegacyLockerPath(at("/?locker=164-..%2F..%2Fsettings"))).toBe(
      "/lockers/164",
    );
    expect(resolveLegacyLockerPath(at("/?locker=164-%2F%2Fevil.example"))).toBe(
      "/lockers/164",
    );
  });

  it("never returns a protocol relative destination", () => {
    for (const href of [
      "/?locker=164",
      "/en/?locker=164",
      "/?openLockerId=164",
    ]) {
      const path = resolveLegacyLockerPath(at(href));

      expect(path?.startsWith("//")).toBe(false);
      expect(new URL(path as string, "https://zimdugo.com").origin).toBe(
        "https://zimdugo.com",
      );
    }
  });
});

describe("parseLegacyLockerUrl", () => {
  it("reports the locker id the destination stands for", () => {
    expect(parseLegacyLockerUrl(at("/?locker=164-강남역"))?.lockerId).toBe(164);
    expect(parseLegacyLockerUrl(at("/?openLockerId=164"))?.lockerId).toBe(164);
  });
});

/**
 * 손으로 적은 주소가 아니라 실제로 색인된 주소에 대고 검증한다.
 *
 * 규칙이 맞는지는 사이트맵과 canonical 이 지금 뱉는 모양으로만 확인할 수 있다.
 * 생성 쪽이 바뀌면 이 테스트가 먼저 깨져야 한다.
 */
describe("round trip against the URLs we actually publish", () => {
  const LOCKER_TITLE = "강남역 4번 출구 B1층";

  const SEO_LOCKERS: SeoLockerItem[] = [
    {
      lockerId: 515,
      names: {
        ko: LOCKER_TITLE,
        en: "Gangnam Station Exit 4 B1",
        ja: "江南駅 4番出口 B1",
        zh: "江南站 4号出口 B1",
        "zh-TW": "江南站 4號出口 B1",
      },
    },
  ];

  it("maps every locker URL in the sitemap onto the locker route", () => {
    const xml = createSitemapXml(SEO_LOCKERS, []);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => match[1],
    );
    const lockerLocs = locs.filter((loc) => loc.includes("locker="));

    // 로케일 5종이 모두 나와야 한다. 하나라도 빠지면 검증이 헐거워진다.
    expect(lockerLocs).toHaveLength(5);

    for (const loc of lockerLocs) {
      const url = new URL(loc.replace(/&amp;/g, "&"));
      const path = resolveLegacyLockerPath(url);

      expect(path).not.toBeNull();
      expect(parseLegacyLockerUrl(url)?.lockerId).toBe(515);
      expect(path).toContain("/lockers/");
      expect(path).not.toContain("locker=");
    }
  });

  it("maps the canonical URL of every locale onto the locker route", () => {
    for (const locale of ["ko", "en", "ja", "zh", "zh-TW"] as const) {
      const canonical = createLockerCanonicalUrl({
        lockerId: 515,
        title: LOCKER_TITLE,
        locale,
      });
      const slug = createLockerDeepLinkSlug({
        lockerId: 515,
        title: LOCKER_TITLE,
      });

      expect(resolveLegacyLockerPath(new URL(canonical))).toBe(
        `${locale === "ko" ? "" : `/${locale}`}/lockers/${encodeURIComponent(slug)}`,
      );
    }
  });
});

/**
 * 매핑이 "지금 열리는 주소를 빠짐없이 덮는가" 를 주장이 아니라 성질로 고정한다.
 *
 * 홈 라우트가 상세로 인정하는 값이면 목적지가 반드시 있어야 한다. 판정 함수를 함께
 * 쓰므로 지금은 성립하지만, 누가 한쪽에 예외를 더하면 여기서 먼저 깨진다.
 */
describe("agreement with the parser the home route uses", () => {
  const RAW_LOCKER_VALUES = [
    "164",
    "164-강남역",
    "164-Gangnam-Station",
    "164-a/b",
    "164-..%2F..%2Fsettings",
    "0",
    "-1",
    "abc",
    "",
    " 164 ",
    "12.5",
    "164 강남",
  ];

  it.each(RAW_LOCKER_VALUES)(
    "maps %j exactly when the home route opens it",
    (raw) => {
      const url = new URL(
        `/?locker=${encodeURIComponent(raw)}`,
        "https://zimdugo.com",
      );
      const opensDetail = parseLockerSearchParam(raw) !== undefined;

      expect(resolveLegacyLockerPath(url) !== null).toBe(opensDetail);
    },
  );

  it.each(RAW_LOCKER_VALUES)(
    "always produces a destination inside the locker route for %j",
    (raw) => {
      const url = new URL(
        `/?locker=${encodeURIComponent(raw)}`,
        "https://zimdugo.com",
      );
      const path = resolveLegacyLockerPath(url);

      if (path === null) return;

      expect(path.startsWith("/lockers/")).toBe(true);
      // 경로 조각은 하나여야 한다. 슬래시가 더 있으면 다른 라우트로 새어 나간다.
      expect(path.slice("/lockers/".length).split("?")[0]).not.toContain("/");
    },
  );
});
