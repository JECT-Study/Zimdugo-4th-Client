import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import type {
  SearchLockerResultItem,
  SearchLockerResultItems,
  SearchResultItem,
} from "#/composites/search/search-list-model";
import { LOCKER_PINS_QUERY_KEY } from "#/entities/map/model/useLockerMarkers";
import type {
  LockerSearchViewModel,
  PlaceLockersViewModel,
} from "#/shared/api/locker-adapters";
import type { LockerPinItemResponse } from "#/shared/api/lockers";
import type { AuthQueryCacheScope } from "#/shared/lib/auth-query-cache-scope";
import { LOCKER_DETAIL_QUERY_KEY } from "../hooks/useLockerDetail";
import {
  LOCKER_SEARCH_QUERY_KEY,
  PLACE_LOCKERS_QUERY_KEY,
} from "../hooks/useSearch";

const patchLockerFavorite = (
  locker: SearchLockerResultItem,
  lockerId: number,
  isFavorite: boolean,
): SearchLockerResultItem =>
  locker.lockerId === lockerId ? { ...locker, isFavorite } : locker;

const patchSearchResultItem = (
  item: SearchResultItem,
  lockerId: number,
  isFavorite: boolean,
): SearchResultItem => {
  if (item.itemType === "LOCKER") {
    return patchLockerFavorite(item, lockerId, isFavorite);
  }

  return {
    ...item,
    lockers: item.lockers.map((locker) =>
      patchLockerFavorite(locker, lockerId, isFavorite),
    ) as SearchLockerResultItems,
  };
};

const patchLockerPinFavorite = (
  pin: LockerPinItemResponse,
  lockerId: number,
  isFavorite: boolean,
): LockerPinItemResponse =>
  pin.pinType === "LOCKER" && pin.lockerId === lockerId
    ? { ...pin, isFavorite }
    : pin;

const isCurrentAuthScopeQuery = (
  queryKey: QueryKey,
  authScope: AuthQueryCacheScope,
): boolean =>
  Array.isArray(queryKey) && queryKey[queryKey.length - 1] === authScope;

export const patchFavoriteInQueryCaches = (
  queryClient: QueryClient,
  lockerId: number,
  isFavorite: boolean,
  authScope: AuthQueryCacheScope,
): void => {
  for (const [
    queryKey,
    previous,
  ] of queryClient.getQueriesData<LockerSearchViewModel>({
    queryKey: [LOCKER_SEARCH_QUERY_KEY],
  })) {
    if (!previous || !isCurrentAuthScopeQuery(queryKey, authScope)) {
      continue;
    }

    queryClient.setQueryData(queryKey, {
      ...previous,
      items: previous.items.map((item) =>
        patchSearchResultItem(item, lockerId, isFavorite),
      ),
    });
  }

  for (const [
    queryKey,
    previous,
  ] of queryClient.getQueriesData<PlaceLockersViewModel>({
    queryKey: [PLACE_LOCKERS_QUERY_KEY],
  })) {
    if (!previous || !isCurrentAuthScopeQuery(queryKey, authScope)) {
      continue;
    }

    queryClient.setQueryData(queryKey, {
      ...previous,
      lockers: previous.lockers.map((locker) =>
        patchLockerFavorite(locker, lockerId, isFavorite),
      ),
    });
  }

  for (const [
    queryKey,
    previous,
  ] of queryClient.getQueriesData<LockerDetailItem>({
    queryKey: [LOCKER_DETAIL_QUERY_KEY, lockerId],
  })) {
    if (
      !previous ||
      previous.lockerId !== lockerId ||
      !isCurrentAuthScopeQuery(queryKey, authScope)
    ) {
      continue;
    }

    queryClient.setQueryData(queryKey, { ...previous, isFavorite });
  }

  for (const [queryKey, previous] of queryClient.getQueriesData<
    LockerPinItemResponse[]
  >({
    queryKey: [LOCKER_PINS_QUERY_KEY],
  })) {
    if (!previous || !isCurrentAuthScopeQuery(queryKey, authScope)) {
      continue;
    }

    queryClient.setQueryData(
      queryKey,
      previous.map((pin) => patchLockerPinFavorite(pin, lockerId, isFavorite)),
    );
  }
};
