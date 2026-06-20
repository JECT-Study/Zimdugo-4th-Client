import type { QueryClient } from "@tanstack/react-query";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import { LOCKER_DETAIL_QUERY_KEY } from "../hooks/useLockerDetail";

export const readLockerDetailFromQueryCache = (
  queryClient: QueryClient,
  lockerId: number,
): LockerDetailItem | undefined => {
  const detailQueries = queryClient.getQueriesData<LockerDetailItem>({
    queryKey: [LOCKER_DETAIL_QUERY_KEY, lockerId],
  });

  for (const [, detail] of detailQueries) {
    if (detail?.lockerId === lockerId) {
      return detail;
    }
  }

  return undefined;
};
