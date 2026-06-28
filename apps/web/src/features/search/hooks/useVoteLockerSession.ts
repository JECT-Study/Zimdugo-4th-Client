import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import { type LockerVoteType, postLockerVote } from "#/shared/api/locker-votes";
import { useAuthPopupStore } from "#/shared/store/authPopupStore";
import { useAuthStore } from "#/shared/store/authStore";
import {
  buildVoteFlushOperations,
  computeVoteDetailAfterFlush,
  getEffectiveVoteCounts,
  getEffectiveVoteFlags,
  type LockerVotePending,
  type LockerVoteServerState,
  rollbackFailedVoteFlush,
  toggleVotePending,
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

    const operations = buildVoteFlushOperations(currentPending);

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
      await Promise.all(
        succeededLockerIds.map((lockerId) =>
          queryClient.cancelQueries({
            queryKey: [LOCKER_DETAIL_QUERY_KEY, lockerId],
          }),
        ),
      );

      for (const lockerId of succeededLockerIds) {
        const pendingEntry = pendingSnapshot.get(lockerId);
        if (pendingEntry === undefined) {
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
              pendingEntry.nextVote,
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
    (
      item: LockerDetailItem,
      voteType: LockerVoteType,
      server?: LockerVoteServerState,
    ) => {
      toggle(item.lockerId, voteType, {
        isAccurateVoted: server?.isAccurateVoted,
        isInaccurateVoted: server?.isInaccurateVoted,
      });
    },
    [toggle],
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
