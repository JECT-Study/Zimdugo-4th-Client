import { describe, expect, it } from "vitest";
import type {
  SearchLockerResultItem,
  SearchResultItem,
} from "./search-list-model";
import { isOperatingNow, sortLockerData } from "./sort-locker-data";

const createLocker = (
  overrides: Partial<SearchLockerResultItem> &
    Pick<SearchLockerResultItem, "id">,
): SearchLockerResultItem => {
  const { id, ...rest } = overrides;

  return {
    suggestType: "LOCKER",
    id,
    title: overrides.title ?? id,
    categoryLabel: "보관함",
    updatedLabel: "방금 업데이트",
    distanceLabel: `${overrides.distanceMeters ?? 0}m`,
    address: "서울 강남구",
    distanceMeters: 0,
    updatedAt: "2026-06-07T00:00:00.000Z",
    minPrice: 0,
    operatingHours: null,
    ...rest,
  };
};

const ITEMS: SearchResultItem[] = [
  createLocker({
    id: "closed-near",
    title: "가까운 종료 보관함",
    distanceMeters: 10,
    minPrice: 100,
    operatingHours: { open: "13:00", close: "18:00" },
  }),
  {
    suggestType: "PLACE",
    id: "place",
    title: "코엑스",
    distanceLabel: "300m",
    address: "서울 강남구 영동대로 513",
    distanceMeters: 300,
    updatedAt: "2026-06-06T00:00:00.000Z",
    minPrice: 3_000,
    searchKeywords: ["COEX"],
    lockers: [
      createLocker({
        id: "place-closed",
        title: "코엑스 종료 보관함",
        distanceMeters: 100,
        minPrice: 1_000,
        operatingHours: { open: "13:00", close: "18:00" },
      }),
      createLocker({
        id: "place-open",
        title: "코엑스 운영 보관함",
        distanceMeters: 500,
        minPrice: 2_000,
        operatingHours: null,
      }),
    ],
  },
  createLocker({
    id: "open-far",
    title: "먼 운영 보관함",
    distanceMeters: 400,
    minPrice: 500,
    operatingHours: null,
  }),
];

describe("sortLockerData", () => {
  it("누락된 운영시간은 Open, 자정 교차 시간은 Closed로 판정한다", () => {
    const currentTime = new Date("2026-06-07T23:00:00+09:00");

    expect(isOperatingNow(null, currentTime)).toBe(true);
    expect(isOperatingNow({ open: "05:00", close: "24:00" }, currentTime)).toBe(
      false,
    );
    expect(isOperatingNow({ open: "22:00", close: "02:00" }, currentTime)).toBe(
      false,
    );
  });

  it("운영 중 항목을 우선하고 PLACE 자식에도 동일 정렬을 재귀 적용한다", () => {
    const sorted = sortLockerData(
      ITEMS,
      "DISTANCE",
      "ASC",
      new Date("2026-06-07T12:00:00+09:00"),
    );

    expect(sorted.map((item) => item.id)).toEqual([
      "place",
      "open-far",
      "closed-near",
    ]);

    const place = sorted[0];
    expect(place?.suggestType).toBe("PLACE");
    if (place?.suggestType !== "PLACE") throw new Error("PLACE가 필요합니다.");
    expect(place.lockers.map((locker) => locker.id)).toEqual([
      "place-open",
      "place-closed",
    ]);
  });

  it("내림차순에서도 Open과 Closed 그룹을 섞지 않는다", () => {
    const sorted = sortLockerData(
      ITEMS,
      "DISTANCE",
      "DESC",
      new Date("2026-06-07T12:00:00+09:00"),
    );

    expect(sorted.map((item) => item.id)).toEqual([
      "open-far",
      "place",
      "closed-near",
    ]);
  });

  it("모든 자식 보관함이 Closed인 PLACE를 Closed 그룹으로 분류한다", () => {
    const allClosedPlace: SearchResultItem = {
      suggestType: "PLACE",
      id: "all-closed-place",
      title: "모두 종료된 장소",
      distanceLabel: "1m",
      address: "서울 강남구",
      distanceMeters: 1,
      lockers: [
        createLocker({
          id: "closed-child-one",
          operatingHours: { open: "13:00", close: "18:00" },
        }),
        createLocker({
          id: "closed-child-two",
          operatingHours: { open: "13:00", close: "18:00" },
        }),
      ],
    };

    const openLocker = ITEMS[2];
    if (!openLocker) throw new Error("Open 보관함 fixture가 필요합니다.");

    const sorted = sortLockerData(
      [allClosedPlace, openLocker],
      "DISTANCE",
      "ASC",
      new Date("2026-06-07T12:00:00+09:00"),
    );

    expect(sorted.map((item) => item.id)).toEqual([
      "open-far",
      "all-closed-place",
    ]);
  });

  it("secondary, 가격, 이름 fallback까지 적용하고 원본을 변경하지 않는다", () => {
    const original = structuredClone(ITEMS);
    const sameDistanceItems: SearchResultItem[] = [
      createLocker({
        id: "older",
        title: "나 보관함",
        distanceMeters: 100,
        updatedAt: "2026-06-06T00:00:00.000Z",
        minPrice: 1_000,
      }),
      createLocker({
        id: "newer-expensive",
        title: "다 보관함",
        distanceMeters: 100,
        updatedAt: "2026-06-07T00:00:00.000Z",
        minPrice: 3_000,
      }),
      createLocker({
        id: "newer-cheap-b",
        title: "가 보관함",
        distanceMeters: 100,
        updatedAt: "2026-06-07T00:00:00.000Z",
        minPrice: 1_000,
      }),
      createLocker({
        id: "newer-cheap-a",
        title: "나 보관함",
        distanceMeters: 100,
        updatedAt: "2026-06-07T00:00:00.000Z",
        minPrice: 1_000,
      }),
    ];

    const sorted = sortLockerData(
      sameDistanceItems,
      "DISTANCE",
      "ASC",
      new Date("2026-06-07T12:00:00+09:00"),
    );

    expect(sorted.map((item) => item.id)).toEqual([
      "newer-cheap-b",
      "newer-cheap-a",
      "newer-expensive",
      "older",
    ]);
    expect(ITEMS).toEqual(original);
    expect(
      Object.keys(sorted[0] ?? {}).some((key) => key.startsWith("__")),
    ).toBe(false);
  });
});
