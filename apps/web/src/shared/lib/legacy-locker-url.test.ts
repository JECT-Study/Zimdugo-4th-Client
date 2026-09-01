import { describe, expect, it } from "vitest";
import {
  createLockerCanonicalUrl,
  createLockerDeepLinkSlug,
  parseOpenLockerDeepLinkSearch,
} from "#/features/search/lib/open-locker-deep-link";
import { parseLockerSearchParam } from "#/features/search/model/search-url-state";
import { createSitemapXml } from "#/features/seo/model/sitemap";
import type { SeoLockerItem } from "#/shared/api/lockers";
import {
  parseLegacyLockerUrl,
  resolveLegacyLockerPath,
} from "#/shared/lib/legacy-locker-url";
import { parseSearchString } from "#/shared/lib/search-serialization";

const at = (href: string) => new URL(href, "https://zimdugo.com");

describe("resolveLegacyLockerPath", () => {
  it("사이트맵이 내는 모양을 보관함 경로로 옮긴다", () => {
    expect(resolveLegacyLockerPath(at("/?locker=164-강남역-4번-출구"))).toBe(
      `/lockers/${encodeURIComponent("164-강남역-4번-출구")}`,
    );
  });

  it("딥링크 모양을 보관함 경로로 옮긴다", () => {
    expect(resolveLegacyLockerPath(at("/?openLockerId=164"))).toBe(
      "/lockers/164",
    );
  });

  it("목적지에도 로케일 접두사를 남긴다", () => {
    for (const prefix of ["/en", "/ja", "/zh", "/zh-TW"]) {
      expect(resolveLegacyLockerPath(at(`${prefix}/?locker=164`))).toBe(
        `${prefix}/lockers/164`,
      );
    }
  });

  it("남은 검색 상태를 목적지로 옮긴다", () => {
    expect(
      resolveLegacyLockerPath(at("/?locker=164&q=강남&detailSnap=full")),
    ).toBe(`/lockers/164?q=${encodeURIComponent("강남")}&detailSnap=full`);
  });

  it("상세와 공존할 수 없는 장소 목록 파라미터는 뗀다", () => {
    // 구 구조가 만들 수 있었던 모순된 주소(#215). 목적지는 하나여야 한다.
    expect(resolveLegacyLockerPath(at("/?locker=164&searchPlaceId=900"))).toBe(
      "/lockers/164",
    );
  });

  it("상세 파라미터가 둘 다 있으면 색인된 쪽을 고른다", () => {
    expect(
      resolveLegacyLockerPath(at("/?locker=164-강남&openLockerId=999")),
    ).toBe(`/lockers/${encodeURIComponent("164-강남")}`);
  });

  it("구 상세 주소가 아니면 그대로 둔다", () => {
    expect(resolveLegacyLockerPath(at("/"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/?q=강남"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/?searchPlaceId=900"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/settings?locker=164"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/en/notices?locker=164"))).toBeNull();
  });

  it("애초에 유효하지 않은 id 는 받지 않는다", () => {
    expect(resolveLegacyLockerPath(at("/?locker=0"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/?locker=-1"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/?locker=abc"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/?locker="))).toBeNull();
    expect(resolveLegacyLockerPath(at("/?openLockerId=0"))).toBeNull();
    expect(resolveLegacyLockerPath(at("/?openLockerId=abc"))).toBeNull();
  });

  /**
   * 구 파라미터를 읽던 정규식은 하이픈 뒤를 무엇이든 받았다. 그 모양이 경로로
   * 그대로 넘어가면 다른 라우트나 다른 출처로 새어 나간다.
   */
  it("경로에 위험한 슬러그는 이름을 버리고 보관함 경로 안에 남긴다", () => {
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

  it("프로토콜 상대 주소를 목적지로 내지 않는다", () => {
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
  it("목적지가 가리키는 보관함 id 를 알려 준다", () => {
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
describe("실제로 내보내는 주소로 왕복해 본다", () => {
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

  it("사이트맵의 보관함 주소를 모두 보관함 경로로 옮긴다", () => {
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

  it("모든 로케일의 canonical 주소를 보관함 경로로 옮긴다", () => {
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
describe("홈 라우트가 쓰는 판정과 어긋나지 않는지", () => {
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
    "1e3",
    "0164",
  ];

  it.each(RAW_LOCKER_VALUES)(
    "maps %j exactly when the home route opens it",
    (raw) => {
      const url = new URL(
        `/?locker=${encodeURIComponent(raw)}`,
        "https://zimdugo.com",
      );
      // 홈 라우트가 실제로 받는 값은 역직렬화를 거친 뒤의 것이다.
      const opensDetail =
        parseLockerSearchParam(parseSearchString(url.search).locker) !==
        undefined;

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

/**
 * 규칙이 홈 라우트보다 엄격하면 오늘 열리던 주소가 전환 뒤 조용히 홈으로 떨어진다.
 * 주소를 읽는 세 단계가 모두 홈과 같은 함수를 쓰는지 여기서 고정한다.
 */
describe("라우터가 주소를 읽는 방식과 어긋나지 않는지", () => {
  /**
   * 라우터는 값마다 JSON 으로 읽어 본다(`router.tsx` 의 parseSearch).
   * 원시 문자열을 보면 같은 주소를 라우터와 다르게 해석하게 된다.
   */
  it("JSON 으로 읽히는 값을 라우터와 같게 읽는다", () => {
    // `1e3` 은 JSON 으로 읽으면 숫자 1000 이다. 홈도 1000 번을 연다.
    expect(parseSearchString("?locker=1e3").locker).toBe(1000);
    expect(resolveLegacyLockerPath(at("/?locker=1e3"))).toBe("/lockers/1000");
  });

  it("같은 키가 겹치면 라우터처럼 마지막 값을 남긴다", () => {
    expect(parseSearchString("?locker=164&locker=999").locker).toBe(999);
    expect(resolveLegacyLockerPath(at("/?locker=164&locker=999"))).toBe(
      "/lockers/999",
    );
  });

  /**
   * 두 파라미터는 판정하는 함수가 다르다. 딥링크 파서는 정수를 요구하지 않아
   * `12.5` 도 홈에서는 상세로 간다. 규칙만 `locker` 문법으로 다시 재면 그런 주소가
   * 여기서만 탈락한다. 각자의 파서가 낸 결과를 그대로 쓴다.
   */
  it("openLockerId 는 슬러그 문법이 아니라 딥링크 파서를 따른다", () => {
    expect(
      parseOpenLockerDeepLinkSearch({ openLockerId: "12.5" }).openLockerId,
    ).toBe(12.5);
    expect(resolveLegacyLockerPath(at("/?openLockerId=12.5"))).toBe(
      "/lockers/12.5",
    );
  });

  it("남은 쿼리를 라우터가 쓰는 방식 그대로 되돌려 낸다", () => {
    const path = resolveLegacyLockerPath(
      at("/?locker=164&q=강남&detailSnap=full"),
    );

    expect(path).not.toBeNull();

    const search = parseSearchString(
      new URL(path as string, "https://zimdugo.com").search,
    );
    expect(search).toEqual({ q: "강남", detailSnap: "full" });
  });
});
