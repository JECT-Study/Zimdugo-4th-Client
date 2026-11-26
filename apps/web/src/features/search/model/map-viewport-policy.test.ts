import { describe, expect, it } from "vitest";

import {
  DETAIL_HALF_BOTTOM_INSET_PX,
  getDetailFocusBottomInsetPx,
  getSearchBoundsBottomPadding,
  hasListUnderDetail,
  isDetailOverListScreen,
  MIN_MAP_BOUNDS_BOTTOM_PADDING_PX,
  resolveDetailFocusInsets,
} from "./map-viewport-policy";

describe("map-viewport-policy", () => {
  it("상세 하프 시트 공통 inset을 반환한다", () => {
    expect(getDetailFocusBottomInsetPx()).toBe(DETAIL_HALF_BOTTOM_INSET_PX);
  });

  it("검색 리스트 하프 시트 높이를 bounds 하단 패딩으로 사용한다", () => {
    expect(
      getSearchBoundsBottomPadding({
        sheetMode: "list",
        windowHeight: 800,
      }),
    ).toBe(167);
  });

  it("짧은 뷰포트에서는 최소 하단 패딩을 유지한다", () => {
    expect(
      getSearchBoundsBottomPadding({
        sheetMode: "list",
        windowHeight: 360,
      }),
    ).toBe(MIN_MAP_BOUNDS_BOTTOM_PADDING_PX);
  });

  it("리스트 시트가 아니면 bounds 패딩을 덮어쓰지 않는다", () => {
    expect(
      getSearchBoundsBottomPadding({
        sheetMode: "filter",
        windowHeight: 800,
      }),
    ).toBeUndefined();
  });
});

describe("hasListUnderDetail", () => {
  it("목록 화면에서 여는 상세는 목록 위에 얹힌다", () => {
    expect(
      hasListUnderDetail({
        sheetMode: "list",
        searchDetailBack: null,
        mapDetailBack: null,
      }),
    ).toBe(true);
  });

  it("검색 결과나 장소 목록에서 연 상세는 목록이 깔려 있다", () => {
    expect(
      hasListUnderDetail({
        sheetMode: "detail",
        searchDetailBack: { listKind: "keyword", placeId: null },
        mapDetailBack: null,
      }),
    ).toBe(true);
    expect(
      hasListUnderDetail({
        sheetMode: "detail",
        searchDetailBack: null,
        mapDetailBack: "placeList",
      }),
    ).toBe(true);
  });

  it("홈이나 링크에서 연 상세는 아래에 목록이 없다", () => {
    expect(
      hasListUnderDetail({
        sheetMode: "detail",
        searchDetailBack: null,
        mapDetailBack: "idle",
      }),
    ).toBe(false);
    expect(
      hasListUnderDetail({
        sheetMode: "idle",
        searchDetailBack: null,
        mapDetailBack: null,
      }),
    ).toBe(false);
  });
});

describe("resolveDetailFocusInsets", () => {
  it("모바일은 하프 시트만큼 아래를 비운다", () => {
    expect(
      resolveDetailFocusInsets({
        isDesktopLayout: false,
        isDetailBesideList: true,
      }),
    ).toEqual({ bottomInsetPx: DETAIL_HALF_BOTTOM_INSET_PX });
  });

  it("데스크톱은 아래를 비우지 않고 왼쪽 카드 폭만큼 비운다", () => {
    expect(
      resolveDetailFocusInsets({
        isDesktopLayout: true,
        isDetailBesideList: false,
      }),
    ).toEqual({ bottomInsetPx: 0, leftInsetPx: 416 });
    expect(
      resolveDetailFocusInsets({
        isDesktopLayout: true,
        isDetailBesideList: true,
      }),
    ).toEqual({ bottomInsetPx: 0, leftInsetPx: 828 });
  });
});

describe("isDetailOverListScreen", () => {
  it("검색어나 장소가 남은 상세 주소는 목록 위의 상세다", () => {
    expect(
      isDetailOverListScreen({
        searchQuery: "강남역",
        placeId: undefined,
        lockerId: 164,
      }),
    ).toBe(true);
    expect(
      isDetailOverListScreen({
        searchQuery: undefined,
        placeId: 9,
        lockerId: 164,
      }),
    ).toBe(true);
  });

  it("보관함만 가리키는 주소나 목록 주소는 목록 위의 상세가 아니다", () => {
    expect(
      isDetailOverListScreen({
        searchQuery: undefined,
        placeId: undefined,
        lockerId: 164,
      }),
    ).toBe(false);
    expect(
      isDetailOverListScreen({
        searchQuery: "강남역",
        placeId: undefined,
        lockerId: undefined,
      }),
    ).toBe(false);
  });
});
