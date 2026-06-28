import { useInfiniteQuery } from "@tanstack/react-query";
import { getMyLockerReportHistory } from "#/shared/api/my-page";
import { MY_HISTORY_LIST_STALE_TIME_MS } from "../lib/my-list-query-options";
import { getMyListPageSize } from "../lib/pagination-helpers";
import { useMyListLocation } from "./useMyListLocation";

export const REPORT_HISTORY_LIST_QUERY_KEY = "report-history-list";

export function useReportHistoryList() {
  const { data: location } = useMyListLocation();

  return useInfiniteQuery({
    queryKey: [REPORT_HISTORY_LIST_QUERY_KEY, location?.lat, location?.lng],
    enabled: location != null,
    staleTime: MY_HISTORY_LIST_STALE_TIME_MS,
    refetchOnWindowFocus: false,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => {
      if (!location) {
        throw new Error("Report history list location is required.");
      }

      return getMyLockerReportHistory({
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
