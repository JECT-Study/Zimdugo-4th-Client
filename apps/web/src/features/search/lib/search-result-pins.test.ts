import { describe, expect, it } from "vitest";
import type {
  SearchLockerResultItem,
  SearchPlaceResultItem,
} from "#/composites/search/search-list-model";
import { searchResultItemsToPins } from "./search-result-pins";

const createLockerItem = (
  overrides: Partial<SearchLockerResultItem> = {},
): SearchLockerResultItem => ({
  itemType: "LOCKER",
  lockerId: 101,
  title: "Locker A",
  categoryLabel: "Small",
  updatedLabel: "Just now",
  distanceLabel: "10m",
  address: "Suwon",
  latitude: 37.5,
  longitude: 127,
  ...overrides,
});

const createPlaceItem = (
  overrides: Partial<SearchPlaceResultItem> = {},
): SearchPlaceResultItem => ({
  itemType: "PLACE",
  placeId: 201,
  title: "Place A",
  distanceLabel: "10m",
  address: "Suwon",
  latitude: 37.5,
  longitude: 127,
  lockers: [
    createLockerItem({ lockerId: 101 }),
    createLockerItem({ lockerId: 102 }),
  ],
  ...overrides,
});

describe("searchResultItemsToPins", () => {
  it("uses the place locker count for place pin badges", () => {
    const pins = searchResultItemsToPins([createPlaceItem()]);

    expect(pins).toEqual([
      expect.objectContaining({
        pinType: "PLACE",
        placeId: 201,
        lockerCount: 2,
      }),
    ]);
  });

  it("skips search results without coordinates", () => {
    const pins = searchResultItemsToPins([
      createLockerItem({ latitude: undefined }),
      createPlaceItem({ longitude: undefined }),
    ]);

    expect(pins).toEqual([]);
  });

  it("marks closed lockers and places with only closed lockers inactive", () => {
    const closedHours = { open: "10:00", close: "09:00" };
    const pins = searchResultItemsToPins([
      createLockerItem({ lockerId: 301, operatingHours: closedHours }),
      createPlaceItem({
        placeId: 401,
        lockers: [
          createLockerItem({ lockerId: 4011, operatingHours: closedHours }),
          createLockerItem({ lockerId: 4012, operatingHours: closedHours }),
        ],
      }),
    ]);

    expect(pins).toEqual([
      expect.objectContaining({
        pinType: "LOCKER",
        lockerId: 301,
        markerStatus: "inactive",
      }),
      expect.objectContaining({
        pinType: "PLACE",
        placeId: 401,
        markerStatus: "inactive",
      }),
    ]);
  });
});
