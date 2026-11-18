import { describe, expect, it } from "vitest";
import { resolveLegacyLockerPath } from "#/shared/lib/legacy-locker-url";
import {
  readMapScreenSearch,
  toMapScreenPathname,
  toMapScreenRoute,
} from "#/shared/lib/map-path-url";
import {
  parseSearchString,
  stringifySearchParams,
} from "#/shared/lib/search-serialization";

/** `/lockers/164?q=강남` 같은 주소를 위치(경로·쿼리)로 쪼개 화면 값을 읽는다. */
const read = (href: string) => {
  const url = new URL(href, "https://zimdugo.com");
  return readMapScreenSearch({
    pathname: url.pathname,
    search: parseSearchString(url.search),
  });
};

/** 화면 값이 사는 라우트를 주소 문자열로 적는다. */
const hrefOf = (search: Record<string, unknown>) => {
  const route = toMapScreenRoute(search);
  return `${toMapScreenPathname(route)}${stringifySearchParams(route.search)}`;
};

const encoded = (slug: string) => `/lockers/${encodeURIComponent(slug)}`;

describe("readMapScreenSearch", () => {
  it("보관함 경로를 화면 값의 locker 로 읽는다", () => {
    expect(read(encoded("164-강남역-4번-출구"))).toEqual({
      locker: "164-강남역-4번-출구",
    });
  });

  it("경로에 붙은 나머지 검색 상태를 그대로 남긴다", () => {
    expect(read("/lockers/164?q=강남&detailSnap=full&place=9")).toEqual({
      q: "강남",
      detailSnap: "full",
      place: 9,
      locker: "164",
    });
  });

  it("경로와 쿼리가 다른 보관함을 가리키면 경로를 따른다", () => {
    expect(read("/lockers/164?locker=999").locker).toBe("164");
  });

  it("검색 경로는 검색어만 남긴다", () => {
    expect(read("/search?q=강남")).toEqual({ q: "강남" });
  });

  it("장소 경로는 화면 값의 place 로 읽는다", () => {
    expect(read("/places/9?q=강남")).toEqual({ q: "강남", place: 9 });
  });

  it("경로가 정하는 화면과 어긋나는 쿼리는 버린다", () => {
    // openLockerId 가 남으면 화면 계산이 상세로 보고, 장소 목록 주소가 상세를 연다.
    expect(read("/places/9?locker=164&openLockerId=164")).toEqual({ place: 9 });
    expect(read("/search?q=a&place=9&locker=164&openLockerId=164")).toEqual({
      q: "a",
    });
  });

  it("경로의 고정 부분은 라우터처럼 대소문자를 가리지 않고 슬러그는 보존한다", () => {
    expect(read("/PLACES/9")).toEqual({ place: 9 });
    expect(read("/Lockers/164-Gangnam")).toEqual({ locker: "164-Gangnam" });
    expect(read("/SEARCH?q=a")).toEqual({ q: "a" });
  });

  it("인정하지 않는 보관함·장소 값은 화면 값으로 읽지 않는다", () => {
    expect(read("/lockers/abc")).toEqual({});
    expect(read("/places/1.5")).toEqual({});
  });

  it("예전 searchPlaceId 주소를 장소로 읽는다", () => {
    expect(read("/?q=강남&searchPlaceId=9")).toEqual({ q: "강남", place: 9 });
  });

  it("지도 화면이 아닌 경로의 쿼리는 그대로 둔다", () => {
    expect(read("/settings?locker=164")).toEqual({ locker: 164 });
  });
});

describe("toMapScreenRoute", () => {
  it("보관함이 있으면 상세 경로가 되고 나머지는 쿼리로 남는다", () => {
    expect(toMapScreenRoute({ q: "강남", place: 9, locker: "164" })).toEqual({
      to: "/lockers/$slug",
      params: { slug: "164" },
      search: { q: "강남", place: 9 },
    });
  });

  it("장소가 있으면 장소 경로가 된다", () => {
    expect(toMapScreenRoute({ q: "강남", place: 9 })).toEqual({
      to: "/places/$placeId",
      params: { placeId: "9" },
      search: { q: "강남" },
    });
  });

  it("검색어만 있으면 검색 경로가 된다", () => {
    expect(toMapScreenRoute({ q: "강남" })).toEqual({
      to: "/search",
      params: {},
      search: { q: "강남" },
    });
  });

  it("화면 값이 없으면 홈이다", () => {
    expect(toMapScreenRoute({ detailSnap: "full" }).to).toBe("/");
  });

  it("경로에 위험한 슬러그는 이름을 버리고 id 만 남긴다", () => {
    expect(toMapScreenRoute({ locker: "164-a/b" }).params).toEqual({
      slug: "164",
    });
  });
});

/**
 * 화면은 위치를 화면 값으로 읽고, 이동할 때 화면 값을 다시 라우트로 바꾼다. 둘이
 * 같은 주소로 돌아오지 않으면 같은 화면을 다듬기만 해도 주소가 바뀐다.
 */
describe("주소의 왕복", () => {
  const PATHS = [
    encoded("164-강남역-4번-출구"),
    "/lockers/164",
    "/lockers/164?q=gangnam",
    "/lockers/164?q=gangnam&place=9",
    `${encoded("515-新宿-ロッカー")}?detailSnap=full`,
    "/search?q=gangnam",
    `/search?q=${encodeURIComponent("강남")}`,
    "/places/9",
    "/places/9?q=gangnam",
    "/",
  ];

  it.each(PATHS)("%s 는 같은 주소로 돌아온다", (path) => {
    expect(hrefOf(read(path))).toBe(path);
  });
});

/**
 * 구 주소의 301 목적지와 화면이 그 주소에서 머무는 라우트가 같아야 한다.
 *
 * 다르면 리다이렉트로 도착한 주소를 홈 라우트나 상세 라우트가 다시 옮겨, 한 번의
 * 이동이 두 번이 된다. 슬러그를 경로로 옮기는 판단이 두 곳에 있으므로 성질로 고정한다.
 */
describe("구 주소 리다이렉트와 라우트의 일치", () => {
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
    const legacyHref = `/?locker=${encodeURIComponent(raw)}&q=gangnam`;
    const routed = hrefOf(read(legacyHref));
    // 상세 경로로 가지 않는 값은 상세가 아니다. 그때는 리다이렉트도 없어야 한다.
    const expected = routed.startsWith("/lockers/") ? routed : null;

    expect(
      resolveLegacyLockerPath(new URL(legacyHref, "https://zimdugo.com")),
    ).toBe(expected);
  });
});
