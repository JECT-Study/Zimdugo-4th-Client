import { describe, expect, it } from "vitest";
import { isOperatingNow, markOperatingStatus } from "./operating-status";
import type {
  SearchLockerResultItem,
  SearchResultItem,
} from "./search-list-model";
import { getSearchResultEntityId } from "./search-list-model";

const createLocker = (
  overrides: Partial<SearchLockerResultItem> &
    Pick<SearchLockerResultItem, "lockerId">,
): SearchLockerResultItem => {
  const { lockerId, ...rest } = overrides;

  return {
    itemType: "LOCKER",
    lockerId,
    title: `locker-${lockerId}`,
    categoryLabel: "보관함",
    updatedLabel: "방금 업데이트",
    distanceLabel: "0m",
    address: "서울 강남구",
    operatingHours: null,
    ...rest,
  };
};

const CLOSED_AT_NOON = { open: "13:00", close: "18:00" };
const NOON = new Date("2026-06-07T12:00:00+09:00");

describe("isOperatingNow", () => {
  it("누락된 운영시간은 운영 중, 24시나 자정을 넘는 시간은 운영 종료로 판정한다", () => {
    const currentTime = new Date("2026-06-07T23:00:00+09:00");

    expect(isOperatingNow(null, currentTime)).toBe(true);
    expect(isOperatingNow({ open: "05:00", close: "24:00" }, currentTime)).toBe(
      false,
    );
    expect(isOperatingNow({ open: "22:00", close: "02:00" }, currentTime)).toBe(
      false,
    );
  });
});

describe("markOperatingStatus", () => {
  it("서버가 준 순서를 그대로 두고 운영 여부만 붙인다", () => {
    const items: SearchResultItem[] = [
      createLocker({ lockerId: 1, operatingHours: CLOSED_AT_NOON }),
      createLocker({ lockerId: 2 }),
      createLocker({ lockerId: 3, operatingHours: CLOSED_AT_NOON }),
    ];

    const marked = markOperatingStatus(items, NOON);

    expect(marked.map(getSearchResultEntityId)).toEqual([1, 2, 3]);
    expect(marked.map((item) => item.isOpen)).toEqual([false, true, false]);
  });

  it("장소는 보관함 하나라도 운영 중이면 운영 중이고, 보관함 순서도 바꾸지 않는다", () => {
    const items: SearchResultItem[] = [
      {
        itemType: "PLACE",
        placeId: 10,
        title: "코엑스",
        distanceLabel: "300m",
        address: "서울 강남구 영동대로 513",
        lockers: [
          createLocker({ lockerId: 11, operatingHours: CLOSED_AT_NOON }),
          createLocker({ lockerId: 12 }),
        ],
      },
      {
        itemType: "PLACE",
        placeId: 20,
        title: "모두 종료된 장소",
        distanceLabel: "1m",
        address: "서울 강남구",
        lockers: [
          createLocker({ lockerId: 21, operatingHours: CLOSED_AT_NOON }),
          createLocker({ lockerId: 22, operatingHours: CLOSED_AT_NOON }),
        ],
      },
    ];

    const [openPlace, closedPlace] = markOperatingStatus(items, NOON);

    if (openPlace?.itemType !== "PLACE" || closedPlace?.itemType !== "PLACE") {
      throw new Error("PLACE 두 개가 필요합니다.");
    }
    expect(openPlace.isOpen).toBe(true);
    expect(openPlace.lockers.map((locker) => locker.lockerId)).toEqual([
      11, 12,
    ]);
    expect(openPlace.lockers.map((locker) => locker.isOpen)).toEqual([
      false,
      true,
    ]);
    expect(closedPlace.isOpen).toBe(false);
  });

  it("원본 결과를 바꾸지 않는다", () => {
    const items: SearchResultItem[] = [
      createLocker({ lockerId: 1, operatingHours: CLOSED_AT_NOON }),
    ];
    const original = structuredClone(items);

    markOperatingStatus(items, NOON);

    expect(items).toEqual(original);
  });
});
