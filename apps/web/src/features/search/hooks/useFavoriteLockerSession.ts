import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import type {
  SearchLockerResultItem,
  SearchResultItem,
} from "#/composites/search/search-list-model";
import {
  addFavoriteLocker,
  removeFavoriteLocker,
} from "#/shared/api/favorite-lockers";
import { useAuthStore } from "#/shared/store/authStore";
import { useAuthPopupStore } from "#/shared/store/authPopupStore";
import { LOCKER_DETAIL_QUERY_KEY } from "./useLockerDetail";
import {
  LOCKER_KEYWORD_QUERY_KEY,
  PLACE_LOCKERS_QUERY_KEY,
} from "./useSearch";
import {
  applySuccessfulFlush,
  buildFavoriteFlushOperations,
  getEffectiveFavorite,
  rollbackFailedFlush,
  seedFavoriteBaseline,
  toggleFavoritePending,
  type FavoriteLockerPending,
} from "../model/favorite-locker-session";

const forEachLockerInSearchData = (
  items: SearchResultItem[] | SearchLockerResultItem[],
  visit: (locker: SearchLockerResultItem) => void,
) => {
  for (const item of items) {
    if ("itemType" in item && item.itemType === "PLACE") {
      for (const locker of item.lockers) {
        visit(locker);
      }
      continue;
    }

    visit(item as SearchLockerResultItem);
  }
};

export function useFavoriteLockerSession() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthPopup = useAuthPopupStore((state) => state.openPopup);
  const baselineRef = useRef(new Map<number, boolean>());
  const [pending, setPending] = useState<FavoriteLockerPending>(
    () => new Map(),
  );

  const getEffectiveIsFavorite = useCallback(
    (lockerId: number, serverIsFavorite?: boolean) =>
      getEffectiveFavorite(pending, lockerId, serverIsFavorite),
    [pending],
  );

  const syncBaselineFromSearchData = useCallback(
    (items: SearchResultItem[] | SearchLockerResultItem[]) => {
      forEachLockerInSearchData(items, (locker) => {
        seedFavoriteBaseline(
          baselineRef.current,
          locker.lockerId,
          locker.isFavorite,
          pending.has(locker.lockerId),
        );
      });
    },
    [pending],
  );

  const syncBaselineFromLockerDetail = useCallback(
    (locker: LockerDetailItem | null | undefined) => {
      if (!locker) {
        return;
      }

      seedFavoriteBaseline(
        baselineRef.current,
        locker.lockerId,
        locker.isFavorite,
        pending.has(locker.lockerId),
      );
    },
    [pending],
  );

  const toggle = useCallback(
    (lockerId: number, next: boolean): boolean => {
      if (!isAuthenticated || userId == null) {
        openAuthPopup("/");
        return false;
      }

      setPending((currentPending) =>
        toggleFavoritePending(
          baselineRef.current,
          currentPending,
          lockerId,
          next,
        ),
      );
      return true;
    },
    [isAuthenticated, openAuthPopup, userId],
  );

  const flush = useCallback(async (): Promise<{ hadChanges: boolean }> => {
    if (!isAuthenticated || userId == null || pending.size === 0) {
      return { hadChanges: false };
    }

    const operations = buildFavoriteFlushOperations(
      baselineRef.current,
      pending,
    );
    if (operations.length === 0) {
      setPending(new Map());
      return { hadChanges: false };
    }

    const results = await Promise.allSettled(
      operations.map((operation) =>
        operation.action === "add"
          ? addFavoriteLocker(userId, operation.lockerId)
          : removeFavoriteLocker(userId, operation.lockerId),
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
      const pendingSnapshot = new Map(pending);
      const nextState = applySuccessfulFlush(
        baselineRef.current,
        pendingSnapshot,
        succeededLockerIds,
      );
      baselineRef.current = nextState.baseline;

      setPending((currentPending) => {
        const updatedPending = new Map(currentPending);
        for (const lockerId of succeededLockerIds) {
          if (updatedPending.get(lockerId) === pendingSnapshot.get(lockerId)) {
            updatedPending.delete(lockerId);
          }
        }
        return updatedPending;
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [LOCKER_KEYWORD_QUERY_KEY],
        }),
        queryClient.invalidateQueries({
          queryKey: [PLACE_LOCKERS_QUERY_KEY],
        }),
        queryClient.invalidateQueries({
          queryKey: [LOCKER_DETAIL_QUERY_KEY],
        }),
      ]);
    }

    if (failedLockerIds.length > 0) {
      setPending((currentPending) =>
        rollbackFailedFlush(currentPending, failedLockerIds),
      );
    }

    return { hadChanges: true };
  }, [isAuthenticated, pending, queryClient, userId]);

  const handleSearchFavoriteChange = useCallback(
    (item: SearchLockerResultItem, next: boolean) => {
      toggle(item.lockerId, next);
    },
    [toggle],
  );

  const handleDetailFavoriteChange = useCallback(
    (item: LockerDetailItem, next: boolean) => {
      toggle(item.lockerId, next);
    },
    [toggle],
  );

  return {
    pending,
    getEffectiveIsFavorite,
    syncBaselineFromSearchData,
    syncBaselineFromLockerDetail,
    toggle,
    flush,
    handleSearchFavoriteChange,
    handleDetailFavoriteChange,
  };
}
