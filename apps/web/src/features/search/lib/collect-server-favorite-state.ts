import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import { FAVORITE_LOCKER_LIST_QUERY_KEY } from "#/features/my/hooks/useFavoriteLockerList";
import type {
  SearchLockerResultItem,
  SearchResultItem,
} from "#/composites/search/search-list-model";
import type {
  FavoriteLockerListItem,
  PaginatedListData,
} from "#/shared/api/my-page";
import type {
  LockerKeywordViewModel,
  PlaceLockersViewModel,
} from "#/shared/api/locker-adapters";
import { LOCKER_DETAIL_QUERY_KEY } from "../hooks/useLockerDetail";
import {
  LOCKER_KEYWORD_QUERY_KEY,
  PLACE_LOCKERS_QUERY_KEY,
} from "../hooks/useSearch";

const forEachLockerInSearchData = (
  items: SearchResultItem[] | SearchLockerResultItem[],
  visit: (locker: SearchLockerResultItem) => void,
) => {
  for (const item of items) {
    if ("itemType" in item && item.itemType === "PLACE") {
      for (const locker of item.lockers) {
        visit(locker);
      }
      continue;
    }

    visit(item as SearchLockerResultItem);
  }
};

const readLockerDetailFavorite = (
  queryClient: QueryClient,
  lockerId: number,
): boolean | undefined => {
  const detailQueries = queryClient.getQueriesData<LockerDetailItem>({
    queryKey: [LOCKER_DETAIL_QUERY_KEY, lockerId],
  });

  for (const [, detail] of detailQueries) {
    if (detail?.lockerId === lockerId) {
      return detail.isFavorite ?? false;
    }
  }

  return undefined;
};

export const collectServerFavoriteByLockerId = (
  queryClient: QueryClient,
  lockerIds: Iterable<number>,
): Map<number, boolean> => {
  const targetIds = new Set(lockerIds);
  const serverByLockerId = new Map<number, boolean>();

  if (targetIds.size === 0) {
    return serverByLockerId;
  }

  for (const lockerId of targetIds) {
    const detailFavorite = readLockerDetailFavorite(queryClient, lockerId);
    if (detailFavorite !== undefined) {
      serverByLockerId.set(lockerId, detailFavorite);
    }
  }

  const keywordQueries = queryClient.getQueriesData<LockerKeywordViewModel>({
    queryKey: [LOCKER_KEYWORD_QUERY_KEY],
  });

  for (const [, data] of keywordQueries) {
    if (!data) {
      continue;
    }

    forEachLockerInSearchData(data.items, (locker) => {
      if (targetIds.has(locker.lockerId)) {
        serverByLockerId.set(locker.lockerId, locker.isFavorite ?? false);
      }
    });
  }

  const placeQueries = queryClient.getQueriesData<PlaceLockersViewModel>({
    queryKey: [PLACE_LOCKERS_QUERY_KEY],
  });

  for (const [, data] of placeQueries) {
    if (!data) {
      continue;
    }

    for (const locker of data.lockers) {
      if (targetIds.has(locker.lockerId)) {
        serverByLockerId.set(locker.lockerId, locker.isFavorite ?? false);
      }
    }
  }

  const favoriteListQueries = queryClient.getQueriesData<
    InfiniteData<PaginatedListData<FavoriteLockerListItem>>
  >({
    queryKey: [FAVORITE_LOCKER_LIST_QUERY_KEY],
  });

  for (const [, data] of favoriteListQueries) {
    if (!data) {
      continue;
    }

    for (const page of data.pages) {
      for (const item of page.items) {
        if (targetIds.has(item.lockerId)) {
          serverByLockerId.set(item.lockerId, item.isFavorite ?? true);
        }
      }
    }
  }

  return serverByLockerId;
};
