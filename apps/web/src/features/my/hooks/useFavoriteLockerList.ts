import { useInfiniteQuery } from "@tanstack/react-query";
import { getFavoriteLockerList } from "#/shared/api/my-page";
import { useMyListLocation } from "./useMyListLocation";

export const FAVORITE_LOCKER_LIST_QUERY_KEY = "favorite-locker-list";

const getPageSize = (pageIndex: number) => (pageIndex === 0 ? 20 : 10);

export function useFavoriteLockerList() {
  const { data: location } = useMyListLocation();

  return useInfiniteQuery({
    queryKey: [FAVORITE_LOCKER_LIST_QUERY_KEY, location?.lat, location?.lng],
    enabled: location != null,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      getFavoriteLockerList({
        lat: location!.lat,
        lng: location!.lng,
        page: pageParam,
        size: getPageSize(pageParam),
        signal,
      }),
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasNext ? lastPageParam + 1 : undefined,
  });
}
