import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import { LOCKER_DETAIL_QUERY_KEY } from "#/features/search/hooks/useLockerDetail";
import { readLockerDetailFromQueryCache } from "./read-locker-detail-from-query-cache";

describe("readLockerDetailFromQueryCache", () => {
  it("reads detail data from the scoped detail query key", () => {
    const queryClient = new QueryClient();
    const detail: LockerDetailItem = {
      itemType: "LOCKER",
      lockerId: 7,
      title: "locker",
      address: "address",
      categoryLabel: "category",
      updatedLabel: "updated",
      distanceLabel: "100m",
      isAccurateVoted: true,
      isInaccurateVoted: false,
    };

    queryClient.setQueryData(
      [LOCKER_DETAIL_QUERY_KEY, 7, 37.5, 127.0, 1],
      detail,
    );

    expect(readLockerDetailFromQueryCache(queryClient, 7, 1)).toEqual(detail);
  });

  it("ignores detail queries from a different auth scope", () => {
    const queryClient = new QueryClient();
    const detail: LockerDetailItem = {
      itemType: "LOCKER",
      lockerId: 7,
      title: "test",
      address: "address",
      categoryLabel: "category",
      updatedLabel: "updated",
      distanceLabel: "100m",
      isFavorite: false,
    };

    queryClient.setQueryData(
      [LOCKER_DETAIL_QUERY_KEY, 7, 37.5, 127.0, "anonymous"],
      detail,
    );

    expect(readLockerDetailFromQueryCache(queryClient, 7, 1)).toBeUndefined();
  });
});
