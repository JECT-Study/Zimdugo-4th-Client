import { setLanguageTag } from "@repo/i18n";
import { describe, expect, it } from "vitest";
import {
  toLockerDetailItem,
  toLockerKeywordViewModel,
  toPlaceLockersViewModel,
} from "./locker-adapters";
import type {
  LockerDetailRaw,
  LockerKeywordDataRaw,
  PlaceLockersDataRaw,
} from "./lockers";

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

  it("place lockers 응답을 place 메타 + locker 리스트로 변환한다", () => {
    const raw: PlaceLockersDataRaw = {
      placeId: 158,
      placeName: "강남역 1, 12번 출구",
      roadAddress: "서울특별시 강남구 강남대로 지하396(역삼동)",
      latitude: 37.497958,
      longitude: 127.027539,
      bounds: {
        swLat: 37.496068,
        swLng: 127.027539,
        neLat: 37.517185,
        neLng: 127.04122,
      },
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
      ],
    };

    const viewModel = toPlaceLockersViewModel(raw);

    expect(viewModel.placeId).toBe(158);
    expect(viewModel.placeName).toBe("강남역 1, 12번 출구");
    expect(viewModel.lockers).toHaveLength(1);
    expect(viewModel.lockers[0]?.lockerId).toBe(167);
  });

  it("locker detail Swagger 필드를 UI 모델로 변환한다", () => {
    setLanguageTag("ko");
    const raw: LockerDetailRaw = {
      lockerId: 515,
      lockerName: "강남역 4번 출구 지하 1층",
      roadAddress: "서울특별시 강남구 강남대로 지하396",
      lockerType: "SUBWAY_STATION",
      latitude: 37.496068,
      longitude: 127.028506,
      minPrice: 3000,
      maxPrice: 5000,
      floor: 1,
      lockerSizes: ["SMALL", "MEDIUM"],
      startTime: "06:00",
      endTime: "23:00",
      detailInfo: "지하 1층 안내 데스크 옆",
      accurateVoteCount: 12,
      inaccurateVoteCount: 1,
      isAccurateVoted: true,
      isInaccurateVoted: false,
      updatedAt: "2026-05-31T14:59:09",
      isFavorite: false,
    };

    const detail = toLockerDetailItem(raw);

    expect(detail.title).toBe("강남역 4번 출구 지하 1층");
    expect(detail.operatingHoursLabel).toBe("06:00 ~ 23:00");
    expect(detail.floorLabel).toBe("1층");
    expect(detail.priceLabel).toBe("3,000원 ~ 5,000원");
    expect(detail.sizeLabel).toBe("소형, 중형");
    expect(detail.detailHelpText).toBe("지하 1층 안내 데스크 옆");
    expect(detail.accurateCount).toBe(12);
    expect(detail.inaccurateCount).toBe(1);
    expect(detail.isAccurateVoted).toBe(true);
    expect(detail.isInaccurateVoted).toBe(false);
    expect(detail.lastUpdatedLabel).toBe("최근 업데이트 2026-05-31 14:59");
  });

  it("투표 플래그가 없으면 false로 변환한다", () => {
    const detail = toLockerDetailItem({
      lockerId: 1,
      lockerName: "테스트 보관함",
      roadAddress: "서울",
      lockerType: "SUBWAY_STATION",
      latitude: 37.5,
      longitude: 127.0,
      accurateVoteCount: 2,
      inaccurateVoteCount: 0,
    });

    expect(detail.isAccurateVoted).toBe(false);
    expect(detail.isInaccurateVoted).toBe(false);
  });

  it("운영시간·가격이 없으면 미제공 문구로 변환한다", () => {
    setLanguageTag("ko");

    const detail = toLockerDetailItem({
      lockerId: 1,
      lockerName: "테스트 보관함",
      roadAddress: "서울",
      lockerType: "SUBWAY_STATION",
      latitude: 37.5,
      longitude: 127.0,
      isFavorite: false,
    });

    expect(detail.operatingHoursLabel).toBe("운영시간 미제공");
    expect(detail.priceLabel).toBe("미제공");
  });
});
