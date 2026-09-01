import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import { LOCKER_DETAIL_QUERY_KEY } from "#/features/search/hooks/useLockerDetail";
import { readLockerDetailFromQueryCache } from "./read-locker-detail-from-query-cache";

describe("readLockerDetailFromQueryCache", () => {
  it("범위가 맞는 상세 쿼리 키에서 값을 읽는다", () => {
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

  it("인증 범위가 다른 상세 쿼리는 무시한다", () => {
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
