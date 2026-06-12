import type { QueryClient } from "@tanstack/react-query";
import { userProfileQueryKeyPrefix } from "#/entities/user/hooks/useUser";
import { LOCKER_DETAIL_QUERY_KEY } from "#/features/search/hooks/useLockerDetail";
import {
  LOCKER_KEYWORD_QUERY_KEY,
  LOCKER_SUGGEST_QUERY_KEY,
  PLACE_LOCKERS_QUERY_KEY,
} from "#/features/search/hooks/useSearch";

export async function invalidatePersonalizedQueries(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: [LOCKER_DETAIL_QUERY_KEY],
    }),
    queryClient.invalidateQueries({
      queryKey: [LOCKER_KEYWORD_QUERY_KEY],
    }),
    queryClient.invalidateQueries({
      queryKey: [PLACE_LOCKERS_QUERY_KEY],
    }),
    queryClient.invalidateQueries({
      queryKey: [LOCKER_SUGGEST_QUERY_KEY],
    }),
    queryClient.invalidateQueries({
      queryKey: userProfileQueryKeyPrefix,
    }),
  ]);
}

export function removePersonalizedQueries(queryClient: QueryClient): void {
  queryClient.removeQueries({ queryKey: [LOCKER_DETAIL_QUERY_KEY] });
  queryClient.removeQueries({ queryKey: [LOCKER_KEYWORD_QUERY_KEY] });
  queryClient.removeQueries({ queryKey: [PLACE_LOCKERS_QUERY_KEY] });
  queryClient.removeQueries({ queryKey: [LOCKER_SUGGEST_QUERY_KEY] });
  queryClient.removeQueries({ queryKey: userProfileQueryKeyPrefix });
}
