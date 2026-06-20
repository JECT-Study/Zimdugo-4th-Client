import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { InfiniteData } from "@tanstack/react-query";
import { FAVORITE_LOCKER_LIST_QUERY_KEY } from "#/features/my/hooks/useFavoriteLockerList";
import type {
  FavoriteLockerListItem,
  PaginatedListData,
} from "#/shared/api/my-page";
import { collectServerFavoriteByLockerId } from "./collect-server-favorite-state";

describe("collectServerFavoriteByLockerId", () => {
  it("마이페이지 즐겨찾기 목록 캐시에서 서버 즐겨찾기 상태를 읽는다", () => {
    const queryClient = new QueryClient();
    const page: PaginatedListData<FavoriteLockerListItem> = {
      count: 1,
      totalCount: 1,
      hasNext: false,
      items: [
        {
          lockerId: 42,
          lockerName: "테스트",
          roadAddress: "주소",
          lockerType: "PUBLIC",
          latitude: 37.5,
          longitude: 127.0,
          distanceMeters: 100,
          updatedAt: "2026-01-01",
          isFavorite: true,
        },
      ],
    };

    queryClient.setQueryData<InfiniteData<PaginatedListData<FavoriteLockerListItem>>>(
      [FAVORITE_LOCKER_LIST_QUERY_KEY, 37.5, 127.0],
      {
        pages: [page],
        pageParams: [0],
      },
    );

    expect(collectServerFavoriteByLockerId(queryClient, [42]).get(42)).toBe(
      true,
    );
  });
});
