export type FavoriteLockerPending = Map<number, boolean>;

export type FavoriteFlushOperation = {
  lockerId: number;
  action: "add" | "remove";
};

export function getEffectiveFavorite(
  pending: FavoriteLockerPending,
  lockerId: number,
  serverIsFavorite: boolean | undefined,
): boolean {
  if (pending.has(lockerId)) {
    return pending.get(lockerId) ?? false;
  }

  return serverIsFavorite ?? false;
}

export function toggleFavoritePending(
  pending: FavoriteLockerPending,
  lockerId: number,
  next: boolean,
  serverIsFavorite: boolean | undefined,
): FavoriteLockerPending {
  const nextPending = new Map(pending);
  const server = serverIsFavorite ?? false;

  if (next === server) {
    nextPending.delete(lockerId);
  } else {
    nextPending.set(lockerId, next);
  }

  return nextPending;
}

export function buildFavoriteFlushOperations(
  pending: FavoriteLockerPending,
  serverByLockerId: Map<number, boolean>,
): FavoriteFlushOperation[] {
  const operations: FavoriteFlushOperation[] = [];

  for (const [lockerId, next] of pending) {
    const server = serverByLockerId.get(lockerId);
    if (server === undefined) {
      operations.push({
        lockerId,
        action: next ? "add" : "remove",
      });
      continue;
    }

    if (next === server) {
      continue;
    }

    operations.push({
      lockerId,
      action: next ? "add" : "remove",
    });
  }

  return operations;
}

export function rollbackFailedFlush(
  pending: FavoriteLockerPending,
  failedLockerIds: number[],
): FavoriteLockerPending {
  const nextPending = new Map(pending);

  for (const lockerId of failedLockerIds) {
    nextPending.delete(lockerId);
  }

  return nextPending;
}
