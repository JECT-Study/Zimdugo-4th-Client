import type { QueryClient } from "@tanstack/react-query";
import {
  serverVoteStateToEffective,
  type EffectiveLockerVote,
} from "../model/vote-locker-session";
import { readLockerDetailFromQueryCache } from "./read-locker-detail-from-query-cache";

export const collectServerVoteByLockerId = (
  queryClient: QueryClient,
  lockerIds: Iterable<number>,
): Map<number, EffectiveLockerVote> => {
  const targetIds = new Set(lockerIds);
  const serverByLockerId = new Map<number, EffectiveLockerVote>();

  for (const lockerId of targetIds) {
    const detail = readLockerDetailFromQueryCache(queryClient, lockerId);

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
