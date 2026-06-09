import { describe, expect, it } from "vitest";

import { resolveMapMarkerLayer } from "./map-marker-layer-policy";

describe("resolveMapMarkerLayer", () => {
  it("shows idle markers only on the idle map", () => {
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

  it("shows search markers while search results are visible", () => {
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

  it("keeps place list markers in map context", () => {
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

  it("keeps place markers when map detail can return to the place list", () => {
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

  it("shows the selected map detail pin for idle-pin detail", () => {
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

  it("returns null when no layer should be visible", () => {
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

  it("hides every marker layer while the search overlay is open", () => {
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

  it("does not show markers in address list mode", () => {
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
