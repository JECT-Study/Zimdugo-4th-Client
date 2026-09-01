import { describe, expect, it } from "vitest";
import type {
  SearchLockerResultItem,
  SearchPlaceResultItem,
} from "#/composites/search/search-list-model";
import {
  searchLockerItemsToPins,
  searchResultItemsToPins,
} from "./search-result-pins";

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
  it("장소 핀 배지에 장소의 보관함 개수를 쓴다", () => {
    const pins = searchResultItemsToPins([createPlaceItem()]);

    expect(pins).toEqual([
      expect.objectContaining({
        pinType: "PLACE",
        placeId: 201,
        lockerCount: 2,
      }),
    ]);
  });

  it("좌표가 없는 검색 결과는 건너뛴다", () => {
    const pins = searchResultItemsToPins([
      createLockerItem({ latitude: undefined }),
      createPlaceItem({ longitude: undefined }),
    ]);

    expect(pins).toEqual([]);
  });

  it("닫힌 보관함과 그것만 있는 장소를 비활성으로 표시한다", () => {
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

describe("핀에 실리는 즐겨찾기 상태", () => {
  it("보관함 항목의 즐겨찾기를 핀으로 옮긴다", () => {
    // 예전에는 핀을 만들 때 isFavorite 을 버려서, 즐겨찾기를 눌러도 지도 위 마커가
    // 기본 도안 그대로였다. map-marker 는 pin.isFavorite === true 일 때만 바꿔 그린다.
    const [pin] = searchLockerItemsToPins([
      createLockerItem({ lockerId: 101, isFavorite: true }),
    ]);

    expect(pin?.isFavorite).toBe(true);
  });

  it("즐겨찾기가 아닌 보관함은 false 로 옮긴다", () => {
    const [pin] = searchLockerItemsToPins([
      createLockerItem({ lockerId: 101, isFavorite: false }),
    ]);

    expect(pin?.isFavorite).toBe(false);
  });

  it("서버가 즐겨찾기를 안 알려주면 null 로 둔다", () => {
    const [pin] = searchLockerItemsToPins([
      createLockerItem({ lockerId: 101 }),
    ]);

    expect(pin?.isFavorite).toBeNull();
  });

  it("장소 핀은 보관함 하나를 가리키지 않아 즐겨찾기가 없다", () => {
    const pins = searchResultItemsToPins([
      createPlaceItem({
        lockers: [
          createLockerItem({ lockerId: 101, isFavorite: true }),
          createLockerItem({ lockerId: 102, isFavorite: true }),
        ],
      }),
    ]);

    expect(pins).toHaveLength(1);
    expect(pins[0]?.pinType).toBe("PLACE");
    expect(pins[0]?.isFavorite).toBeNull();
  });

  it("검색 결과의 보관함 항목도 즐겨찾기를 싣는다", () => {
    const pins = searchResultItemsToPins([
      createLockerItem({ lockerId: 101, isFavorite: true }),
    ]);

    expect(pins[0]?.isFavorite).toBe(true);
  });
});
