import { describe, expect, it } from "vitest";
import {
  createKeywordDetailBackTarget,
  createPlaceDetailBackTarget,
  createSearchDetailBackTarget,
  isRenderableSheetSession,
  resolveActivePlaceId,
  resolveOverlayReturnContext,
  resolveSearchBarBackAction,
  shouldFetchKeywordSearch,
  shouldFetchPlaceLockers,
  shouldRestoreSearchListFromUrl,
  shouldShowIdleMarkers,
  shouldShowSearchListLoading,
  shouldShowSearchMarkers,
} from "./sheet-session";

describe("sheet-session v2", () => {
  it("search keyword 리스트에서 place id를 해석하지 않는다", () => {
    expect(
      resolveActivePlaceId({
        context: "search",
        listKind: "keyword",
        searchPlaceId: 158,
        mapPlaceId: null,
      }),
    ).toBeNull();
  });

  it("map context에서 mapPlaceId를 해석한다", () => {
    expect(
      resolveActivePlaceId({
        context: "map",
        listKind: null,
        searchPlaceId: null,
        mapPlaceId: 42,
      }),
    ).toBe(42);
  });

  it("search detail back target을 생성한다", () => {
    expect(createPlaceDetailBackTarget(158)).toEqual({
      listKind: "place",
      placeId: 158,
    });
    expect(createKeywordDetailBackTarget()).toEqual({
      listKind: "keyword",
      placeId: null,
    });
    expect(
      createSearchDetailBackTarget({
        listKind: "place",
        placeId: 9,
      }),
    ).toEqual({
      listKind: "place",
      placeId: 9,
    });
  });

  it("keyword 검색 fetch 조건을 판별한다", () => {
    expect(
      shouldFetchKeywordSearch({
        context: "search",
        listKind: "keyword",
        sheetMode: "list",
        searchDetailBack: null,
        searchQuery: "강남",
      }),
    ).toBe(true);

    expect(
      shouldFetchKeywordSearch({
        context: "map",
        listKind: "keyword",
        sheetMode: "list",
        searchDetailBack: null,
        searchQuery: "강남",
      }),
    ).toBe(false);

    expect(
      shouldFetchKeywordSearch({
        context: "search",
        listKind: "place",
        sheetMode: "list",
        searchDetailBack: null,
        searchQuery: "강남역",
      }),
    ).toBe(false);

    expect(
      shouldFetchKeywordSearch({
        context: "search",
        listKind: "keyword",
        sheetMode: "detail",
        searchDetailBack: createKeywordDetailBackTarget(),
        searchQuery: "강남",
      }),
    ).toBe(true);

    expect(
      shouldFetchKeywordSearch({
        context: "search",
        listKind: "keyword",
        sheetMode: "list",
        searchDetailBack: null,
        searchQuery: "ㄱㄴ",
      }),
    ).toBe(false);

    expect(
      shouldFetchKeywordSearch({
        context: "search",
        listKind: "keyword",
        sheetMode: "list",
        searchDetailBack: null,
        searchQuery: "강ㄴ남",
      }),
    ).toBe(true);
  });

  it("place lockers fetch 조건을 판별한다", () => {
    expect(
      shouldFetchPlaceLockers({
        context: "map",
        listKind: null,
        sheetMode: "list",
        searchDetailBack: null,
        mapDetailBack: null,
        activePlaceId: 42,
      }),
    ).toBe(true);

    expect(
      shouldFetchPlaceLockers({
        context: "search",
        listKind: "place",
        sheetMode: "detail",
        searchDetailBack: createPlaceDetailBackTarget(158),
        mapDetailBack: null,
        activePlaceId: 158,
      }),
    ).toBe(true);
  });

  it("Overlay 복귀 context를 해석한다", () => {
    expect(resolveOverlayReturnContext("search")).toBe("search");
    expect(resolveOverlayReturnContext("idle")).toBe("idle");
    expect(resolveOverlayReturnContext("map")).toBe("idle");
  });

  it("마커 표시 조건을 판별한다", () => {
    expect(shouldShowIdleMarkers({ context: "idle", sheetMode: "idle" })).toBe(
      true,
    );
    expect(shouldShowIdleMarkers({ context: "map", sheetMode: "list" })).toBe(
      false,
    );
    expect(
      shouldShowSearchMarkers({
        context: "search",
        sheetMode: "list",
        searchDetailBack: null,
      }),
    ).toBe(true);
    expect(
      shouldShowSearchMarkers({
        context: "search",
        sheetMode: "detail",
        searchDetailBack: null,
      }),
    ).toBe(false);
    expect(
      shouldShowSearchMarkers({
        context: "map",
        sheetMode: "list",
        searchDetailBack: null,
      }),
    ).toBe(false);
    expect(
      shouldShowSearchMarkers({
        context: "search",
        sheetMode: "detail",
        searchDetailBack: createKeywordDetailBackTarget(),
      }),
    ).toBe(true);
  });

  it("fetch가 비활성화된 검색 리스트는 로딩 스켈레톤을 보여주지 않는다", () => {
    expect(
      shouldShowSearchListLoading({
        isPlaceListScope: false,
        shouldFetchKeywordList: false,
        shouldFetchPlaceList: false,
        isPlaceLockersPending: true,
        isKeywordSearchPending: true,
      }),
    ).toBe(false);

    expect(
      shouldShowSearchListLoading({
        isPlaceListScope: true,
        shouldFetchKeywordList: false,
        shouldFetchPlaceList: true,
        isPlaceLockersPending: true,
        isKeywordSearchPending: false,
      }),
    ).toBe(true);
  });

  it("렌더 불가 시트 세션을 판별한다", () => {
    expect(
      isRenderableSheetSession({
        sheetMode: "detail",
        selectedLockerDetail: { lockerId: 1 },
        shouldFetchKeywordList: false,
        shouldFetchPlaceList: false,
      }),
    ).toBe(true);

    expect(
      isRenderableSheetSession({
        sheetMode: "detail",
        selectedLockerDetail: null,
        shouldFetchKeywordList: false,
        shouldFetchPlaceList: false,
      }),
    ).toBe(false);

    expect(
      isRenderableSheetSession({
        sheetMode: "list",
        selectedLockerDetail: null,
        shouldFetchKeywordList: false,
        shouldFetchPlaceList: false,
      }),
    ).toBe(false);
  });

  it("map detail에서 place lockers fetch를 유지한다", () => {
    expect(
      shouldFetchPlaceLockers({
        context: "map",
        listKind: null,
        sheetMode: "detail",
        searchDetailBack: null,
        mapDetailBack: "placeList",
        activePlaceId: 42,
      }),
    ).toBe(true);

    expect(
      shouldFetchPlaceLockers({
        context: "map",
        listKind: null,
        sheetMode: "detail",
        searchDetailBack: null,
        mapDetailBack: "idle",
        activePlaceId: 42,
      }),
    ).toBe(false);
  });

  it("검색바 뒤로가기 액션을 검색 시트 상태별로 판정한다", () => {
    expect(
      resolveSearchBarBackAction({
        context: "map",
        listKind: null,
        sheetMode: "list",
        searchDetailBack: null,
      }),
    ).toBe("mapPlaceList");
    expect(
      resolveSearchBarBackAction({
        context: "map",
        listKind: null,
        sheetMode: "detail",
        searchDetailBack: null,
      }),
    ).toBe("mapPlaceList");
    expect(
      resolveSearchBarBackAction({
        context: "search",
        listKind: "place",
        sheetMode: "list",
        searchDetailBack: null,
      }),
    ).toBe("searchPlaceList");
    expect(
      resolveSearchBarBackAction({
        context: "search",
        listKind: "keyword",
        sheetMode: "list",
        searchDetailBack: null,
      }),
    ).toBe("searchKeywordList");
    expect(
      resolveSearchBarBackAction({
        context: "search",
        listKind: "keyword",
        sheetMode: "filter",
        searchDetailBack: null,
      }),
    ).toBe("searchFilter");
    expect(
      resolveSearchBarBackAction({
        context: "search",
        listKind: "keyword",
        sheetMode: "detail",
        searchDetailBack: createKeywordDetailBackTarget(),
      }),
    ).toBe("searchDetail");
    expect(
      resolveSearchBarBackAction({
        context: "search",
        listKind: "keyword",
        sheetMode: "detail",
        searchDetailBack: null,
      }),
    ).toBeNull();
  });

  it("restores search list state when URL has search params without locker detail", () => {
    expect(
      shouldRestoreSearchListFromUrl({
        hasExplicitLockerEntry: false,
        searchQueryFromUrl: "coex",
        searchPlaceIdFromUrl: undefined,
      }),
    ).toBe(true);

    expect(
      shouldRestoreSearchListFromUrl({
        hasExplicitLockerEntry: false,
        searchQueryFromUrl: undefined,
        searchPlaceIdFromUrl: 7,
      }),
    ).toBe(true);

    expect(
      shouldRestoreSearchListFromUrl({
        hasExplicitLockerEntry: true,
        searchQueryFromUrl: "coex",
        searchPlaceIdFromUrl: undefined,
      }),
    ).toBe(false);
  });
});
