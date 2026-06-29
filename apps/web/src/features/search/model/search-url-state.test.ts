import { describe, expect, it } from "vitest";
import {
  readSearchFilterParams,
  readSearchPlaceIdParam,
  readSearchQueryParam,
  withSearchFilterParams,
  withSearchPlaceIdParam,
  withSearchQueryParam,
} from "./search-url-state";

describe("search-url-state", () => {
  it("reads a validated and trimmed URL q value", () => {
    expect(readSearchQueryParam(" 강남역 ")).toBe("강남역");
    expect(readSearchQueryParam("강남역")).toBe("강남역");
  });

  it("ignores q values that cannot be used as search queries", () => {
    expect(readSearchQueryParam("ㄱㄴ")).toBeUndefined();
    expect(readSearchQueryParam("!!!")).toBeUndefined();
    expect(readSearchQueryParam("   ")).toBeUndefined();
    expect(readSearchQueryParam(123)).toBeUndefined();
  });

  it("adds q to URL params while preserving detail params", () => {
    expect(
      withSearchQueryParam(
        {
          locker: "1",
          openLockerId: 2,
          detailSnap: "full",
          focusLat: 37.5,
          focusLng: 127,
        },
        " 강남 ",
      ),
    ).toEqual({
      locker: "1",
      openLockerId: 2,
      detailSnap: "full",
      focusLat: 37.5,
      focusLng: 127,
      q: "강남",
    });
  });

  it("removes only q when the search query is empty", () => {
    expect(
      withSearchQueryParam(
        {
          locker: "1",
          q: "강남",
        },
        "",
      ),
    ).toEqual({
      locker: "1",
    });
  });

  it("reads URL searchPlaceId as a positive integer", () => {
    expect(readSearchPlaceIdParam("123")).toBe(123);
    expect(readSearchPlaceIdParam(456)).toBe(456);
    expect(readSearchPlaceIdParam("0")).toBeUndefined();
    expect(readSearchPlaceIdParam("-1")).toBeUndefined();
    expect(readSearchPlaceIdParam("abc")).toBeUndefined();
    expect(readSearchPlaceIdParam("123abc")).toBeUndefined();
  });

  it("adds or removes searchPlaceId in URL params", () => {
    expect(withSearchPlaceIdParam({ q: "코엑스" }, 7)).toEqual({
      q: "코엑스",
      searchPlaceId: 7,
    });

    expect(
      withSearchPlaceIdParam(
        {
          q: "코엑스",
          searchPlaceId: 7,
          locker: "1",
        },
        null,
      ),
    ).toEqual({
      q: "코엑스",
      locker: "1",
    });
  });

  it("reads valid search filter params and ignores invalid values", () => {
    expect(
      readSearchFilterParams({
        filterSizes: "S,L,XL,S",
        filterIndoorOutdoor: "indoor,unknown,outdoor",
        filterPlaceTypes: "museum,invalid,subway",
      }),
    ).toEqual({
      regionActive: true,
      sizeActive: true,
      placeTypeActive: true,
      selectedSizes: ["S", "L"],
      indoorOutdoorState: ["indoor", "outdoor"],
      placeTypeState: ["museum", "subway"],
    });
  });

  it("writes only active non-default search filter params", () => {
    expect(
      withSearchFilterParams(
        {
          q: "coex",
          filterSizes: "S",
          filterIndoorOutdoor: "indoor",
          filterPlaceTypes: "museum",
        },
        {
          regionActive: false,
          sizeActive: true,
          placeTypeActive: false,
          selectedSizes: ["M"],
          indoorOutdoorState: [],
          placeTypeState: ["subway"],
        },
      ),
    ).toEqual({
      q: "coex",
      filterSizes: "M",
    });
  });
});
