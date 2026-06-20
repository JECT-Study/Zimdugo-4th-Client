import type { QueryClient } from "@tanstack/react-query";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import type {
  SearchLockerResultItem,
  SearchResultItem,
} from "#/composites/search/search-list-model";
import type {
  LockerKeywordViewModel,
  PlaceLockersViewModel,
} from "#/shared/api/locker-adapters";
import {
  LOCKER_KEYWORD_QUERY_KEY,
  PLACE_LOCKERS_QUERY_KEY,
} from "../hooks/useSearch";
import { LOCKER_DETAIL_QUERY_KEY } from "../hooks/useLockerDetail";

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
    const detail = queryClient.getQueryData<LockerDetailItem>([
      LOCKER_DETAIL_QUERY_KEY,
      lockerId,
    ]);

    if (detail) {
      serverByLockerId.set(lockerId, detail.isFavorite ?? false);
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

  for (const lockerId of targetIds) {
    if (!serverByLockerId.has(lockerId)) {
      serverByLockerId.set(lockerId, false);
    }
  }

  return serverByLockerId;
};
