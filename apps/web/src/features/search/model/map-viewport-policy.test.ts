import { describe, expect, it } from "vitest";

import {
  DETAIL_HALF_BOTTOM_INSET_PX,
  MIN_MAP_BOUNDS_BOTTOM_PADDING_PX,
  getDetailFocusBottomInsetPx,
  getSearchBoundsBottomPadding,
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
