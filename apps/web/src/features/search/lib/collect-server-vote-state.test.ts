import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import { LOCKER_DETAIL_QUERY_KEY } from "#/features/search/hooks/useLockerDetail";
import { collectServerVoteByLockerId } from "./collect-server-vote-state";

describe("collectServerVoteByLockerId", () => {
  it("reads vote state from the scoped detail query cache", () => {
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

  it("ignores detail cache from a different auth scope", () => {
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
