import { useQuery } from "@tanstack/react-query";
import {
  toLockerSearchViewModel,
  toPlaceLockersViewModel,
  toSearchAutocompleteItems,
} from "#/shared/api/locker-adapters";
import {
  type GetLockerSearchParams,
  type GetLockerSuggestParams,
  type GetPlaceLockersParams,
  getLockerSearch,
  getLockerSuggest,
  getPlaceLockers,
} from "#/shared/api/lockers";
import { getAuthQueryCacheScope } from "#/shared/lib/auth-query-cache-scope";
import { useAuthStore } from "#/shared/store/authStore";

function useAuthQueryCacheScope() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.userId);

  return getAuthQueryCacheScope(isAuthenticated, userId);
}

export const LOCKER_SEARCH_QUERY_KEY = "lockerSearch";
export const LOCKER_SUGGEST_QUERY_KEY = "lockerSuggest";
export const PLACE_LOCKERS_QUERY_KEY = "placeLockers";

export function useLockerSearch(params: GetLockerSearchParams | null) {
  const authScope = useAuthQueryCacheScope();

  return useQuery({
    queryKey: [
      LOCKER_SEARCH_QUERY_KEY,
      params?.keyword,
      params?.lat,
      params?.lng,
      params?.sizeTypes,
      params?.lockerTypes,
      params?.indoorOutdoorTypes,
      params?.minPrice,
      params?.maxPrice,
      params?.isFree,
      authScope,
    ],
    queryFn: ({ signal }) => {
      if (!params) {
        throw new Error("Locker search params are required.");
      }

      return getLockerSearch({ ...params, signal }).then(
        toLockerSearchViewModel,
      );
    },
    enabled: !!params?.keyword?.trim(),
    placeholderData: (previousData) => previousData,
  });
}

export function usePlaceLockers(params: GetPlaceLockersParams | null) {
  const authScope = useAuthQueryCacheScope();

  return useQuery({
    queryKey: [
      PLACE_LOCKERS_QUERY_KEY,
      params?.placeId,
      params?.lat,
      params?.lng,
      params?.sizeTypes,
      params?.lockerTypes,
      params?.indoorOutdoorTypes,
      authScope,
    ],
    queryFn: ({ signal }) => {
      if (!params) {
        throw new Error("Place lockers params are required.");
      }

      return getPlaceLockers({ ...params, signal }).then(
        toPlaceLockersViewModel,
      );
    },
    enabled: params != null,
    placeholderData: (previousData) => previousData,
  });
}

export function useLockerSuggest(params: GetLockerSuggestParams | null) {
  const authScope = useAuthQueryCacheScope();

  return useQuery({
    queryKey: [
      LOCKER_SUGGEST_QUERY_KEY,
      params?.keyword,
      params?.lat,
      params?.lng,
      authScope,
    ],
    queryFn: ({ signal }) => {
      if (!params) {
        throw new Error("Locker suggest params are required.");
      }

      return getLockerSuggest({ ...params, signal }).then((data) =>
        toSearchAutocompleteItems(data.items),
      );
    },
    enabled: !!params?.keyword?.trim(),
  });
}
