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
  it("서버가 준 불리언을 실제 투표 값으로 바꾼다", () => {
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

  it("같은 투표를 다시 누르면 서버 값을 유지한다", () => {
    const pending = toggleVotePending(new Map(), 1, "CORRECT", {
      isAccurateVoted: true,
      isInaccurateVoted: false,
    });

    expect(pending.get(1)).toEqual({
      nextVote: null,
      serverVote: "CORRECT",
    });
  });

  it("다른 투표를 고르면 누른 쪽을 쓴다", () => {
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

  it("실제 투표 값을 화면용 플래그로 바꾼다", () => {
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

  it("서버가 개수를 주지 않으면 비운 채로 둔다", () => {
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

  it("대기 중인 투표를 개수에 미리 반영한다", () => {
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

  it("서버와 다른 것만 반영 작업으로 만든다", () => {
    const pending: LockerVotePending = new Map([
      [1, { nextVote: "CORRECT", serverVote: null }],
      [2, { nextVote: null, serverVote: "CORRECT" }],
    ]);
    expect(buildVoteFlushOperations(pending)).toEqual([
      { lockerId: 1, voteType: "CORRECT" },
      { lockerId: 2, voteType: "CORRECT" },
    ]);
  });

  it("서버 캐시가 없어도 취소 작업은 남긴다", () => {
    const pending: LockerVotePending = new Map([
      [2, { nextVote: null, serverVote: "CORRECT" }],
    ]);

    expect(buildVoteFlushOperations(pending)).toEqual([
      { lockerId: 2, voteType: "CORRECT" },
    ]);
  });

  it("반영 뒤 상세 캐시에 적용할 값을 계산한다", () => {
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

  it("실패한 뒤 그대로인 대기 항목은 되돌린다", () => {
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

  it("반영이 실패해도 그 뒤에 바뀐 대기 항목은 남긴다", () => {
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
