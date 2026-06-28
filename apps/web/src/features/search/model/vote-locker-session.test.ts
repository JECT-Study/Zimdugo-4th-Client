import { describe, expect, it } from "vitest";
import type {
  LockerVotePending,
  LockerVotePendingEntry,
} from "./vote-locker-session";
import {
  buildVoteFlushOperations,
  computeVoteDetailAfterFlush,
  effectiveVoteToServerState,
  getEffectiveVote,
  getEffectiveVoteCounts,
  getEffectiveVoteFlags,
  rollbackFailedVoteFlush,
  serverVoteStateToEffective,
  toggleVotePending,
} from "./vote-locker-session";

describe("vote-locker-session", () => {
  it("converts server boolean flags to effective vote", () => {
    expect(
      serverVoteStateToEffective({
        isAccurateVoted: true,
        isInaccurateVoted: false,
      }),
    ).toBe("CORRECT");
    expect(
      serverVoteStateToEffective({
        isAccurateVoted: false,
        isInaccurateVoted: true,
      }),
    ).toBe("INCORRECT");
    expect(
      serverVoteStateToEffective({
        isAccurateVoted: false,
        isInaccurateVoted: false,
      }),
    ).toBeNull();
  });

  it("keeps the server vote when the same vote is clicked again", () => {
    const pending = toggleVotePending(new Map(), 1, "CORRECT", {
      isAccurateVoted: true,
      isInaccurateVoted: false,
    });

    expect(pending.get(1)).toEqual({
      nextVote: null,
      serverVote: "CORRECT",
    });
  });

  it("uses the clicked vote when a different vote is selected", () => {
    const pending = toggleVotePending(new Map(), 1, "INCORRECT", {
      isAccurateVoted: true,
      isInaccurateVoted: false,
    });

    expect(
      getEffectiveVote(pending, 1, {
        isAccurateVoted: true,
        isInaccurateVoted: false,
      }),
    ).toBe("INCORRECT");
  });

  it("converts effective vote to UI flags", () => {
    const pending: LockerVotePending = new Map([
      [1, { nextVote: "CORRECT", serverVote: "INCORRECT" }],
    ]);

    expect(
      getEffectiveVoteFlags(pending, 1, {
        isAccurateVoted: false,
        isInaccurateVoted: true,
      }),
    ).toEqual(effectiveVoteToServerState("CORRECT"));
  });

  it("keeps undefined counts when server does not provide them", () => {
    expect(
      getEffectiveVoteCounts(new Map(), 1, {
        isAccurateVoted: false,
        isInaccurateVoted: false,
        accurateCount: 5,
      }),
    ).toEqual({
      accurateCount: 5,
      inaccurateCount: undefined,
    });
  });

  it("applies pending vote to counts optimistically", () => {
    const pending = toggleVotePending(new Map(), 1, "CORRECT", {
      isAccurateVoted: false,
      isInaccurateVoted: false,
    });

    expect(
      getEffectiveVoteCounts(pending, 1, {
        isAccurateVoted: false,
        isInaccurateVoted: false,
        accurateCount: 10,
        inaccurateCount: 2,
      }),
    ).toEqual({
      accurateCount: 11,
      inaccurateCount: 2,
    });
  });

  it("builds flush operations only for server differences", () => {
    const pending: LockerVotePending = new Map([
      [1, { nextVote: "CORRECT", serverVote: null }],
      [2, { nextVote: null, serverVote: "CORRECT" }],
    ]);
    expect(buildVoteFlushOperations(pending)).toEqual([
      { lockerId: 1, voteType: "CORRECT" },
      { lockerId: 2, voteType: "CORRECT" },
    ]);
  });

  it("keeps cancel operations when the server cache is missing", () => {
    const pending: LockerVotePending = new Map([
      [2, { nextVote: null, serverVote: "CORRECT" }],
    ]);

    expect(buildVoteFlushOperations(pending)).toEqual([
      { lockerId: 2, voteType: "CORRECT" },
    ]);
  });

  it("computes detail cache patch after flush", () => {
    expect(
      computeVoteDetailAfterFlush(
        {
          isAccurateVoted: false,
          isInaccurateVoted: false,
          accurateCount: 1,
          inaccurateCount: 0,
        },
        "CORRECT",
      ),
    ).toEqual({
      voteFlags: effectiveVoteToServerState("CORRECT"),
      accurateCount: 2,
      inaccurateCount: 0,
    });
  });

  it("rolls back unchanged failed pending entries", () => {
    const firstEntry: LockerVotePendingEntry = {
      nextVote: "CORRECT",
      serverVote: null,
    };
    const secondEntry: LockerVotePendingEntry = {
      nextVote: "INCORRECT",
      serverVote: null,
    };
    const pendingSnapshot: LockerVotePending = new Map([
      [1, firstEntry],
      [2, secondEntry],
    ]);
    const pending = new Map(pendingSnapshot);

    expect(
      rollbackFailedVoteFlush(pending, [1], pendingSnapshot).get(1),
    ).toBeUndefined();
    expect(rollbackFailedVoteFlush(pending, [1], pendingSnapshot).get(2)).toBe(
      secondEntry,
    );
  });

  it("keeps pending entries changed after failed flush started", () => {
    const changedEntry: LockerVotePendingEntry = {
      nextVote: "INCORRECT",
      serverVote: null,
    };
    const pendingSnapshot: LockerVotePending = new Map([
      [1, { nextVote: "CORRECT", serverVote: null }],
    ]);
    const pending: LockerVotePending = new Map([[1, changedEntry]]);

    expect(rollbackFailedVoteFlush(pending, [1], pendingSnapshot).get(1)).toBe(
      changedEntry,
    );
  });
});
