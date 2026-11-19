import { setLanguageTag } from "@repo/i18n";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createDefaultSearchFilters,
  type SearchFilterAppliedState,
} from "#/composites/search/SearchFilterBottomSheet";
import {
  removeSearchFilterBadge,
  toSearchFilterBadges,
} from "./search-filter-badges";

const filtersOf = (
  partial: Partial<SearchFilterAppliedState>,
): SearchFilterAppliedState => {
  const base = { ...createDefaultSearchFilters(), ...partial };

  return {
    ...base,
    sizeActive: base.selectedSizes.length > 0,
    regionActive: base.indoorOutdoorState.length > 0,
    placeTypeActive: base.placeTypeState.length > 0,
  };
};

beforeEach(() => {
  setLanguageTag("ko");
});

describe("toSearchFilterBadges", () => {
  it("고른 순서와 상관없이 필터 화면의 순서로 늘어놓는다", () => {
    const badges = toSearchFilterBadges(
      filtersOf({
        selectedSizes: ["L", "S"],
        indoorOutdoorState: ["outdoor"],
        placeTypeState: ["other", "subway"],
      }),
    );

    expect(badges.map((badge) => badge.label)).toEqual([
      "소형",
      "대형",
      "실외",
      "지하철역",
      "기타",
    ]);
  });

  it("고른 필터가 없으면 뱃지도 없다", () => {
    expect(toSearchFilterBadges(createDefaultSearchFilters())).toEqual([]);
  });
});

describe("removeSearchFilterBadge", () => {
  it("뱃지 하나만 빼고 나머지 묶음은 그대로 둔다", () => {
    const filters = filtersOf({
      selectedSizes: ["S", "M"],
      placeTypeState: ["subway"],
    });

    expect(
      removeSearchFilterBadge(filters, { group: "size", value: "S" }),
    ).toEqual(filtersOf({ selectedSizes: ["M"], placeTypeState: ["subway"] }));
  });

  it("묶음의 마지막 뱃지를 빼면 그 묶음의 활성 표시도 끈다", () => {
    const next = removeSearchFilterBadge(
      filtersOf({ indoorOutdoorState: ["indoor"], selectedSizes: ["S"] }),
      { group: "indoorOutdoor", value: "indoor" },
    );

    expect(next.regionActive).toBe(false);
    expect(next.indoorOutdoorState).toEqual([]);
    expect(next.sizeActive).toBe(true);
  });
});
