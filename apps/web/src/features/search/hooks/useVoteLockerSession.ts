import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import {
  postLockerVote,
  type LockerVoteType,
} from "#/shared/api/locker-votes";
import { useAuthStore } from "#/shared/store/authStore";
import { useAuthPopupStore } from "#/shared/store/authPopupStore";
import { LOCKER_DETAIL_QUERY_KEY } from "./useLockerDetail";
import {
  applySuccessfulVoteFlush,
  buildVoteFlushOperations,
  effectiveVoteToServerState,
  getEffectiveVoteCounts,
  getEffectiveVoteFlags,
  rollbackFailedVoteFlush,
  seedVoteBaseline,
  toggleVotePending,
  type LockerVoteBaseline,
  type LockerVotePending,
  type LockerVoteServerState,
} from "../model/vote-locker-session";

export function useVoteLockerSession() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthPopup = useAuthPopupStore((state) => state.openPopup);
  const baselineRef = useRef<LockerVoteBaseline>(new Map());
  const [pending, setPending] = useState<LockerVotePending>(() => new Map());
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  const getEffectiveVoteFlagOverlay = useCallback(
    (lockerId: number, server: LockerVoteServerState) =>
      getEffectiveVoteFlags(
        pending,
        baselineRef.current,
        lockerId,
        server,
      ),
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
      getEffectiveVoteCounts(pending, baselineRef.current, lockerId, {
        isAccurateVoted: server.isAccurateVoted,
        isInaccurateVoted: server.isInaccurateVoted,
        accurateCount: server.accurateCount,
        inaccurateCount: server.inaccurateCount,
      }),
    [pending],
  );

  const syncBaselineFromLockerDetail = useCallback(
    (locker: LockerDetailItem | null | undefined) => {
      if (!locker) {
        return;
      }

      seedVoteBaseline(
        baselineRef.current,
        locker.lockerId,
        {
          isAccurateVoted: locker.isAccurateVoted,
          isInaccurateVoted: locker.isInaccurateVoted,
          accurateCount: locker.accurateCount,
          inaccurateCount: locker.inaccurateCount,
        },
        pendingRef.current.has(locker.lockerId),
      );
    },
    [],
  );

  const toggle = useCallback(
    (
      lockerId: number,
      voteType: LockerVoteType,
      server?: LockerVoteServerState,
    ): boolean => {
      if (!isAuthenticated || userId == null) {
        openAuthPopup("/");
        return false;
      }

      setPending((currentPending) =>
        toggleVotePending(
          baselineRef.current,
          currentPending,
          lockerId,
          voteType,
          server,
        ),
      );
      return true;
    },
    [isAuthenticated, openAuthPopup, userId],
  );

  const flush = useCallback(async (): Promise<{ hadChanges: boolean }> => {
    const currentPending = pendingRef.current;

    if (!isAuthenticated || userId == null || currentPending.size === 0) {
      return { hadChanges: false };
    }

    const operations = buildVoteFlushOperations(
      baselineRef.current,
      currentPending,
    );
    if (operations.length === 0) {
      setPending(new Map());
      return { hadChanges: false };
    }

    const pendingSnapshot = new Map(currentPending);

    const results = await Promise.allSettled(
      operations.map((operation) =>
        postLockerVote(userId, operation.lockerId, operation.voteType),
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
      const nextState = applySuccessfulVoteFlush(
        baselineRef.current,
        pendingSnapshot,
        succeededLockerIds,
      );
      baselineRef.current = nextState.baseline;

      setPending((latestPending) => {
        const updatedPending = new Map(latestPending);
        for (const lockerId of succeededLockerIds) {
          if (updatedPending.get(lockerId) === pendingSnapshot.get(lockerId)) {
            updatedPending.delete(lockerId);
          }
        }
        return updatedPending;
      });

      for (const lockerId of succeededLockerIds) {
        const baselineEntry = baselineRef.current.get(lockerId);
        if (!baselineEntry) {
          continue;
        }

        queryClient.setQueriesData<LockerDetailItem>(
          { queryKey: [LOCKER_DETAIL_QUERY_KEY, lockerId] },
          (previousDetail) => {
            if (!previousDetail || previousDetail.lockerId !== lockerId) {
              return previousDetail;
            }

            return {
              ...previousDetail,
              ...effectiveVoteToServerState(baselineEntry.vote),
              accurateCount: baselineEntry.accurateCount,
              inaccurateCount: baselineEntry.inaccurateCount,
            };
          },
        );
      }

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
  }, [isAuthenticated, queryClient, userId]);

  const handleDetailVoteChange = useCallback(
    (item: LockerDetailItem, voteType: LockerVoteType) => {
      toggle(item.lockerId, voteType);
    },
    [toggle],
  );

  return {
    pending,
    getEffectiveVoteFlagOverlay,
    getEffectiveVoteCountOverlay,
    syncBaselineFromLockerDetail,
    toggle,
    flush,
    handleDetailVoteChange,
  };
}
