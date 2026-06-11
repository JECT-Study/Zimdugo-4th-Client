import { useInfiniteQuery } from "@tanstack/react-query";
import { getMyLockerReportHistory } from "#/shared/api/my-page";
import { useMyListLocation } from "./useMyListLocation";

export const REPORT_HISTORY_LIST_QUERY_KEY = "report-history-list";

const getPageSize = (pageIndex: number) => (pageIndex === 0 ? 20 : 10);

export function useReportHistoryList() {
  const { data: location } = useMyListLocation();

  return useInfiniteQuery({
    queryKey: [REPORT_HISTORY_LIST_QUERY_KEY, location?.lat, location?.lng],
    enabled: location != null,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      getMyLockerReportHistory({
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
