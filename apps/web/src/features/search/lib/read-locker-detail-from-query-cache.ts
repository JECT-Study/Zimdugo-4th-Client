import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import type { AuthQueryCacheScope } from "#/shared/lib/auth-query-cache-scope";
import { LOCKER_DETAIL_QUERY_KEY } from "../hooks/useLockerDetail";

const isCurrentAuthScopeQuery = (
  queryKey: QueryKey,
  authScope: AuthQueryCacheScope,
): boolean =>
  Array.isArray(queryKey) && queryKey[queryKey.length - 1] === authScope;

export const readLockerDetailFromQueryCache = (
  queryClient: QueryClient,
  lockerId: number,
  authScope: AuthQueryCacheScope,
): LockerDetailItem | undefined => {
  const detailQueries = queryClient.getQueriesData<LockerDetailItem>({
    queryKey: [LOCKER_DETAIL_QUERY_KEY, lockerId],
  });

  for (const [queryKey, detail] of detailQueries) {
    if (!isCurrentAuthScopeQuery(queryKey, authScope)) {
      continue;
    }

    if (detail?.lockerId === lockerId) {
      return detail;
    }
  }

  return undefined;
};
