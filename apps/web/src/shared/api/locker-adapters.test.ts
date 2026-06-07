import { describe, expect, it } from "vitest";
import { toLockerKeywordViewModel } from "./locker-adapters";
import type { LockerKeywordDataRaw } from "./lockers";

const GANGNAM_KEYWORD_RESPONSE: LockerKeywordDataRaw = {
  count: 4,
  bounds: {
    swLat: 37.496068,
    swLng: 127.027539,
    neLat: 37.517185,
    neLng: 127.04122,
  },
  items: [
    {
      type: "PLACE",
      placeId: 158,
      placeName: "강남역 1, 12번 출구",
      roadAddress: "서울특별시 강남구 강남대로 지하396(역삼동)",
      latitude: 37.497958,
      longitude: 127.027539,
      distanceMeters: 16,
      lockers: [
        {
          lockerId: 167,
          lockerName: "강남역 1, 12번 출구 지하",
          roadAddress: "서울특별시 강남구 강남대로 지하396(역삼동)",
          lockerType: "SUBWAY_STATION",
          minPrice: 2200,
          latitude: 37.497958,
          longitude: 127.027539,
          distanceMeters: 16,
          updatedAt: "2026-05-31T14:59:09.298782",
          isFavorite: false,
        },
        {
          lockerId: 168,
          lockerName: "강남역 1, 12번 출구 지하",
          roadAddress: "서울특별시 강남구 강남대로 지하396(역삼동)",
          lockerType: "SUBWAY_STATION",
          minPrice: 2200,
          latitude: 37.497958,
          longitude: 127.027539,
          distanceMeters: 16,
          updatedAt: "2026-05-31T14:59:09.298782",
          isFavorite: false,
        },
      ],
    },
    {
      type: "LOCKER",
      placeId: 483,
      placeName: "강남역 4번 출구",
      lockerId: 515,
      lockerName: "강남역 4번 출구 지하 1층",
      roadAddress: "서울특별시 강남구 강남대로 지하396",
      lockerType: "SUBWAY_STATION",
      minPrice: 3000,
      latitude: 37.496068,
      longitude: 127.028506,
      distanceMeters: 238,
      updatedAt: "2026-05-31T14:59:09",
      isFavorite: false,
      lockers: [],
    },
  ],
};

describe("locker-adapters", () => {
  it("keyword 응답을 PLACE/LOCKER 검색 결과 모델로 변환한다", () => {
    const viewModel = toLockerKeywordViewModel(GANGNAM_KEYWORD_RESPONSE);

    expect(viewModel.count).toBe(4);
    expect(viewModel.items).toHaveLength(2);
    expect(viewModel.items[0]?.itemType).toBe("PLACE");
    if (viewModel.items[0]?.itemType === "PLACE") {
      expect(viewModel.items[0].placeId).toBe(158);
      expect(viewModel.items[0].distanceLabel).toBe("16m");
      expect(viewModel.items[0].lockers).toHaveLength(2);
      expect(viewModel.items[0].lockers[0]?.lockerId).toBe(167);
    }

    expect(viewModel.items[1]?.itemType).toBe("LOCKER");
    if (viewModel.items[1]?.itemType === "LOCKER") {
      expect(viewModel.items[1].lockerId).toBe(515);
      expect(viewModel.items[1].distanceMeters).toBe(238);
    }
  });
});
