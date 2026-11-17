import { describe, expect, it } from "vitest";
import {
  getMapScreenDepth,
  type MapScreenParams,
  resolveMapScreen,
  resolveMapScreenNavigation,
  resolveParentMapScreen,
} from "./map-screen";

const screen = (params: Partial<MapScreenParams>): MapScreenParams => ({
  searchQuery: undefined,
  placeId: undefined,
  lockerId: undefined,
  ...params,
});

const HOME = screen({});
const KEYWORD_LIST = screen({ searchQuery: "강남" });
const SEARCH_PLACE_LIST = screen({ searchQuery: "강남역", placeId: 9 });
const MAP_PLACE_LIST = screen({ placeId: 9 });
const MAP_DETAIL = screen({ lockerId: 164 });
const MAP_PLACE_DETAIL = screen({ placeId: 9, lockerId: 164 });
const KEYWORD_DETAIL = screen({ searchQuery: "강남", lockerId: 164 });
const SEARCH_PLACE_DETAIL = screen({
  searchQuery: "강남역",
  placeId: 9,
  lockerId: 164,
});

describe("resolveMapScreen", () => {
  it("아무것도 없으면 홈이다", () => {
    expect(resolveMapScreen(HOME)).toMatchObject({
      target: "idle",
      context: "idle",
      listKind: null,
      lockerId: undefined,
    });
  });

  it("검색어만 있으면 검색 결과 목록이다", () => {
    expect(resolveMapScreen(KEYWORD_LIST)).toMatchObject({
      target: "list",
      context: "search",
      listKind: "keyword",
      searchPlaceId: null,
      mapPlaceId: null,
    });
  });

  it("검색어와 장소가 있으면 검색에서 연 장소 목록이다", () => {
    expect(resolveMapScreen(SEARCH_PLACE_LIST)).toMatchObject({
      target: "list",
      context: "search",
      listKind: "place",
      searchPlaceId: 9,
      mapPlaceId: null,
    });
  });

  it("검색어 없이 장소만 있으면 지도에서 연 장소 목록이다", () => {
    expect(resolveMapScreen(MAP_PLACE_LIST)).toMatchObject({
      target: "list",
      context: "map",
      listKind: null,
      searchPlaceId: null,
      mapPlaceId: 9,
    });
  });

  it("보관함만 있으면 홈 위에 연 상세다", () => {
    expect(resolveMapScreen(MAP_DETAIL)).toMatchObject({
      target: "detail",
      context: "map",
      lockerId: 164,
      mapDetailBack: "idle",
      searchDetailBack: null,
    });
  });

  it("지도 장소 목록 위의 상세는 그 목록으로 돌아간다", () => {
    expect(resolveMapScreen(MAP_PLACE_DETAIL)).toMatchObject({
      target: "detail",
      context: "map",
      mapPlaceId: 9,
      mapDetailBack: "placeList",
    });
  });

  it("검색 결과 위의 상세는 아래 깔린 목록을 기억한다", () => {
    expect(resolveMapScreen(KEYWORD_DETAIL)).toMatchObject({
      target: "detail",
      context: "search",
      searchDetailBack: { listKind: "keyword", placeId: null },
      mapDetailBack: null,
    });
    expect(resolveMapScreen(SEARCH_PLACE_DETAIL)).toMatchObject({
      target: "detail",
      context: "search",
      searchDetailBack: { listKind: "place", placeId: 9 },
    });
  });
});

describe("getMapScreenDepth", () => {
  it.each([
    ["홈", HOME, 0],
    ["검색 결과", KEYWORD_LIST, 1],
    ["지도 장소 목록", MAP_PLACE_LIST, 1],
    ["홈 위 상세", MAP_DETAIL, 1],
    ["검색 장소 목록", SEARCH_PLACE_LIST, 2],
    ["검색 결과 위 상세", KEYWORD_DETAIL, 2],
    ["지도 장소 목록 위 상세", MAP_PLACE_DETAIL, 2],
    ["검색 장소 목록 위 상세", SEARCH_PLACE_DETAIL, 3],
  ])("%s 의 깊이는 %#", (_name, params, depth) => {
    expect(getMapScreenDepth(params)).toBe(depth);
  });
});

/**
 * #215 가 그린 흐름이다.
 *
 *   /  ▸  /search?q=강남  ▸  /lockers/164
 *                         ▸  /places/900   ← 상세의 형제
 *
 * 들어가는 이동은 칸을 만들고, 형제로 옮기는 이동은 칸을 바꾼다.
 */
describe("resolveMapScreenNavigation", () => {
  it("홈에서 검색에 들어가면 칸을 만든다", () => {
    expect(resolveMapScreenNavigation(HOME, KEYWORD_LIST)).toBe("push");
  });

  it("검색 결과에서 상세를 열면 칸을 만든다", () => {
    expect(resolveMapScreenNavigation(KEYWORD_LIST, KEYWORD_DETAIL)).toBe(
      "push",
    );
  });

  it("홈에서 핀을 눌러 상세를 열면 칸을 만든다", () => {
    expect(resolveMapScreenNavigation(HOME, MAP_DETAIL)).toBe("push");
  });

  it("상세를 연 채 다른 보관함을 고르면 칸을 바꾼다", () => {
    expect(
      resolveMapScreenNavigation(MAP_DETAIL, screen({ lockerId: 165 })),
    ).toBe("replace");
  });

  it("상세에서 장소 목록으로 갈아타면 칸을 바꾼다", () => {
    expect(resolveMapScreenNavigation(KEYWORD_DETAIL, SEARCH_PLACE_LIST)).toBe(
      "replace",
    );
    expect(resolveMapScreenNavigation(MAP_DETAIL, MAP_PLACE_LIST)).toBe(
      "replace",
    );
  });

  it("검색 중에 검색어를 바꾸면 칸을 바꾼다", () => {
    expect(
      resolveMapScreenNavigation(KEYWORD_LIST, screen({ searchQuery: "홍대" })),
    ).toBe("replace");
  });

  it("검색 결과에서 장소 목록으로 들어가면 칸을 만든다", () => {
    expect(resolveMapScreenNavigation(KEYWORD_LIST, SEARCH_PLACE_LIST)).toBe(
      "push",
    );
  });
});

describe("resolveParentMapScreen", () => {
  it("상세는 아래 깔린 목록으로 간다", () => {
    expect(resolveParentMapScreen(KEYWORD_DETAIL)).toEqual(KEYWORD_LIST);
    expect(resolveParentMapScreen(SEARCH_PLACE_DETAIL)).toEqual(
      SEARCH_PLACE_LIST,
    );
    expect(resolveParentMapScreen(MAP_PLACE_DETAIL)).toEqual(MAP_PLACE_LIST);
  });

  it("홈 위 상세는 홈으로 간다", () => {
    expect(resolveParentMapScreen(MAP_DETAIL)).toEqual(HOME);
  });

  it("검색에서 연 장소 목록은 검색 결과로 간다", () => {
    expect(resolveParentMapScreen(SEARCH_PLACE_LIST)).toEqual(
      screen({ searchQuery: "강남역" }),
    );
  });

  it("검색 결과와 지도 장소 목록은 홈으로 간다", () => {
    expect(resolveParentMapScreen(KEYWORD_LIST)).toEqual(HOME);
    expect(resolveParentMapScreen(MAP_PLACE_LIST)).toEqual(HOME);
  });
});
