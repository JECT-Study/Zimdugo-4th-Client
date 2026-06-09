import { describe, expect, it } from "vitest";

import { resolveMapMarkerLayer } from "./map-marker-layer-policy";

describe("resolveMapMarkerLayer", () => {
  it("idle 지도에서만 idle 마커를 표시한다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "idle",
        sheetMode: "idle",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: null,
        selectedMapDetailPinCount: 0,
      }),
    ).toBe("idle");
  });

  it("검색 결과가 보일 때 검색 마커를 표시한다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "search",
        sheetMode: "list",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: null,
        selectedMapDetailPinCount: 0,
      }),
    ).toBe("search");
  });

  it("map context 장소 리스트에서 장소 마커를 유지한다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "map",
        sheetMode: "list",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: null,
        selectedMapDetailPinCount: 0,
      }),
    ).toBe("mapPlace");
  });

  it("map 상세가 장소 리스트로 돌아갈 수 있으면 장소 마커를 유지한다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "map",
        sheetMode: "detail",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: "placeList",
        selectedMapDetailPinCount: 1,
      }),
    ).toBe("mapPlace");
  });

  it("idle 핀 상세에서는 선택된 map 상세 핀을 표시한다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "map",
        sheetMode: "detail",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: "idle",
        selectedMapDetailPinCount: 1,
      }),
    ).toBe("selectedMapDetail");
  });

  it("표시할 레이어가 없으면 null을 반환한다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "map",
        sheetMode: "detail",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: "idle",
        selectedMapDetailPinCount: 0,
      }),
    ).toBeNull();
  });

  it("검색 오버레이가 열려 있으면 모든 마커 레이어를 숨긴다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "idle",
        sheetMode: "idle",
        isSearchOpen: true,
        searchDetailBack: null,
        mapDetailBack: null,
        selectedMapDetailPinCount: 0,
      }),
    ).toBeNull();
  });

  it("주소 리스트 모드에서는 마커를 표시하지 않는다", () => {
    expect(
      resolveMapMarkerLayer({
        context: "idle",
        sheetMode: "addressList",
        isSearchOpen: false,
        searchDetailBack: null,
        mapDetailBack: null,
        selectedMapDetailPinCount: 0,
      }),
    ).toBeNull();
  });
});
