import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import { LOCKER_DETAIL_QUERY_KEY } from "#/features/search/hooks/useLockerDetail";
import { collectServerVoteByLockerId } from "./collect-server-vote-state";

describe("collectServerVoteByLockerId", () => {
  it("범위가 맞는 상세 캐시에서 투표 상태를 읽는다", () => {
    const queryClient = new QueryClient();
    const detail: LockerDetailItem = {
      itemType: "LOCKER",
      lockerId: 9,
      title: "locker",
      address: "address",
      categoryLabel: "category",
      updatedLabel: "updated",
      distanceLabel: "100m",
      isAccurateVoted: true,
      isInaccurateVoted: false,
    };

    queryClient.setQueryData(
      [LOCKER_DETAIL_QUERY_KEY, 9, 37.5, 127.0, 1],
      detail,
    );

    expect(collectServerVoteByLockerId(queryClient, [9], 1).get(9)).toBe(
      "CORRECT",
    );
  });

  it("인증 범위가 다른 상세 캐시는 무시한다", () => {
    const queryClient = new QueryClient();
    const detail: LockerDetailItem = {
      itemType: "LOCKER",
      lockerId: 9,
      title: "locker",
      address: "address",
      categoryLabel: "category",
      updatedLabel: "updated",
      distanceLabel: "100m",
      isAccurateVoted: true,
      isInaccurateVoted: false,
    };

    queryClient.setQueryData(
      [LOCKER_DETAIL_QUERY_KEY, 9, 37.5, 127.0, "anonymous"],
      detail,
    );

    expect(
      collectServerVoteByLockerId(queryClient, [9], 1).get(9),
    ).toBeUndefined();
  });
});
