import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";
import type {
  SearchLockerResultItem,
  SearchResultItem,
} from "#/composites/search/search-list-model";
import { FAVORITE_LOCKER_LIST_QUERY_KEY } from "#/features/my/hooks/useFavoriteLockerList";
import type {
  LockerSearchViewModel,
  PlaceLockersViewModel,
} from "#/shared/api/locker-adapters";
import type {
  FavoriteLockerListItem,
  PaginatedListData,
} from "#/shared/api/my-page";
import type { AuthQueryCacheScope } from "#/shared/lib/auth-query-cache-scope";
import {
  LOCKER_SEARCH_QUERY_KEY,
  PLACE_LOCKERS_QUERY_KEY,
} from "../hooks/useSearch";
import { readLockerDetailFromQueryCache } from "./read-locker-detail-from-query-cache";

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

const isCurrentAuthScopeQuery = (
  queryKey: QueryKey,
  authScope: AuthQueryCacheScope,
): boolean =>
  Array.isArray(queryKey) && queryKey[queryKey.length - 1] === authScope;

const readLockerDetailFavorite = (
  queryClient: QueryClient,
  lockerId: number,
  authScope: AuthQueryCacheScope,
): boolean | undefined => {
  const detail = readLockerDetailFromQueryCache(
    queryClient,
    lockerId,
    authScope,
  );
  if (!detail) {
    return undefined;
  }

  return detail.isFavorite ?? false;
};

export const collectServerFavoriteByLockerId = (
  queryClient: QueryClient,
  lockerIds: Iterable<number>,
  authScope: AuthQueryCacheScope,
): Map<number, boolean> => {
  const targetIds = new Set(lockerIds);
  const serverByLockerId = new Map<number, boolean>();

  if (targetIds.size === 0) {
    return serverByLockerId;
  }

  for (const lockerId of targetIds) {
    const detailFavorite = readLockerDetailFavorite(
      queryClient,
      lockerId,
      authScope,
    );
    if (detailFavorite !== undefined) {
      serverByLockerId.set(lockerId, detailFavorite);
    }
  }

  const keywordQueries = queryClient.getQueriesData<LockerSearchViewModel>({
    queryKey: [LOCKER_SEARCH_QUERY_KEY],
  });

  for (const [queryKey, data] of keywordQueries) {
    if (!isCurrentAuthScopeQuery(queryKey, authScope)) {
      continue;
    }

    if (!data) {
      continue;
    }

    forEachLockerInSearchData(data.items, (locker) => {
      if (
        targetIds.has(locker.lockerId) &&
        !serverByLockerId.has(locker.lockerId)
      ) {
        serverByLockerId.set(locker.lockerId, locker.isFavorite ?? false);
      }
    });
  }

  const placeQueries = queryClient.getQueriesData<PlaceLockersViewModel>({
    queryKey: [PLACE_LOCKERS_QUERY_KEY],
  });

  for (const [queryKey, data] of placeQueries) {
    if (!isCurrentAuthScopeQuery(queryKey, authScope)) {
      continue;
    }

    if (!data) {
      continue;
    }

    for (const locker of data.lockers) {
      if (
        targetIds.has(locker.lockerId) &&
        !serverByLockerId.has(locker.lockerId)
      ) {
        serverByLockerId.set(locker.lockerId, locker.isFavorite ?? false);
      }
    }
  }

  const favoriteListQueries = queryClient.getQueriesData<
    InfiniteData<PaginatedListData<FavoriteLockerListItem>>
  >({
    queryKey: [FAVORITE_LOCKER_LIST_QUERY_KEY],
  });

  for (const [queryKey, data] of favoriteListQueries) {
    if (!isCurrentAuthScopeQuery(queryKey, authScope)) {
      continue;
    }

    if (!data) {
      continue;
    }

    for (const page of data.pages) {
      for (const item of page.items) {
        if (
          targetIds.has(item.lockerId) &&
          !serverByLockerId.has(item.lockerId)
        ) {
          serverByLockerId.set(item.lockerId, item.isFavorite ?? true);
        }
      }
    }
  }

  return serverByLockerId;
};
