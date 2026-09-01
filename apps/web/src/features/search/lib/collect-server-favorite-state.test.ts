import type { InfiniteData } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import { FAVORITE_LOCKER_LIST_QUERY_KEY } from "#/features/my/hooks/useFavoriteLockerList";
import { LOCKER_DETAIL_QUERY_KEY } from "#/features/search/hooks/useLockerDetail";
import { LOCKER_SEARCH_QUERY_KEY } from "#/features/search/hooks/useSearch";
import type { LockerSearchViewModel } from "#/shared/api/locker-adapters";
import type {
  FavoriteLockerListItem,
  PaginatedListData,
} from "#/shared/api/my-page";
import { collectServerFavoriteByLockerId } from "./collect-server-favorite-state";

describe("collectServerFavoriteByLockerId", () => {
  it("즐겨찾기 목록 캐시에서 상태를 읽는다", () => {
    const queryClient = new QueryClient();
    const page: PaginatedListData<FavoriteLockerListItem> = {
      count: 1,
      totalCount: 1,
      hasNext: false,
      items: [
        {
          lockerId: 42,
          lockerName: "locker",
          roadAddress: "address",
          lockerType: "PUBLIC",
          latitude: 37.5,
          longitude: 127.0,
          distanceMeters: 100,
          updatedAt: "2026-01-01",
          isFavorite: true,
        },
      ],
    };

    queryClient.setQueryData<
      InfiniteData<PaginatedListData<FavoriteLockerListItem>>
    >([FAVORITE_LOCKER_LIST_QUERY_KEY, 37.5, 127.0, 1], {
      pages: [page],
      pageParams: [0],
    });

    expect(collectServerFavoriteByLockerId(queryClient, [42], 1).get(42)).toBe(
      true,
    );
  });

  it("목록 캐시보다 범위가 맞는 상세 캐시를 먼저 본다", () => {
    const queryClient = new QueryClient();
    const detail: LockerDetailItem = {
      itemType: "LOCKER",
      lockerId: 42,
      title: "detail locker",
      address: "detail address",
      categoryLabel: "category",
      updatedLabel: "updated",
      distanceLabel: "100m",
      isFavorite: true,
    };
    const keywordData: LockerSearchViewModel = {
      count: 1,
      bounds: {
        swLat: 37,
        swLng: 127,
        neLat: 38,
        neLng: 128,
      },
      items: [
        {
          itemType: "LOCKER",
          lockerId: 42,
          title: "list locker",
          address: "list address",
          categoryLabel: "category",
          updatedLabel: "updated",
          distanceLabel: "200m",
          isFavorite: false,
        },
      ],
    };

    queryClient.setQueryData(
      [LOCKER_DETAIL_QUERY_KEY, 42, 37.5, 127.0, 1],
      detail,
    );
    queryClient.setQueryData(
      [LOCKER_SEARCH_QUERY_KEY, "locker", 1],
      keywordData,
    );

    expect(collectServerFavoriteByLockerId(queryClient, [42], 1).get(42)).toBe(
      true,
    );
  });

  it("인증 범위가 다른 캐시는 무시한다", () => {
    const queryClient = new QueryClient();
    const detail: LockerDetailItem = {
      itemType: "LOCKER",
      lockerId: 42,
      title: "anonymous locker",
      address: "address",
      categoryLabel: "category",
      updatedLabel: "updated",
      distanceLabel: "100m",
      isFavorite: true,
    };

    queryClient.setQueryData(
      [LOCKER_DETAIL_QUERY_KEY, 42, 37.5, 127.0, "anonymous"],
      detail,
    );

    expect(
      collectServerFavoriteByLockerId(queryClient, [42], 1).get(42),
    ).toBeUndefined();
  });
});
