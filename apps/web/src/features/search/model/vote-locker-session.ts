import type { LockerVoteType } from "#/shared/api/locker-votes";

export type EffectiveLockerVote = LockerVoteType | null;

export type LockerVoteServerState = {
  isAccurateVoted?: boolean;
  isInaccurateVoted?: boolean;
};

export interface LockerVotePendingEntry {
  nextVote: EffectiveLockerVote;
  serverVote: EffectiveLockerVote;
}

export type LockerVotePending = Map<number, LockerVotePendingEntry>;

export type VoteFlushOperation = {
  lockerId: number;
  voteType: LockerVoteType;
};

export function serverVoteStateToEffective(
  server: LockerVoteServerState,
): EffectiveLockerVote {
  if (server.isAccurateVoted) {
    return "CORRECT";
  }

  if (server.isInaccurateVoted) {
    return "INCORRECT";
  }

  return null;
}

export function effectiveVoteToServerState(
  vote: EffectiveLockerVote,
): Required<LockerVoteServerState> {
  return {
    isAccurateVoted: vote === "CORRECT",
    isInaccurateVoted: vote === "INCORRECT",
  };
}

export function getEffectiveVote(
  pending: LockerVotePending,
  lockerId: number,
  server?: LockerVoteServerState,
): EffectiveLockerVote {
  if (pending.has(lockerId)) {
    return pending.get(lockerId)?.nextVote ?? null;
  }

  return server ? serverVoteStateToEffective(server) : null;
}

export function getEffectiveVoteFlags(
  pending: LockerVotePending,
  lockerId: number,
  server?: LockerVoteServerState,
): Required<LockerVoteServerState> {
  return effectiveVoteToServerState(
    getEffectiveVote(pending, lockerId, server),
  );
}

export function toggleVotePending(
  pending: LockerVotePending,
  lockerId: number,
  clicked: LockerVoteType,
  server?: LockerVoteServerState,
): LockerVotePending {
  const serverVote = server ? serverVoteStateToEffective(server) : null;
  const pendingEntry = pending.get(lockerId);
  const current = getEffectiveVote(pending, lockerId, server);
  const next: EffectiveLockerVote = current === clicked ? null : clicked;
  const nextPending = new Map(pending);
  const referenceServerVote = pendingEntry
    ? pendingEntry.serverVote
    : serverVote;

  if (next === referenceServerVote) {
    nextPending.delete(lockerId);
  } else {
    nextPending.set(lockerId, {
      nextVote: next,
      serverVote: referenceServerVote,
    });
  }

  return nextPending;
}

const countDelta = (
  from: EffectiveLockerVote,
  to: EffectiveLockerVote,
): { accurate: number; inaccurate: number } => {
  let accurate = 0;
  let inaccurate = 0;

  if (from === "CORRECT") {
    accurate -= 1;
  }
  if (from === "INCORRECT") {
    inaccurate -= 1;
  }
  if (to === "CORRECT") {
    accurate += 1;
  }
  if (to === "INCORRECT") {
    inaccurate += 1;
  }

  return { accurate, inaccurate };
};

export function getEffectiveVoteCounts(
  pending: LockerVotePending,
  lockerId: number,
  server: LockerVoteServerState & {
    accurateCount?: number;
    inaccurateCount?: number;
  },
): { accurateCount?: number; inaccurateCount?: number } | null {
  if (!pending.has(lockerId)) {
    if (
      server.accurateCount === undefined &&
      server.inaccurateCount === undefined
    ) {
      return null;
    }

    return {
      accurateCount: server.accurateCount,
      inaccurateCount: server.inaccurateCount,
    };
  }

  const serverVote = serverVoteStateToEffective(server);
  const effectiveVote = pending.get(lockerId)?.nextVote ?? null;
  const delta = countDelta(serverVote, effectiveVote);

  const accurateCount =
    server.accurateCount === undefined
      ? undefined
      : Math.max(0, (server.accurateCount ?? 0) + delta.accurate);
  const inaccurateCount =
    server.inaccurateCount === undefined
      ? undefined
      : Math.max(0, (server.inaccurateCount ?? 0) + delta.inaccurate);

  return {
    accurateCount,
    inaccurateCount,
  };
}

export function buildVoteFlushOperations(
  pending: LockerVotePending,
): VoteFlushOperation[] {
  const operations: VoteFlushOperation[] = [];

  for (const [lockerId, pendingEntry] of pending) {
    const nextVote = pendingEntry.nextVote;
    const serverVote = pendingEntry.serverVote;
    if (nextVote === serverVote) {
      continue;
    }

    const voteType = nextVote ?? serverVote;
    if (voteType == null) {
      continue;
    }

    operations.push({ lockerId, voteType });
  }

  return operations;
}

export function computeVoteDetailAfterFlush(
  server: LockerVoteServerState & {
    accurateCount?: number;
    inaccurateCount?: number;
  },
  pendingVote: EffectiveLockerVote,
): {
  voteFlags: Required<LockerVoteServerState>;
  accurateCount?: number;
  inaccurateCount?: number;
} {
  const serverVote = serverVoteStateToEffective(server);
  const delta = countDelta(serverVote, pendingVote);

  return {
    voteFlags: effectiveVoteToServerState(pendingVote),
    accurateCount:
      server.accurateCount === undefined
        ? undefined
        : Math.max(0, (server.accurateCount ?? 0) + delta.accurate),
    inaccurateCount:
      server.inaccurateCount === undefined
        ? undefined
        : Math.max(0, (server.inaccurateCount ?? 0) + delta.inaccurate),
  };
}

export function rollbackFailedVoteFlush(
  pending: LockerVotePending,
  failedLockerIds: number[],
  pendingSnapshot: LockerVotePending,
): LockerVotePending {
  const nextPending = new Map(pending);

  for (const lockerId of failedLockerIds) {
    if (nextPending.get(lockerId) === pendingSnapshot.get(lockerId)) {
      nextPending.delete(lockerId);
    }
  }

  return nextPending;
}
