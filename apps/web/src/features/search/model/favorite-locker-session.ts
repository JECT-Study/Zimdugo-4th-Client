export type FavoriteLockerBaseline = Map<number, boolean>;
export type FavoriteLockerPending = Map<number, boolean>;

export type FavoriteFlushOperation = {
  lockerId: number;
  action: "add" | "remove";
};

export function seedFavoriteBaseline(
  baseline: FavoriteLockerBaseline,
  lockerId: number,
  serverIsFavorite: boolean | undefined,
): void {
  if (!baseline.has(lockerId)) {
    baseline.set(lockerId, serverIsFavorite ?? false);
  }
}

export function toggleFavoritePending(
  baseline: FavoriteLockerBaseline,
  pending: FavoriteLockerPending,
  lockerId: number,
  next: boolean,
): FavoriteLockerPending {
  const nextPending = new Map(pending);
  const base = baseline.get(lockerId) ?? false;

  if (next === base) {
    nextPending.delete(lockerId);
  } else {
    nextPending.set(lockerId, next);
  }

  return nextPending;
}

export function getEffectiveFavorite(
  pending: FavoriteLockerPending,
  baseline: FavoriteLockerBaseline,
  lockerId: number,
  serverIsFavorite: boolean | undefined,
): boolean {
  if (pending.has(lockerId)) {
    return pending.get(lockerId) ?? false;
  }

  if (baseline.has(lockerId)) {
    return baseline.get(lockerId) ?? false;
  }

  return serverIsFavorite ?? false;
}

export function buildFavoriteFlushOperations(
  baseline: FavoriteLockerBaseline,
  pending: FavoriteLockerPending,
): FavoriteFlushOperation[] {
  const operations: FavoriteFlushOperation[] = [];

  for (const [lockerId, next] of pending) {
    const base = baseline.get(lockerId) ?? false;
    if (next === base) {
      continue;
    }

    operations.push({
      lockerId,
      action: next ? "add" : "remove",
    });
  }

  return operations;
}

export function applySuccessfulFlush(
  baseline: FavoriteLockerBaseline,
  pending: FavoriteLockerPending,
  succeededLockerIds: number[],
): { baseline: FavoriteLockerBaseline; pending: FavoriteLockerPending } {
  const nextBaseline = new Map(baseline);
  const nextPending = new Map(pending);

  for (const lockerId of succeededLockerIds) {
    const nextValue = nextPending.get(lockerId);
    if (nextValue === undefined) {
      continue;
    }

    nextBaseline.set(lockerId, nextValue);
    nextPending.delete(lockerId);
  }

  return { baseline: nextBaseline, pending: nextPending };
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
