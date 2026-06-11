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

  const clearPendingRemoval = useCallback(() => {
    const pending = pendingRemovalRef.current;
    if (!pending) return;
    window.clearTimeout(pending.timeoutId);
    pendingRemovalRef.current = null;
    setUndoItem(null);
  }, []);

  useEffect(() => () => clearPendingRemoval(), [clearPendingRemoval]);

  const flushRemoval = useCallback(
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
        const pending = pendingRemovalRef.current;
        if (pending?.item.lockerId === lockerId) {
          setHiddenLockerIds((current) => {
            const next = new Set(current);
            next.delete(lockerId);
            return next;
          });
          setErrorMessage("delete_failed");
        }
      }
    },
    [queryClient, userId],
  );

  const requestRemoval = useCallback(
    (item: FavoriteLockerListItem, index: number) => {
      clearPendingRemoval();
      setErrorMessage(null);
      setHiddenLockerIds((current) => new Set(current).add(item.lockerId));
      setUndoItem(item);

      const timeoutId = window.setTimeout(() => {
        pendingRemovalRef.current = null;
        setUndoItem(null);
        void flushRemoval(item.lockerId);
      }, UNDO_TIMEOUT_MS);

      pendingRemovalRef.current = { item, index, timeoutId };
    },
    [clearPendingRemoval, flushRemoval],
  );

  const undoRemoval = useCallback(() => {
    const pending = pendingRemovalRef.current;
    if (!pending) return;

    clearPendingRemoval();
    setHiddenLockerIds((current) => {
      const next = new Set(current);
      next.delete(pending.item.lockerId);
      return next;
    });
  }, [clearPendingRemoval]);

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
