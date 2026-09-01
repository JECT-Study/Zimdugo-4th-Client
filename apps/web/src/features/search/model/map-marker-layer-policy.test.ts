import { describe, expect, it } from "vitest";

import { resolveMapMarkerLayer } from "./map-marker-layer-policy";

describe("resolveMapMarkerLayer", () => {
  it("가만히 있는 홈에서만 기본 마커를 보인다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "idle",
        sheetMode: "idle",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: null,
        hasSelectedMapPin: false,
        selectedMapDetailPinCount: 0,
      }),
    ).toBe("idle");
  });

  it("검색 결과가 떠 있는 동안 검색 마커를 보인다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "search",
        sheetMode: "list",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: null,
        hasSelectedMapPin: false,
        selectedMapDetailPinCount: 0,
      }),
    ).toBe("search");
  });

  it("지도 장소 목록에는 장소 마커를 쓴다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "map",
        sheetMode: "list",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: null,
        hasSelectedMapPin: false,
        selectedMapDetailPinCount: 0,
      }),
    ).toBe("mapPlace");
  });

  it("상세에서 장소 목록으로 돌아갈 수 있으면 장소 마커를 남긴다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "map",
        sheetMode: "detail",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: "placeList",
        hasSelectedMapPin: true,
        selectedMapDetailPinCount: 1,
      }),
    ).toBe("mapPlace");
  });

  it("홈에서 핀을 골라도 기본 마커를 남긴다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "map",
        sheetMode: "detail",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: "idle",
        hasSelectedMapPin: true,
        selectedMapDetailPinCount: 1,
      }),
    ).toBe("idle");
  });

  it("고른 핀이 없으면 선택된 상세 마커로 물러선다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "map",
        sheetMode: "detail",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: "idle",
        hasSelectedMapPin: false,
        selectedMapDetailPinCount: 1,
      }),
    ).toBe("selectedMapDetail");
  });

  it("보일 마커 레이어가 없으면 null 을 준다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "map",
        sheetMode: "detail",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: "idle",
        hasSelectedMapPin: false,
        selectedMapDetailPinCount: 0,
      }),
    ).toBeNull();
  });

  it("검색 오버레이가 떠 있는 동안 마커 레이어를 감춘다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "idle",
        sheetMode: "idle",
        isSearchOpen: true,
        searchDetailBack: null,
        mapDetailBack: null,
        hasSelectedMapPin: false,
        selectedMapDetailPinCount: 0,
      }),
    ).toBeNull();
  });

  it("주소 목록 상태에서는 마커를 보이지 않는다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "idle",
        sheetMode: "addressList",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: null,
        hasSelectedMapPin: false,
        selectedMapDetailPinCount: 0,
      }),
    ).toBeNull();
  });
});
