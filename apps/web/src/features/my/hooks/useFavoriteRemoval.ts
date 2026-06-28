import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFavoriteLockerSession } from "#/features/search/hooks/useFavoriteLockerSession";
import type { FavoriteLockerListItem } from "#/shared/api/my-page";
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
  const listQuery = useFavoriteLockerList();
  const {
    pending,
    flush,
    getEffectiveIsFavorite,
    toggle,
  } = useFavoriteLockerSession();
  const [hiddenLockerIds, setHiddenLockerIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [undoItem, setUndoItem] = useState<FavoriteLockerListItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pendingRemovalRef = useRef<PendingFavoriteRemoval | null>(null);

  const invalidateMyFavoriteQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [FAVORITE_LOCKER_LIST_QUERY_KEY],
      }),
      queryClient.invalidateQueries({
        queryKey: [MY_PAGE_SUMMARY_QUERY_KEY],
      }),
    ]);
  }, [queryClient]);

  const deleteFavoriteLocker = useCallback(
    async (lockerId: number) => {
      const wasPendingRemove = pending.get(lockerId) === false;

      if (!wasPendingRemove && pending.size === 0) {
        return;
      }

      await flush();

      if (!wasPendingRemove) {
        return;
      }

      const removeSucceeded =
        getEffectiveIsFavorite(lockerId, true) === false;

      if (removeSucceeded) {
        await invalidateMyFavoriteQueries();
        return;
      }

      setHiddenLockerIds((current) => {
        const next = new Set(current);
        next.delete(lockerId);
        return next;
      });
      setErrorMessage("delete_failed");
    },
    [pending, flush, getEffectiveIsFavorite, invalidateMyFavoriteQueries],
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

  const commitPendingRemovalRef = useRef(commitPendingRemoval);

  useEffect(() => {
    commitPendingRemovalRef.current = commitPendingRemoval;
  }, [commitPendingRemoval]);

  useEffect(
    () => () => {
      void commitPendingRemovalRef.current();
    },
    [],
  );

  const requestRemoval = useCallback(
    (item: FavoriteLockerListItem, index: number) => {
      void commitPendingRemoval();
      setErrorMessage(null);

      if (!toggle(item.lockerId, false, true)) {
        return;
      }

      setHiddenLockerIds((current) => new Set(current).add(item.lockerId));
      setUndoItem(item);

      const timeoutId = window.setTimeout(() => {
        pendingRemovalRef.current = null;
        setUndoItem(null);
        void deleteFavoriteLocker(item.lockerId);
      }, UNDO_TIMEOUT_MS);

      pendingRemovalRef.current = { item, index, timeoutId };
    },
    [commitPendingRemoval, deleteFavoriteLocker, toggle],
  );

  const undoRemoval = useCallback(() => {
    const pending = pendingRemovalRef.current;
    if (!pending) return;

    clearPendingTimer();
    toggle(pending.item.lockerId, true, true);
    setHiddenLockerIds((current) => {
      const next = new Set(current);
      next.delete(pending.item.lockerId);
      return next;
    });
  }, [clearPendingTimer, toggle]);

  const handleFavoriteChange = useCallback(
    (item: FavoriteLockerListItem, index: number, next: boolean) => {
      if (next) {
        toggle(item.lockerId, true, true);
        return;
      }

      requestRemoval(item, index);
    },
    [requestRemoval, toggle],
  );

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
    getEffectiveIsFavorite,
    handleFavoriteChange,
    undoRemoval,
  };
}
