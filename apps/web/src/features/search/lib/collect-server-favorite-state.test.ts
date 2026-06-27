import type { InfiniteData } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import { FAVORITE_LOCKER_LIST_QUERY_KEY } from "#/features/my/hooks/useFavoriteLockerList";
import { LOCKER_DETAIL_QUERY_KEY } from "#/features/search/hooks/useLockerDetail";
import { LOCKER_KEYWORD_QUERY_KEY } from "#/features/search/hooks/useSearch";
import type { LockerKeywordViewModel } from "#/shared/api/locker-adapters";
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

    queryClient.setQueryData<
      InfiniteData<PaginatedListData<FavoriteLockerListItem>>
    >([FAVORITE_LOCKER_LIST_QUERY_KEY, 37.5, 127.0], {
      pages: [page],
      pageParams: [0],
    });

    expect(collectServerFavoriteByLockerId(queryClient, [42]).get(42)).toBe(
      true,
    );
  });

  it("상세 캐시 값이 있으면 목록 캐시가 같은 lockerId를 덮지 않는다", () => {
    const queryClient = new QueryClient();
    const detail: LockerDetailItem = {
      itemType: "LOCKER",
      lockerId: 42,
      title: "상세 보관함",
      address: "상세 주소",
      categoryLabel: "지하철역",
      updatedLabel: "방금 업데이트",
      distanceLabel: "100m",
      isFavorite: true,
    };
    const keywordData: LockerKeywordViewModel = {
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
          title: "목록 보관함",
          address: "목록 주소",
          categoryLabel: "지하철역",
          updatedLabel: "1시간 전 업데이트",
          distanceLabel: "200m",
          isFavorite: false,
        },
      ],
    };

    queryClient.setQueryData(
      [LOCKER_DETAIL_QUERY_KEY, 42, 37.5, 127.0, "user:1"],
      detail,
    );
    queryClient.setQueryData([LOCKER_KEYWORD_QUERY_KEY, "locker"], keywordData);

    expect(collectServerFavoriteByLockerId(queryClient, [42]).get(42)).toBe(
      true,
    );
  });
});
