import type { QueryClient } from "@tanstack/react-query";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import {
  serverVoteStateToEffective,
  type EffectiveLockerVote,
} from "../model/vote-locker-session";
import { LOCKER_DETAIL_QUERY_KEY } from "../hooks/useLockerDetail";

export const collectServerVoteByLockerId = (
  queryClient: QueryClient,
  lockerIds: Iterable<number>,
): Map<number, EffectiveLockerVote> => {
  const targetIds = new Set(lockerIds);
  const serverByLockerId = new Map<number, EffectiveLockerVote>();

  for (const lockerId of targetIds) {
    const detail = queryClient.getQueryData<LockerDetailItem>([
      LOCKER_DETAIL_QUERY_KEY,
      lockerId,
    ]);

    if (!detail) {
      serverByLockerId.set(lockerId, null);
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
