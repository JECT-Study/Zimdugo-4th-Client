import { describe, expect, it } from "vitest";
import type { LockerVotePending, EffectiveLockerVote } from "./vote-locker-session";
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
  it("서버 boolean 플래그를 effective vote로 변환한다", () => {
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

  it("동일 투표를 다시 누르면 pending에서 취소한다", () => {
    const pending = toggleVotePending(new Map(), 1, "CORRECT", {
      isAccurateVoted: true,
      isInaccurateVoted: false,
    });

    expect(pending.get(1)).toBeNull();
  });

  it("다른 투표를 누르면 pending을 변경한다", () => {
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

  it("effective vote를 UI boolean 플래그로 변환한다", () => {
    const pending = new Map([[1, "CORRECT" as const]]);

    expect(
      getEffectiveVoteFlags(pending, 1, {
        isAccurateVoted: false,
        isInaccurateVoted: true,
      }),
    ).toEqual(effectiveVoteToServerState("CORRECT"));
  });

  it("서버가 제공하지 않은 카운트는 overlay에서 undefined를 유지한다", () => {
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

  it("pending overlay가 카운트를 낙관적으로 반영한다", () => {
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

  it("flush 시 서버 대비 변경분만 압축한다", () => {
    const pending: LockerVotePending = new Map([
      [1, "CORRECT"],
      [2, null],
    ]);
    const serverByLockerId = new Map<number, EffectiveLockerVote>([
      [1, null],
      [2, "CORRECT"],
    ]);

    expect(buildVoteFlushOperations(pending, serverByLockerId)).toEqual([
      { lockerId: 1, voteType: "CORRECT" },
      { lockerId: 2, voteType: "CORRECT" },
    ]);
  });

  it("flush 후 상세 캐시 패치 값을 계산한다", () => {
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

  it("flush 실패 locker는 flush 시작 시점과 동일한 pending만 롤백한다", () => {
    const pendingSnapshot: LockerVotePending = new Map([
      [1, "CORRECT"],
      [2, "INCORRECT"],
    ]);
    const pending = new Map(pendingSnapshot);

    expect(
      rollbackFailedVoteFlush(pending, [1], pendingSnapshot).get(1),
    ).toBeUndefined();
    expect(
      rollbackFailedVoteFlush(pending, [1], pendingSnapshot).get(2),
    ).toBe("INCORRECT");
  });

  it("flush 실패 후 변경된 pending은 유지한다", () => {
    const pendingSnapshot: LockerVotePending = new Map([[1, "CORRECT"]]);
    const pending: LockerVotePending = new Map([[1, "INCORRECT"]]);

    expect(
      rollbackFailedVoteFlush(pending, [1], pendingSnapshot).get(1),
    ).toBe("INCORRECT");
  });
});
