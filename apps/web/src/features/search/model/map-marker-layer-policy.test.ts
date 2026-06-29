import { describe, expect, it } from "vitest";

import { resolveMapMarkerLayer } from "./map-marker-layer-policy";

describe("resolveMapMarkerLayer", () => {
  it("shows idle markers only in the idle home state", () => {
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

  it("shows search markers while search results are visible", () => {
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

  it("uses place markers for map place lists", () => {
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

  it("keeps place markers when map detail can return to a place list", () => {
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

  it("keeps idle markers when a home map pin is selected", () => {
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

  it("falls back to the selected detail marker without a selected map pin", () => {
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

  it("returns null when no marker layer should be visible", () => {
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

  it("hides marker layers while the search overlay is open", () => {
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

  it("does not show markers in address list mode", () => {
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
