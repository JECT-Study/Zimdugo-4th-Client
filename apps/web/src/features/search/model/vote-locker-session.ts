import type { LockerVoteType } from "#/shared/api/locker-votes";

export type EffectiveLockerVote = LockerVoteType | null;

export type LockerVoteServerState = {
  isAccurateVoted?: boolean;
  isInaccurateVoted?: boolean;
};

export type LockerVoteBaselineEntry = {
  vote: EffectiveLockerVote;
  accurateCount: number;
  inaccurateCount: number;
};

export type LockerVoteBaseline = Map<number, LockerVoteBaselineEntry>;
export type LockerVotePending = Map<number, EffectiveLockerVote>;

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

export function seedVoteBaseline(
  baseline: LockerVoteBaseline,
  lockerId: number,
  server: LockerVoteServerState & {
    accurateCount?: number;
    inaccurateCount?: number;
  },
  hasPending = false,
): void {
  if (baseline.has(lockerId) && hasPending) {
    return;
  }

  const previousEntry = baseline.get(lockerId);
  const hasExplicitVoteFlags =
    server.isAccurateVoted !== undefined ||
    server.isInaccurateVoted !== undefined;

  baseline.set(lockerId, {
    vote: hasExplicitVoteFlags
      ? serverVoteStateToEffective(server)
      : (previousEntry?.vote ?? serverVoteStateToEffective(server)),
    accurateCount: server.accurateCount ?? previousEntry?.accurateCount ?? 0,
    inaccurateCount:
      server.inaccurateCount ?? previousEntry?.inaccurateCount ?? 0,
  });
}

export function getEffectiveVote(
  pending: LockerVotePending,
  baseline: LockerVoteBaseline,
  lockerId: number,
  server?: LockerVoteServerState,
): EffectiveLockerVote {
  if (pending.has(lockerId)) {
    return pending.get(lockerId) ?? null;
  }

  const baselineEntry = baseline.get(lockerId);
  if (baselineEntry) {
    return baselineEntry.vote;
  }

  return server ? serverVoteStateToEffective(server) : null;
}

export function getEffectiveVoteFlags(
  pending: LockerVotePending,
  baseline: LockerVoteBaseline,
  lockerId: number,
  server?: LockerVoteServerState,
): Required<LockerVoteServerState> {
  return effectiveVoteToServerState(
    getEffectiveVote(pending, baseline, lockerId, server),
  );
}

export function toggleVotePending(
  baseline: LockerVoteBaseline,
  pending: LockerVotePending,
  lockerId: number,
  clicked: LockerVoteType,
  server?: LockerVoteServerState,
): LockerVotePending {
  const current = getEffectiveVote(pending, baseline, lockerId, server);
  const next: EffectiveLockerVote = current === clicked ? null : clicked;
  const baseVote =
    baseline.get(lockerId)?.vote ??
    (server ? serverVoteStateToEffective(server) : null);
  const nextPending = new Map(pending);

  if (next === baseVote) {
    nextPending.delete(lockerId);
  } else {
    nextPending.set(lockerId, next);
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
  baseline: LockerVoteBaseline,
  lockerId: number,
  server: LockerVoteServerState & {
    accurateCount?: number;
    inaccurateCount?: number;
  },
): { accurateCount?: number; inaccurateCount?: number } | null {
  if (
    server.accurateCount === undefined &&
    server.inaccurateCount === undefined &&
    !baseline.has(lockerId)
  ) {
    return null;
  }

  const hasBaselineEntry = baseline.has(lockerId);
  const baselineEntry = baseline.get(lockerId) ?? {
    vote: serverVoteStateToEffective(server),
    accurateCount: server.accurateCount ?? 0,
    inaccurateCount: server.inaccurateCount ?? 0,
  };
  const effectiveVote = getEffectiveVote(pending, baseline, lockerId, server);
  const delta = countDelta(baselineEntry.vote, effectiveVote);

  const accurateCount =
    !hasBaselineEntry && server.accurateCount === undefined
      ? undefined
      : Math.max(0, baselineEntry.accurateCount + delta.accurate);
  const inaccurateCount =
    !hasBaselineEntry && server.inaccurateCount === undefined
      ? undefined
      : Math.max(0, baselineEntry.inaccurateCount + delta.inaccurate);

  return {
    accurateCount,
    inaccurateCount,
  };
}

export function buildVoteFlushOperations(
  baseline: LockerVoteBaseline,
  pending: LockerVotePending,
): VoteFlushOperation[] {
  const operations: VoteFlushOperation[] = [];

  for (const [lockerId, nextVote] of pending) {
    const baseVote = baseline.get(lockerId)?.vote ?? null;
    if (nextVote === baseVote) {
      continue;
    }

    const voteType = nextVote ?? baseVote;
    if (voteType == null) {
      continue;
    }

    operations.push({ lockerId, voteType });
  }

  return operations;
}

export function applySuccessfulVoteFlush(
  baseline: LockerVoteBaseline,
  pending: LockerVotePending,
  succeededLockerIds: number[],
): { baseline: LockerVoteBaseline; pending: LockerVotePending } {
  const nextBaseline = new Map(baseline);
  const nextPending = new Map(pending);

  for (const lockerId of succeededLockerIds) {
    const nextVote = nextPending.get(lockerId);
    if (nextVote === undefined) {
      continue;
    }

    const currentBaseline = nextBaseline.get(lockerId);
    if (!currentBaseline) {
      continue;
    }

    const delta = countDelta(currentBaseline.vote, nextVote);
    nextBaseline.set(lockerId, {
      vote: nextVote,
      accurateCount: Math.max(0, currentBaseline.accurateCount + delta.accurate),
      inaccurateCount: Math.max(
        0,
        currentBaseline.inaccurateCount + delta.inaccurate,
      ),
    });
    nextPending.delete(lockerId);
  }

  return { baseline: nextBaseline, pending: nextPending };
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
