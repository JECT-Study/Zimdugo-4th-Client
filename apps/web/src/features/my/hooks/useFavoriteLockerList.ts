import { useInfiniteQuery } from "@tanstack/react-query";
import { getFavoriteLockerList } from "#/shared/api/my-page";
import { getAuthQueryCacheScope } from "#/shared/lib/auth-query-cache-scope";
import { useAuthStore } from "#/shared/store/authStore";
import { getMyListPageSize } from "../lib/pagination-helpers";
import { useMyListLocation } from "./useMyListLocation";

export const FAVORITE_LOCKER_LIST_QUERY_KEY = "favorite-locker-list";

export function useFavoriteLockerList() {
  const { data: location } = useMyListLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.userId);
  const authScope = getAuthQueryCacheScope(isAuthenticated, userId);
  const canFetchFavoriteLockers = location != null && authScope !== null;

  return useInfiniteQuery({
    queryKey: [
      FAVORITE_LOCKER_LIST_QUERY_KEY,
      location?.lat,
      location?.lng,
      authScope,
    ],
    enabled: canFetchFavoriteLockers,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => {
      if (!location) {
        throw new Error("Favorite locker list location is required.");
      }

      return getFavoriteLockerList({
        lat: location.lat,
        lng: location.lng,
        page: pageParam,
        size: getMyListPageSize(pageParam),
        signal,
      });
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasNext ? lastPageParam + 1 : undefined,
  });
}
