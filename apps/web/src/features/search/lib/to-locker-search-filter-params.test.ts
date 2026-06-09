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
  sizeActive: true,
  placeTypeActive: true,
  selectedSizes: ["S", "L"],
  indoorOutdoorState: ["indoor", "outdoor"],
  placeTypeState: ["museum", "subway"],
  ...overrides,
});

describe("toLockerSearchFilterParams", () => {
  it("keyword 검색 API용 복수 필터 파라미터를 만든다", () => {
    expect(toLockerSearchFilterParams(createFilters())).toEqual({
      sizeTypes: ["SMALL", "LARGE"],
      indoorOutdoorTypes: ["INDOOR", "OUTDOOR"],
      lockerTypes: ["MUSEUM", "SUBWAY_STATION"],
    });
  });
});

describe("toPlaceLockersFilterParams", () => {
  it("place lockers API에도 복수 필터 파라미터를 전달한다", () => {
    expect(toPlaceLockersFilterParams(createFilters())).toEqual({
      sizeTypes: ["SMALL", "LARGE"],
      indoorOutdoorTypes: ["INDOOR", "OUTDOOR"],
      lockerTypes: ["MUSEUM", "SUBWAY_STATION"],
    });
  });

  it("알 수 없는 필터 키는 API 파라미터로 보내지 않는다", () => {
    expect(
      toPlaceLockersFilterParams(
        createFilters({
          indoorOutdoorState: ["unknown"],
          placeTypeState: ["invalid"],
        }),
      ),
    ).toEqual({
      sizeTypes: ["SMALL", "LARGE"],
    });
  });
});
