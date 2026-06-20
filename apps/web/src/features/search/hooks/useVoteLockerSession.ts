import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import {
  postLockerVote,
  type LockerVoteType,
} from "#/shared/api/locker-votes";
import { useAuthStore } from "#/shared/store/authStore";
import { useAuthPopupStore } from "#/shared/store/authPopupStore";
import { collectServerVoteByLockerId } from "../lib/collect-server-vote-state";
import {
  buildVoteFlushOperations,
  computeVoteDetailAfterFlush,
  getEffectiveVoteCounts,
  getEffectiveVoteFlags,
  rollbackFailedVoteFlush,
  toggleVotePending,
  type LockerVotePending,
  type LockerVoteServerState,
} from "../model/vote-locker-session";
import { LOCKER_DETAIL_QUERY_KEY } from "./useLockerDetail";

export function useVoteLockerSession() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.getAccessToken());
  const openAuthPopup = useAuthPopupStore((state) => state.openPopup);
  const [pending, setPending] = useState<LockerVotePending>(() => new Map());
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  const getEffectiveVoteFlagOverlay = useCallback(
    (lockerId: number, server: LockerVoteServerState) =>
      getEffectiveVoteFlags(pending, lockerId, server),
    [pending],
  );

  const getEffectiveVoteCountOverlay = useCallback(
    (
      lockerId: number,
      server: Pick<
        LockerDetailItem,
        | "isAccurateVoted"
        | "isInaccurateVoted"
        | "accurateCount"
        | "inaccurateCount"
      >,
    ) =>
      getEffectiveVoteCounts(pending, lockerId, {
        isAccurateVoted: server.isAccurateVoted,
        isInaccurateVoted: server.isInaccurateVoted,
        accurateCount: server.accurateCount,
        inaccurateCount: server.inaccurateCount,
      }),
    [pending],
  );

  const toggle = useCallback(
    (
      lockerId: number,
      voteType: LockerVoteType,
      server?: LockerVoteServerState,
    ): boolean => {
      if (!isAuthenticated || accessToken == null) {
        openAuthPopup("/");
        return false;
      }

      setPending((currentPending) =>
        toggleVotePending(currentPending, lockerId, voteType, server),
      );
      return true;
    },
    [accessToken, isAuthenticated, openAuthPopup],
  );

  const flush = useCallback(async (): Promise<{ hadChanges: boolean }> => {
    const currentPending = pendingRef.current;

    if (!isAuthenticated || accessToken == null || currentPending.size === 0) {
      return { hadChanges: false };
    }

    const serverByLockerId = collectServerVoteByLockerId(
      queryClient,
      currentPending.keys(),
    );
    const operations = buildVoteFlushOperations(
      currentPending,
      serverByLockerId,
    );

    if (operations.length === 0) {
      setPending(new Map());
      return { hadChanges: false };
    }

    const pendingSnapshot = new Map(currentPending);

    const results = await Promise.allSettled(
      operations.map((operation) =>
        postLockerVote(operation.lockerId, operation.voteType),
      ),
    );

    const succeededLockerIds: number[] = [];
    const failedLockerIds: number[] = [];

    results.forEach((result, index) => {
      const lockerId = operations[index]?.lockerId;
      if (lockerId == null) {
        return;
      }

      if (result.status === "fulfilled") {
        succeededLockerIds.push(lockerId);
        return;
      }

      failedLockerIds.push(lockerId);
    });

    if (succeededLockerIds.length > 0) {
      for (const lockerId of succeededLockerIds) {
        const pendingVote = pendingSnapshot.get(lockerId);
        if (pendingVote === undefined) {
          continue;
        }

        queryClient.setQueriesData<LockerDetailItem>(
          { queryKey: [LOCKER_DETAIL_QUERY_KEY, lockerId] },
          (previousDetail) => {
            if (!previousDetail || previousDetail.lockerId !== lockerId) {
              return previousDetail;
            }

            const patched = computeVoteDetailAfterFlush(
              {
                isAccurateVoted: previousDetail.isAccurateVoted,
                isInaccurateVoted: previousDetail.isInaccurateVoted,
                accurateCount: previousDetail.accurateCount,
                inaccurateCount: previousDetail.inaccurateCount,
              },
              pendingVote,
            );

            return {
              ...previousDetail,
              ...patched.voteFlags,
              accurateCount: patched.accurateCount,
              inaccurateCount: patched.inaccurateCount,
            };
          },
        );
      }

      setPending((latestPending) => {
        const updatedPending = new Map(latestPending);
        for (const lockerId of succeededLockerIds) {
          if (updatedPending.get(lockerId) === pendingSnapshot.get(lockerId)) {
            updatedPending.delete(lockerId);
          }
        }
        return updatedPending;
      });

      await queryClient.invalidateQueries({
        queryKey: [LOCKER_DETAIL_QUERY_KEY],
      });
    }

    if (failedLockerIds.length > 0) {
      setPending((latestPending) =>
        rollbackFailedVoteFlush(
          latestPending,
          failedLockerIds,
          pendingSnapshot,
        ),
      );
    }

    return { hadChanges: true };
  }, [accessToken, isAuthenticated, queryClient]);

  const handleDetailVoteChange = useCallback(
    (item: LockerDetailItem, voteType: LockerVoteType) => {
      const serverDetail = queryClient.getQueryData<LockerDetailItem>([
        LOCKER_DETAIL_QUERY_KEY,
        item.lockerId,
      ]);

      toggle(item.lockerId, voteType, {
        isAccurateVoted:
          serverDetail?.isAccurateVoted ?? item.isAccurateVoted,
        isInaccurateVoted:
          serverDetail?.isInaccurateVoted ?? item.isInaccurateVoted,
      });
    },
    [queryClient, toggle],
  );

  return {
    pending,
    getEffectiveVoteFlagOverlay,
    getEffectiveVoteCountOverlay,
    toggle,
    flush,
    handleDetailVoteChange,
  };
}
