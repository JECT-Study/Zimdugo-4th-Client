import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FavoriteLockerListItem } from "#/shared/api/my-page";
import { removeFavoriteLocker } from "#/shared/api/favorite-lockers";
import { useAuthStore } from "#/shared/store/authStore";
import {
  FAVORITE_LOCKER_LIST_QUERY_KEY,
  useFavoriteLockerList,
} from "./useFavoriteLockerList";
import { MY_PAGE_SUMMARY_QUERY_KEY } from "./useMyPageSummary";

const UNDO_TIMEOUT_MS = 5_000;

interface PendingFavoriteRemoval {
  item: FavoriteLockerListItem;
  index: number;
  timeoutId: number;
}

export function useFavoriteRemoval() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const listQuery = useFavoriteLockerList();
  const [hiddenLockerIds, setHiddenLockerIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [undoItem, setUndoItem] = useState<FavoriteLockerListItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pendingRemovalRef = useRef<PendingFavoriteRemoval | null>(null);

  const deleteFavoriteLocker = useCallback(
    async (lockerId: number) => {
      if (userId == null) return;

      try {
        await removeFavoriteLocker(userId, lockerId);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [FAVORITE_LOCKER_LIST_QUERY_KEY],
          }),
          queryClient.invalidateQueries({
            queryKey: [MY_PAGE_SUMMARY_QUERY_KEY],
          }),
        ]);
      } catch {
        setHiddenLockerIds((current) => {
          const next = new Set(current);
          next.delete(lockerId);
          return next;
        });
        setErrorMessage("delete_failed");
      }
    },
    [queryClient, userId],
  );

  const clearPendingTimer = useCallback(() => {
    const pending = pendingRemovalRef.current;
    if (!pending) return null;

    window.clearTimeout(pending.timeoutId);
    pendingRemovalRef.current = null;
    setUndoItem(null);
    return pending.item;
  }, []);

  const commitPendingRemoval = useCallback(async () => {
    const item = clearPendingTimer();
    if (!item) return;
    await deleteFavoriteLocker(item.lockerId);
  }, [clearPendingTimer, deleteFavoriteLocker]);

  useEffect(
    () => () => {
      void commitPendingRemoval();
    },
    [commitPendingRemoval],
  );

  const requestRemoval = useCallback(
    (item: FavoriteLockerListItem, index: number) => {
      void commitPendingRemoval();
      setErrorMessage(null);
      setHiddenLockerIds((current) => new Set(current).add(item.lockerId));
      setUndoItem(item);

      const timeoutId = window.setTimeout(() => {
        pendingRemovalRef.current = null;
        setUndoItem(null);
        void deleteFavoriteLocker(item.lockerId);
      }, UNDO_TIMEOUT_MS);

      pendingRemovalRef.current = { item, index, timeoutId };
    },
    [commitPendingRemoval, deleteFavoriteLocker],
  );

  const undoRemoval = useCallback(() => {
    const pending = pendingRemovalRef.current;
    if (!pending) return;

    clearPendingTimer();
    setHiddenLockerIds((current) => {
      const next = new Set(current);
      next.delete(pending.item.lockerId);
      return next;
    });
  }, [clearPendingTimer]);

  const visibleItems =
    listQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const filteredItems = visibleItems.filter(
    (item) => !hiddenLockerIds.has(item.lockerId),
  );

  return {
    listQuery,
    filteredItems,
    totalCount: listQuery.data?.pages[0]?.totalCount ?? 0,
    undoItem,
    errorMessage,
    setErrorMessage,
    requestRemoval,
    undoRemoval,
  };
}
