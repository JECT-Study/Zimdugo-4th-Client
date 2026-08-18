import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import type { SearchLockerResultItem } from "#/composites/search/search-list-model";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import {
  addFavoriteLocker,
  removeFavoriteLocker,
} from "#/shared/api/favorite-lockers";
import { getAuthQueryCacheScope } from "#/shared/lib/auth-query-cache-scope";
import { useAuthPopupStore } from "#/shared/store/authPopupStore";
import { useAuthStore } from "#/shared/store/authStore";
import { collectServerFavoriteByLockerId } from "../lib/collect-server-favorite-state";
import {
  cancelFavoriteQueryCaches,
  patchFavoriteInQueryCaches,
} from "../lib/patch-favorite-query-cache";
import {
  buildFavoriteFlushOperations,
  type FavoriteLockerPending,
  getEffectiveFavorite,
  rollbackFailedFlush,
  toggleFavoritePending,
} from "../model/favorite-locker-session";

export function useFavoriteLockerSession() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.userId);
  const accessToken = useAuthStore((state) => state.getAccessToken());
  const openAuthPopup = useAuthPopupStore((state) => state.openPopup);
  const [pending, setPending] = useState<FavoriteLockerPending>(
    () => new Map(),
  );
  const pendingRef = useRef(pending);
  const detailRequestChainsRef = useRef<Map<number, Promise<void>>>(new Map());
  const detailRequestVersionsRef = useRef<Map<number, number>>(new Map());
  const confirmedDetailFavoriteRef = useRef<Map<number, boolean>>(new Map());
  const authScope = getAuthQueryCacheScope(isAuthenticated, userId);
  pendingRef.current = pending;

  const awaitDetailFavoriteRequests =
    useCallback(async (): Promise<boolean> => {
      let hadChanges = false;

      while (detailRequestChainsRef.current.size > 0) {
        hadChanges = true;
        await Promise.allSettled(detailRequestChainsRef.current.values());
      }

      return hadChanges;
    }, []);

  const getEffectiveIsFavorite = useCallback(
    (lockerId: number, serverIsFavorite?: boolean) =>
      getEffectiveFavorite(pending, lockerId, serverIsFavorite),
    [pending],
  );

  const toggle = useCallback(
    (lockerId: number, next: boolean, serverIsFavorite?: boolean): boolean => {
      if (!isAuthenticated || accessToken == null) {
        openAuthPopup("/");
        return false;
      }

      setPending((currentPending) =>
        toggleFavoritePending(currentPending, lockerId, next, serverIsFavorite),
      );
      return true;
    },
    [accessToken, isAuthenticated, openAuthPopup],
  );

  const flush = useCallback(async (): Promise<{ hadChanges: boolean }> => {
    const currentPending = pendingRef.current;
    const detailFlushPromise = awaitDetailFavoriteRequests();

    if (!isAuthenticated || accessToken == null || currentPending.size === 0) {
      return { hadChanges: await detailFlushPromise };
    }

    const serverByLockerId = collectServerFavoriteByLockerId(
      queryClient,
      currentPending.keys(),
      authScope,
    );
    const operations = buildFavoriteFlushOperations(
      currentPending,
      serverByLockerId,
    );

    if (operations.length === 0) {
      setPending(new Map());
      return { hadChanges: await detailFlushPromise };
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
      await Promise.all(
        succeededLockerIds.map((lockerId) =>
          cancelFavoriteQueryCaches(queryClient, lockerId, authScope),
        ),
      );

      for (const lockerId of succeededLockerIds) {
        const nextFavorite = pendingSnapshot.get(lockerId);
        if (nextFavorite === undefined) {
          continue;
        }

        patchFavoriteInQueryCaches(
          queryClient,
          lockerId,
          nextFavorite,
          authScope,
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
        rollbackFailedFlush(latestPending, failedLockerIds, pendingSnapshot),
      );
    }

    await detailFlushPromise;
    return { hadChanges: true };
  }, [
    accessToken,
    authScope,
    awaitDetailFavoriteRequests,
    isAuthenticated,
    queryClient,
  ]);

  const handleSearchFavoriteChange = useCallback(
    (item: SearchLockerResultItem, next: boolean) => {
      const serverIsFavorite = collectServerFavoriteByLockerId(
        queryClient,
        [item.lockerId],
        authScope,
      ).get(item.lockerId);

      toggle(item.lockerId, next, serverIsFavorite);
    },
    [authScope, queryClient, toggle],
  );

  const handleDetailFavoriteChange = useCallback(
    async (
      item: LockerDetailItem,
      next: boolean,
      serverIsFavorite?: boolean,
    ) => {
      if (!isAuthenticated || accessToken == null) {
        openAuthPopup("/");
        return;
      }

      const serverFavorite = serverIsFavorite ?? false;

      if (pendingRef.current.has(item.lockerId)) {
        const updatedPending = new Map(pendingRef.current);
        updatedPending.delete(item.lockerId);
        pendingRef.current = updatedPending;
        setPending(updatedPending);
      }

      if (next === serverFavorite) {
        return;
      }

      const lockerId = item.lockerId;
      const previousRequest = detailRequestChainsRef.current.get(lockerId);
      const requestVersion =
        (detailRequestVersionsRef.current.get(lockerId) ?? 0) + 1;
      detailRequestVersionsRef.current.set(lockerId, requestVersion);

      if (!previousRequest) {
        confirmedDetailFavoriteRef.current.set(lockerId, serverFavorite);
      }

      const request = (async () => {
        await cancelFavoriteQueryCaches(queryClient, lockerId, authScope);

        if (detailRequestVersionsRef.current.get(lockerId) === requestVersion) {
          patchFavoriteInQueryCaches(queryClient, lockerId, next, authScope);
        }

        await previousRequest;

        const confirmedFavorite =
          confirmedDetailFavoriteRef.current.get(lockerId) ?? serverFavorite;

        if (confirmedFavorite === next) {
          return;
        }

        try {
          if (next) {
            await addFavoriteLocker(lockerId);
          } else {
            await removeFavoriteLocker(lockerId);
          }
          confirmedDetailFavoriteRef.current.set(lockerId, next);
        } catch {
          if (
            detailRequestVersionsRef.current.get(lockerId) === requestVersion
          ) {
            patchFavoriteInQueryCaches(
              queryClient,
              lockerId,
              confirmedFavorite,
              authScope,
            );
          }
        }
      })();
      const trackedRequest = request.finally(() => {
        if (detailRequestChainsRef.current.get(lockerId) !== trackedRequest) {
          return;
        }

        detailRequestChainsRef.current.delete(lockerId);
        detailRequestVersionsRef.current.delete(lockerId);
        confirmedDetailFavoriteRef.current.delete(lockerId);
      });
      detailRequestChainsRef.current.set(lockerId, trackedRequest);

      await trackedRequest;
    },
    [accessToken, authScope, isAuthenticated, openAuthPopup, queryClient],
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
