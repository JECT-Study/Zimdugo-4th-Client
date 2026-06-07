import { describe, expect, it } from "vitest";
import {
  filterSearchResults,
  getNextExpandedPlaceId,
  type SearchLockerResultItem,
  type SearchPlaceResultItem,
  type SearchResultItem,
  sortSearchResults,
} from "./search-list-model";

const RESULTS: SearchPlaceResultItem[] = [
  {
    suggestType: "PLACE",
    id: "far",
    title: "코엑스",
    distanceMeters: 500,
    distanceLabel: "500m",
    address: "서울 강남구 영동대로 513",
    updatedAt: "2026-06-01T10:00:00.000Z",
    minPrice: 3_000,
    lockers: [
      {
        suggestType: "LOCKER",
        id: "far-1",
        title: "코엑스 메가박스 보관함",
        categoryLabel: "복합문화공간",
        updatedLabel: "6일 전 업데이트",
        distanceLabel: "500m",
        address: "서울 강남구 영동대로 513",
      },
      {
        suggestType: "LOCKER",
        id: "far-2",
        title: "코엑스 동문 보관함",
        categoryLabel: "복합문화공간",
        updatedLabel: "6일 전 업데이트",
        distanceLabel: "520m",
        address: "서울 강남구 영동대로 513",
      },
    ],
  },
  {
    suggestType: "PLACE",
    id: "near",
    title: "삼성역",
    searchKeywords: ["코엑스"],
    distanceMeters: 120,
    distanceLabel: "120m",
    address: "서울 강남구 테헤란로 538",
    updatedAt: "2026-06-07T10:00:00.000Z",
    minPrice: 1_000,
    lockers: [
      {
        suggestType: "LOCKER",
        id: "near-1",
        title: "삼성역 5번 출구 보관함",
        categoryLabel: "지하철역",
        updatedLabel: "방금 업데이트",
        distanceLabel: "120m",
        address: "서울 강남구 테헤란로 538",
      },
      {
        suggestType: "LOCKER",
        id: "near-2",
        title: "별마당 도서관 보관함",
        categoryLabel: "도서관",
        updatedLabel: "방금 업데이트",
        distanceLabel: "150m",
        address: "서울 강남구 영동대로 513",
      },
    ],
  },
];

describe("search-list-model", () => {
  it("같은 장소는 접고 다른 장소는 기존 장소를 대신해 펼친다", () => {
    expect(getNextExpandedPlaceId("coex", "coex")).toBeNull();
    expect(getNextExpandedPlaceId("coex", "samseong")).toBe("samseong");
  });

  it("장소명, 검색어, 자식 보관함 이름으로 결과를 필터링한다", () => {
    expect(filterSearchResults(RESULTS, "삼성")).toEqual([RESULTS[1]]);
    expect(filterSearchResults(RESULTS, "코엑스")).toEqual(RESULTS);
    expect(filterSearchResults(RESULTS, "별마당")).toEqual([RESULTS[1]]);
  });

  it("PLACE에 속하지 않는 독립 보관함도 검색 결과에 유지한다", () => {
    const standalone: SearchLockerResultItem = {
      suggestType: "LOCKER",
      id: "standalone",
      title: "삼성역 독립 보관함",
      categoryLabel: "지하철역",
      updatedLabel: "방금 업데이트",
      distanceLabel: "80m",
      address: "서울 강남구",
      distanceMeters: 80,
    };
    const mixedItems: SearchResultItem[] = [...RESULTS, standalone];

    expect(filterSearchResults(mixedItems, "독립")).toEqual([standalone]);
  });

  it("선택한 기준과 방향으로 장소 결과를 정렬하고 원본을 보존한다", () => {
    expect(sortSearchResults(RESULTS, "distance", "asc")).toEqual([
      RESULTS[1],
      RESULTS[0],
    ]);
    expect(sortSearchResults(RESULTS, "updatedAt", "desc")).toEqual([
      RESULTS[1],
      RESULTS[0],
    ]);
    expect(sortSearchResults(RESULTS, "price", "asc")).toEqual([
      RESULTS[1],
      RESULTS[0],
    ]);
    expect(RESULTS[0]?.id).toBe("far");
  });
});
