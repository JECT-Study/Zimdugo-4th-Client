import { describe, expect, it } from "vitest";
import {
  planBackMapScreenNavigation,
  planForwardMapScreenNavigation,
  readMapScreenParams,
  toHomeMapScreenSearch,
  toLandingMapScreenSearch,
  toMapScreenKey,
  toParentMapScreenSearch,
} from "./map-screen-history";

const keyOf = (search: Record<string, unknown>) =>
  toMapScreenKey(readMapScreenParams(search));

describe("readMapScreenParams", () => {
  it("검색어·장소·보관함을 화면 값으로 읽는다", () => {
    expect(
      readMapScreenParams({ q: "강남", place: 9, locker: "164-강남" }),
    ).toEqual({ searchQuery: "강남", placeId: 9, lockerId: 164 });
  });

  it("처리 전의 앱 안 딥링크도 상세로 읽는다", () => {
    expect(readMapScreenParams({ openLockerId: 164 }).lockerId).toBe(164);
  });

  it("화면과 무관한 값은 읽지 않는다", () => {
    expect(readMapScreenParams({ detailSnap: "full" })).toEqual({
      searchQuery: undefined,
      placeId: undefined,
      lockerId: undefined,
    });
  });
});

describe("toMapScreenKey", () => {
  it("슬러그의 이름이 달라도 같은 보관함이면 같은 화면이다", () => {
    expect(keyOf({ locker: "164" })).toBe(keyOf({ locker: "164-강남역" }));
  });
});

describe("toParentMapScreenSearch", () => {
  it("상세는 상세 값만 걷어 아래 목록을 남긴다", () => {
    expect(
      toParentMapScreenSearch({
        q: "강남",
        place: 9,
        locker: "164",
        detailSnap: "full",
        focusLat: 1,
        focusLng: 2,
      }),
    ).toEqual({ q: "강남", place: 9 });
  });

  it("검색에서 연 장소 목록은 장소만 걷는다", () => {
    expect(toParentMapScreenSearch({ q: "강남역", place: 9 })).toEqual({
      q: "강남역",
    });
  });

  it("검색 결과와 지도 장소 목록은 홈으로 간다", () => {
    expect(toParentMapScreenSearch({ q: "강남" })).toEqual({});
    expect(toParentMapScreenSearch({ place: 9 })).toEqual({});
  });
});

describe("toHomeMapScreenSearch", () => {
  it("화면을 정하는 값을 모두 걷는다", () => {
    expect(
      toHomeMapScreenSearch({ q: "강남", place: 9, locker: "164", x: 1 }),
    ).toEqual({ x: 1 });
  });
});

describe("toLandingMapScreenSearch", () => {
  it("링크로 바로 들어온 상세에서는 검색어를 걷어 낸다", () => {
    expect(
      toLandingMapScreenSearch(
        { q: "강남역", locker: "164-강남", detailSnap: "full" },
        {},
      ),
    ).toEqual({ locker: "164-강남", detailSnap: "full" });
  });

  it("링크로 바로 들어온 장소 목록에서는 검색어만 걷고 장소는 남긴다", () => {
    expect(toLandingMapScreenSearch({ q: "강남역", place: 900 }, {})).toEqual({
      place: 900,
    });
  });

  it("앱 안에서 연 상세는 검색어를 남긴다", () => {
    const search = { q: "강남역", locker: "164-강남" };
    expect(
      toLandingMapScreenSearch(search, {
        mapBackTo: keyOf({ q: "강남역" }),
        mapStackDepth: 1,
      }),
    ).toBe(search);
  });

  it("검색 결과는 링크로 들어와도 검색어를 남긴다", () => {
    const search = { q: "강남역" };
    expect(toLandingMapScreenSearch(search, {})).toBe(search);
  });

  it("검색어가 없으면 그대로 둔다", () => {
    const search = { locker: "164-강남" };
    expect(toLandingMapScreenSearch(search, {})).toBe(search);
  });
});

describe("planForwardMapScreenNavigation", () => {
  it("더 깊은 화면이면 칸을 만들고 떠나온 화면을 적는다", () => {
    expect(
      planForwardMapScreenNavigation({}, { q: "강남" }, { mapStackDepth: 0 }),
    ).toEqual({
      replace: false,
      state: { mapBackTo: keyOf({}), mapStackDepth: 1 },
    });
  });

  it("처음 들어온 칸은 깊이 0 으로 본다", () => {
    expect(
      planForwardMapScreenNavigation({}, { locker: "164" }, {}).state
        .mapStackDepth,
    ).toBe(1);
  });

  it("형제 화면으로 옮기면 칸을 바꾸고 표시를 그대로 둔다", () => {
    const state = { mapBackTo: keyOf({ q: "강남" }), mapStackDepth: 2 };

    expect(
      planForwardMapScreenNavigation(
        { q: "강남", locker: "164" },
        { q: "강남", locker: "165" },
        state,
      ),
    ).toEqual({ replace: true, state });
  });
});

describe("planBackMapScreenNavigation", () => {
  it("떠나온 화면이 부모면 히스토리를 되감는다", () => {
    expect(
      planBackMapScreenNavigation(
        { q: "강남", locker: "164" },
        { mapBackTo: keyOf({ q: "강남" }), mapStackDepth: 2 },
      ),
    ).toEqual({ kind: "history-back" });
  });

  it("링크로 바로 들어온 칸은 부모 화면으로 바꾼다", () => {
    expect(
      planBackMapScreenNavigation({ q: "강남", locker: "164" }, {}),
    ).toEqual({ kind: "replace", search: { q: "강남" } });
  });

  it("장소를 고르며 검색어가 바뀌었어도 떠나온 검색 결과로 되감는다", () => {
    // 검색 결과(q=강남)에서 자동완성으로 장소를 골랐다. 검색어는 장소 이름이 됐다.
    expect(
      planBackMapScreenNavigation(
        { q: "강남역 1번 출구", place: 9 },
        { mapBackTo: keyOf({ q: "강남" }), mapStackDepth: 2 },
      ),
    ).toEqual({ kind: "history-back" });
  });

  it("떠나온 화면이 다른 보관함이면 되감지 않는다", () => {
    expect(
      planBackMapScreenNavigation(
        { q: "강남", locker: "164" },
        { mapBackTo: keyOf({ q: "강남", locker: "165" }), mapStackDepth: 2 },
      ),
    ).toEqual({ kind: "replace", search: { q: "강남" } });
  });

  it("떠나온 화면이 다른 장소면 되감지 않는다", () => {
    expect(
      planBackMapScreenNavigation(
        { place: 9, locker: "164" },
        { mapBackTo: keyOf({ place: 8 }), mapStackDepth: 1 },
      ),
    ).toEqual({ kind: "replace", search: { place: 9 } });
  });

  it("여러 단계를 한 번에 건너 왔으면 되감지 않고 부모로 바꾼다", () => {
    // 홈에서 자동완성으로 바로 상세를 열었다. 되감으면 검색 결과를 건너뛰고 홈이 된다.
    expect(
      planBackMapScreenNavigation(
        { q: "강남", locker: "164" },
        { mapBackTo: keyOf({}), mapStackDepth: 1 },
      ),
    ).toEqual({ kind: "replace", search: { q: "강남" } });
  });
});
