import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import { LOCKER_DETAIL_QUERY_KEY } from "#/features/search/hooks/useLockerDetail";
import { collectServerVoteByLockerId } from "./collect-server-vote-state";

describe("collectServerVoteByLockerId", () => {
  it("상세 쿼리 캐시 prefix로 서버 투표 상태를 읽는다", () => {
    const queryClient = new QueryClient();
    const detail: LockerDetailItem = {
      itemType: "LOCKER",
      lockerId: 9,
      title: "테스트",
      address: "주소",
      categoryLabel: "지하철역",
      updatedLabel: "방금 업데이트",
      distanceLabel: "100m",
      isAccurateVoted: true,
      isInaccurateVoted: false,
    };

    queryClient.setQueryData(
      [LOCKER_DETAIL_QUERY_KEY, 9, 37.5, 127.0, "user:1"],
      detail,
    );

    expect(collectServerVoteByLockerId(queryClient, [9]).get(9)).toBe(
      "CORRECT",
    );
  });
});
