import type { QueryClient } from "@tanstack/react-query";
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

export const patchFavoriteInQueryCaches = (
  queryClient: QueryClient,
  lockerId: number,
  isFavorite: boolean,
): void => {
  queryClient.setQueriesData<LockerSearchViewModel>(
    { queryKey: [LOCKER_SEARCH_QUERY_KEY] },
    (previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        items: previous.items.map((item) =>
          patchSearchResultItem(item, lockerId, isFavorite),
        ),
      };
    },
  );

  queryClient.setQueriesData<PlaceLockersViewModel>(
    { queryKey: [PLACE_LOCKERS_QUERY_KEY] },
    (previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        lockers: previous.lockers.map((locker) =>
          patchLockerFavorite(locker, lockerId, isFavorite),
        ),
      };
    },
  );

  queryClient.setQueriesData<LockerDetailItem>(
    { queryKey: [LOCKER_DETAIL_QUERY_KEY, lockerId] },
    (previous) => {
      if (!previous || previous.lockerId !== lockerId) {
        return previous;
      }

      return { ...previous, isFavorite };
    },
  );

  queryClient.setQueriesData<LockerPinItemResponse[]>(
    { queryKey: [LOCKER_PINS_QUERY_KEY] },
    (previous) => {
      if (!previous) {
        return previous;
      }

      return previous.map((pin) =>
        patchLockerPinFavorite(pin, lockerId, isFavorite),
      );
    },
  );
};
