import { describe, expect, it } from "vitest";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import {
  mergeDisplayLockerDetailWithPreviousDistance,
  mergeStoredLockerDetailWithPreviousDistance,
} from "./locker-detail-display";

const createLockerDetail = (
  overrides: Partial<LockerDetailItem> = {},
): LockerDetailItem => ({
  itemType: "LOCKER",
  lockerId: 505,
  title: "신논현역 4번 출구 B1층 에스컬레이트 좌측",
  address: "서울시 강남구 봉은사로 지하102",
  categoryLabel: "지하철역",
  updatedLabel: "방금 업데이트",
  distanceLabel: "",
  accurateCount: 1,
  inaccurateCount: 0,
  isAccurateVoted: false,
  isInaccurateVoted: false,
  isFavorite: false,
  ...overrides,
});

describe("locker-detail-display", () => {
  it("화면 표시용 상세 병합은 서버 투표 카운트를 보존한다", () => {
    const displayed = mergeDisplayLockerDetailWithPreviousDistance(
      createLockerDetail(),
      createLockerDetail({
        distanceLabel: "120m",
        accurateCount: 99,
        inaccurateCount: 9,
        isAccurateVoted: true,
      }),
    );

    expect(displayed).toMatchObject({
      distanceLabel: "120m",
      accurateCount: 1,
      inaccurateCount: 0,
      isAccurateVoted: false,
      isInaccurateVoted: false,
      isFavorite: false,
    });
  });

  it("저장용 상세 병합은 stale 개인화 필드를 제거한다", () => {
    const stored = mergeStoredLockerDetailWithPreviousDistance(
      createLockerDetail(),
      createLockerDetail({ distanceLabel: "120m" }),
    );

    expect(stored.distanceLabel).toBe("120m");
    expect(stored).not.toHaveProperty("accurateCount");
    expect(stored).not.toHaveProperty("inaccurateCount");
    expect(stored).not.toHaveProperty("isAccurateVoted");
    expect(stored).not.toHaveProperty("isInaccurateVoted");
    expect(stored).not.toHaveProperty("isFavorite");
  });
});
