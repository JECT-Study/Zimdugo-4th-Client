import { describe, expect, it } from "vitest";
import type { SearchFilterAppliedState } from "#/composites/search/SearchFilterBottomSheet";
import {
  toLockerSearchFilterParams,
  toPlaceLockersFilterParams,
} from "./to-locker-search-filter-params";

const createFilters = (
  overrides: Partial<SearchFilterAppliedState> = {},
): SearchFilterAppliedState => ({
  regionActive: true,
  sizePriceActive: true,
  placeTypeActive: true,
  selectedSizes: ["S", "L"],
  priceType: "paid",
  minPrice: "1,000",
  maxPrice: "2,000",
  indoorOutdoorState: ["indoor", "outdoor"],
  placeTypeState: ["subway"],
  ...overrides,
});

describe("toLockerSearchFilterParams", () => {
  it("keyword 검색 API용 복수 필터 파라미터를 만든다", () => {
    expect(toLockerSearchFilterParams(createFilters())).toEqual({
      sizeTypes: ["SMALL", "BIG"],
      minPrice: 1000,
      maxPrice: 2000,
      indoorOutdoorTypes: ["INDOOR", "OUTDOOR"],
      lockerTypes: ["SUBWAY_STATION"],
    });
  });
});

describe("toPlaceLockersFilterParams", () => {
  it("place lockers API 스펙에 맞는 단수 필터 파라미터만 만든다", () => {
    expect(toPlaceLockersFilterParams(createFilters())).toEqual({
      sizeTypes: ["SMALL", "BIG"],
      indoorOutdoorType: "INDOOR",
      lockerType: "SUBWAY_STATION",
    });
  });
});
