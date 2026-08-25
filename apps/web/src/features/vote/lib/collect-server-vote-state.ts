import type { QueryClient } from "@tanstack/react-query";
import { readLockerDetailFromQueryCache } from "#/features/search/lib/read-locker-detail-from-query-cache";
import type { AuthQueryCacheScope } from "#/shared/lib/auth-query-cache-scope";
import {
  type EffectiveLockerVote,
  serverVoteStateToEffective,
} from "../model/vote-locker-session";

export const collectServerVoteByLockerId = (
  queryClient: QueryClient,
  lockerIds: Iterable<number>,
  authScope: AuthQueryCacheScope,
): Map<number, EffectiveLockerVote> => {
  const targetIds = new Set(lockerIds);
  const serverByLockerId = new Map<number, EffectiveLockerVote>();

  for (const lockerId of targetIds) {
    const detail = readLockerDetailFromQueryCache(
      queryClient,
      lockerId,
      authScope,
    );

    if (!detail) {
      continue;
    }

    serverByLockerId.set(
      lockerId,
      serverVoteStateToEffective({
        isAccurateVoted: detail.isAccurateVoted,
        isInaccurateVoted: detail.isInaccurateVoted,
      }),
    );
  }

  return serverByLockerId;
};
