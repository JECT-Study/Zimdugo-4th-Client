import { describe, expect, it } from "vitest";
import { resolveLegacyLockerPath } from "#/shared/lib/legacy-locker-url";
import { toInternalMapUrl, toPublicMapUrl } from "#/shared/lib/map-path-url";
import { parseSearchString } from "#/shared/lib/search-serialization";

const at = (href: string) => new URL(href, "https://zimdugo.com");
const pathAndSearch = (url: URL) => `${url.pathname}${url.search}`;
const encoded = (slug: string) => `/lockers/${encodeURIComponent(slug)}`;

describe("toInternalMapUrl", () => {
  it("보관함 경로를 홈의 locker 파라미터로 옮긴다", () => {
    const url = toInternalMapUrl(at(encoded("164-강남역-4번-출구")));

    expect(url.pathname).toBe("/");
    expect(parseSearchString(url.search)).toEqual({
      locker: "164-강남역-4번-출구",
    });
  });

  it("경로에 붙은 나머지 검색 상태를 그대로 남긴다", () => {
    const url = toInternalMapUrl(at("/lockers/164?q=강남&detailSnap=full"));

    expect(parseSearchString(url.search)).toEqual({
      q: "강남",
      detailSnap: "full",
      locker: 164,
    });
  });

  it("경로와 쿼리가 다른 보관함을 가리키면 경로를 따른다", () => {
    const url = toInternalMapUrl(at("/lockers/164?locker=999"));

    expect(parseSearchString(url.search).locker).toBe(164);
  });

  it("끝의 슬래시는 같은 주소로 본다", () => {
    expect(toInternalMapUrl(at("/lockers/164/")).pathname).toBe("/");
  });

  it("상세로 인정하지 않는 값은 옮기지 않는다", () => {
    for (const path of ["/lockers/abc", "/lockers/0", "/lockers/-1"]) {
      expect(pathAndSearch(toInternalMapUrl(at(path)))).toBe(path);
    }
  });

  it("보관함 경로 아래의 다른 경로는 건드리지 않는다", () => {
    for (const path of ["/lockers", "/lockers/164/photos", "/my/lockers/164"]) {
      expect(toInternalMapUrl(at(path)).pathname).toBe(path);
    }
  });

  it("인코딩이 깨진 경로는 건드리지 않는다", () => {
    expect(toInternalMapUrl(at("/lockers/164-%E0%A4%A")).pathname).toBe(
      "/lockers/164-%E0%A4%A",
    );
  });
});

describe("toInternalMapUrl 의 검색과 장소", () => {
  it("검색 경로는 홈의 검색어로 옮긴다", () => {
    const url = toInternalMapUrl(at("/search?q=강남"));

    expect(url.pathname).toBe("/");
    expect(parseSearchString(url.search)).toEqual({ q: "강남" });
  });

  it("장소 경로는 홈의 place 파라미터로 옮긴다", () => {
    const url = toInternalMapUrl(at("/places/9?q=강남"));

    expect(url.pathname).toBe("/");
    expect(parseSearchString(url.search)).toEqual({ q: "강남", place: 9 });
  });

  it("장소로 인정하지 않는 값은 옮기지 않는다", () => {
    for (const path of ["/places/abc", "/places/0", "/places/1.5"]) {
      expect(toInternalMapUrl(at(path)).pathname).toBe(path);
    }
  });

  it("경로가 정하는 화면과 어긋나는 쿼리는 버린다", () => {
    expect(
      parseSearchString(toInternalMapUrl(at("/places/9?locker=164")).search),
    ).toEqual({ place: 9 });
    expect(
      parseSearchString(
        toInternalMapUrl(at("/search?q=a&place=9&locker=164")).search,
      ),
    ).toEqual({ q: "a" });
  });

  it("장소·검색 경로에 붙은 앱 안 딥링크 상세는 버린다", () => {
    // openLockerId 가 남으면 화면 계산이 상세로 보고, 장소 목록 주소가 상세를 연다.
    expect(
      parseSearchString(
        toInternalMapUrl(at("/places/9?openLockerId=164")).search,
      ),
    ).toEqual({ place: 9 });
    expect(
      parseSearchString(
        toInternalMapUrl(at("/search?q=a&openLockerId=164")).search,
      ),
    ).toEqual({ q: "a" });
  });

  it("예전 searchPlaceId 주소를 장소로 옮긴다", () => {
    const url = toInternalMapUrl(at("/?q=강남&searchPlaceId=9"));

    expect(parseSearchString(url.search)).toEqual({ q: "강남", place: 9 });
    expect(pathAndSearch(toPublicMapUrl(url))).toBe(
      `/places/9?q=${encodeURIComponent("강남")}`,
    );
  });
});

describe("toPublicMapUrl", () => {
  it("홈의 locker 파라미터를 보관함 경로로 옮긴다", () => {
    expect(
      pathAndSearch(toPublicMapUrl(at("/?locker=164-강남역-4번-출구"))),
    ).toBe(encoded("164-강남역-4번-출구"));
  });

  it("나머지 검색 상태는 쿼리로 남긴다", () => {
    expect(pathAndSearch(toPublicMapUrl(at("/?q=gangnam&locker=164")))).toBe(
      "/lockers/164?q=gangnam",
    );
  });

  it("경로에 위험한 슬러그는 이름을 버리고 id 만 남긴다", () => {
    expect(toPublicMapUrl(at("/?locker=164-a%2Fb")).pathname).toBe(
      "/lockers/164",
    );
  });

  it("화면 값이 없는 홈 주소는 그대로 둔다", () => {
    for (const path of ["/", "/?locker=abc", "/?place=abc"]) {
      expect(pathAndSearch(toPublicMapUrl(at(path)))).toBe(path);
    }
  });

  it("검색어만 있으면 검색 경로로 옮긴다", () => {
    expect(pathAndSearch(toPublicMapUrl(at("/?q=gangnam")))).toBe(
      "/search?q=gangnam",
    );
  });

  it("장소가 있으면 장소 경로로 옮기고 검색어는 쿼리로 남긴다", () => {
    expect(pathAndSearch(toPublicMapUrl(at("/?place=9")))).toBe("/places/9");
    expect(pathAndSearch(toPublicMapUrl(at("/?q=gangnam&place=9")))).toBe(
      "/places/9?q=gangnam",
    );
  });

  it("상세가 장소보다 깊어 경로가 되고 장소는 쿼리로 남는다", () => {
    expect(
      pathAndSearch(toPublicMapUrl(at("/?q=gangnam&place=9&locker=164"))),
    ).toBe("/lockers/164?q=gangnam&place=9");
  });

  it("홈이 아닌 경로는 locker 가 붙어 있어도 그대로 둔다", () => {
    expect(pathAndSearch(toPublicMapUrl(at("/settings?locker=164")))).toBe(
      "/settings?locker=164",
    );
  });
});

/**
 * 라우터는 들어온 주소를 안쪽으로 옮겼다가 나갈 때 다시 바깥으로 옮긴다. 둘이 같은
 * 주소로 돌아오지 않으면 서버가 요청 주소와 다른 주소를 내야 한다고 보고 한 번 더
 * 이동시키고, 브라우저 주소창도 사용자가 연 것과 달라진다.
 */
describe("공개 주소의 왕복", () => {
  const PUBLIC_PATHS = [
    encoded("164-강남역-4번-출구"),
    "/lockers/164",
    "/lockers/164-Gangnam-Station",
    "/lockers/164?q=gangnam",
    "/lockers/164?q=gangnam&place=9",
    `${encoded("515-新宿-ロッカー")}?detailSnap=full`,
    "/search?q=gangnam",
    `/search?q=${encodeURIComponent("강남")}`,
    "/places/9",
    "/places/9?q=gangnam",
  ];

  it.each(PUBLIC_PATHS)("%s 는 같은 주소로 돌아온다", (path) => {
    const roundTrip = toPublicMapUrl(toInternalMapUrl(at(path)));

    expect(pathAndSearch(roundTrip)).toBe(path);
  });
});

/**
 * 구 주소의 301 목적지와 라우터가 내보내는 주소가 같아야 한다.
 *
 * 다르면 리다이렉트로 도착한 주소를 라우터가 다시 고쳐 써서, 한 번의 이동이 두 번이
 * 된다. 슬러그를 경로로 옮기는 판단이 두 곳에 있으므로 성질로 고정한다.
 */
describe("구 주소 리다이렉트와 라우터 주소의 일치", () => {
  const RAW_LOCKER_VALUES = [
    "164",
    "164-강남역",
    "164-Gangnam-Station",
    "164-a/b",
    "164 강남",
    "0164",
    "abc",
  ];

  it.each(RAW_LOCKER_VALUES)("locker=%s 를 두 쪽이 같게 다룬다", (raw) => {
    const legacy = at(`/?locker=${encodeURIComponent(raw)}&q=gangnam`);
    const routed = toPublicMapUrl(legacy);
    // 라우터가 상세 경로로 옮기지 않은 주소는 상세가 아니다. 그때는 리다이렉트도
    // 없어야 한다. (검색어만 남은 주소는 라우터가 `/search` 로 정리한다.)
    const expected = routed.pathname.startsWith("/lockers/")
      ? pathAndSearch(routed)
      : null;

    expect(resolveLegacyLockerPath(legacy)).toBe(expected);
  });
});
