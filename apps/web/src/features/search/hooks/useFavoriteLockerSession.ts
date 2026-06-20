import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import type { SearchLockerResultItem } from "#/composites/search/search-list-model";
import {
  addFavoriteLocker,
  removeFavoriteLocker,
} from "#/shared/api/favorite-lockers";
import { useAuthStore } from "#/shared/store/authStore";
import { useAuthPopupStore } from "#/shared/store/authPopupStore";
import { collectServerFavoriteByLockerId } from "../lib/collect-server-favorite-state";
import { patchFavoriteInQueryCaches } from "../lib/patch-favorite-query-cache";
import { readLockerDetailFromQueryCache } from "../lib/read-locker-detail-from-query-cache";
import {
  buildFavoriteFlushOperations,
  getEffectiveFavorite,
  rollbackFailedFlush,
  toggleFavoritePending,
  type FavoriteLockerPending,
} from "../model/favorite-locker-session";
import { LOCKER_DETAIL_QUERY_KEY } from "./useLockerDetail";
import {
  LOCKER_SEARCH_QUERY_KEY,
  PLACE_LOCKERS_QUERY_KEY,
} from "./useSearch";

export function useFavoriteLockerSession() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.getAccessToken());
  const openAuthPopup = useAuthPopupStore((state) => state.openPopup);
  const [pending, setPending] = useState<FavoriteLockerPending>(
    () => new Map(),
  );
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  const getEffectiveIsFavorite = useCallback(
    (lockerId: number, serverIsFavorite?: boolean) =>
      getEffectiveFavorite(pending, lockerId, serverIsFavorite),
    [pending],
  );

  const toggle = useCallback(
    (
      lockerId: number,
      next: boolean,
      serverIsFavorite?: boolean,
    ): boolean => {
      if (!isAuthenticated || accessToken == null) {
        openAuthPopup("/");
        return false;
      }

      setPending((currentPending) =>
        toggleFavoritePending(
          currentPending,
          lockerId,
          next,
          serverIsFavorite,
        ),
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

    const serverByLockerId = collectServerFavoriteByLockerId(
      queryClient,
      currentPending.keys(),
    );
    const operations = buildFavoriteFlushOperations(
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
        operation.action === "add"
          ? addFavoriteLocker(operation.lockerId)
          : removeFavoriteLocker(operation.lockerId),
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
        const nextFavorite = pendingSnapshot.get(lockerId);
        if (nextFavorite === undefined) {
          continue;
        }

        patchFavoriteInQueryCaches(queryClient, lockerId, nextFavorite);
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

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [LOCKER_SEARCH_QUERY_KEY],
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
      setPending((latestPending) =>
        rollbackFailedFlush(latestPending, failedLockerIds, pendingSnapshot),
      );
    }

    return { hadChanges: true };
  }, [accessToken, isAuthenticated, queryClient]);

  const handleSearchFavoriteChange = useCallback(
    (item: SearchLockerResultItem, next: boolean) => {
      const serverIsFavorite = collectServerFavoriteByLockerId(
        queryClient,
        [item.lockerId],
      ).get(item.lockerId);

      toggle(item.lockerId, next, serverIsFavorite);
    },
    [queryClient, toggle],
  );

  const handleDetailFavoriteChange = useCallback(
    (item: LockerDetailItem, next: boolean) => {
      const serverDetail = readLockerDetailFromQueryCache(
        queryClient,
        item.lockerId,
      );

      toggle(
        item.lockerId,
        next,
        serverDetail?.isFavorite ?? item.isFavorite,
      );
    },
    [queryClient, toggle],
  );

  return {
    pending,
    getEffectiveIsFavorite,
    toggle,
    flush,
    handleSearchFavoriteChange,
    handleDetailFavoriteChange,
  };
}
