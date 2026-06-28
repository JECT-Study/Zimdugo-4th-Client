import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import { LOCKER_DETAIL_QUERY_KEY } from "#/features/search/hooks/useLockerDetail";
import { readLockerDetailFromQueryCache } from "./read-locker-detail-from-query-cache";

describe("readLockerDetailFromQueryCache", () => {
  it("lat/lng/authScope가 포함된 상세 쿼리 키에서 데이터를 읽는다", () => {
    const queryClient = new QueryClient();
    const detail: LockerDetailItem = {
      itemType: "LOCKER",
      lockerId: 7,
      title: "테스트",
      address: "주소",
      categoryLabel: "지하철역",
      updatedLabel: "방금 업데이트",
      distanceLabel: "100m",
      isAccurateVoted: true,
      isInaccurateVoted: false,
    };

    queryClient.setQueryData(
      [LOCKER_DETAIL_QUERY_KEY, 7, 37.5, 127.0, "user:1"],
      detail,
    );

    expect(readLockerDetailFromQueryCache(queryClient, 7)).toEqual(detail);
  });
});
