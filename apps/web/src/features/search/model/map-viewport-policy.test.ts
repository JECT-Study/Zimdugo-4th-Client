import { describe, expect, it } from "vitest";

import {
  DETAIL_HALF_BOTTOM_INSET_PX,
  MIN_MAP_BOUNDS_BOTTOM_PADDING_PX,
  getDetailFocusBottomInsetPx,
  getSearchBoundsBottomPadding,
} from "./map-viewport-policy";

describe("map-viewport-policy", () => {
  it("returns the shared detail half-sheet inset", () => {
    expect(getDetailFocusBottomInsetPx()).toBe(DETAIL_HALF_BOTTOM_INSET_PX);
  });

  it("uses the search list half-sheet height as bounds bottom padding", () => {
    expect(
      getSearchBoundsBottomPadding({
        sheetMode: "list",
        windowHeight: 800,
      }),
    ).toBe(493);
  });

  it("keeps a minimum bottom padding for short viewports", () => {
    expect(
      getSearchBoundsBottomPadding({
        sheetMode: "list",
        windowHeight: 360,
      }),
    ).toBe(MIN_MAP_BOUNDS_BOTTOM_PADDING_PX);
  });

  it("does not override bounds padding outside the list sheet", () => {
    expect(
      getSearchBoundsBottomPadding({
        sheetMode: "filter",
        windowHeight: 800,
      }),
    ).toBeUndefined();
  });
});
