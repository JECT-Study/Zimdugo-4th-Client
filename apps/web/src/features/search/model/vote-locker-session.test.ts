import { describe, expect, it } from "vitest";
import {
  applySuccessfulVoteFlush,
  buildVoteFlushOperations,
  effectiveVoteToServerState,
  getEffectiveVote,
  getEffectiveVoteCounts,
  getEffectiveVoteFlags,
  rollbackFailedVoteFlush,
  seedVoteBaseline,
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

  it("서버가 투표 플래그를 생략하면 기존 baseline 투표 상태를 유지한다", () => {
    const baseline = new Map([
      [
        1,
        { vote: "CORRECT" as const, accurateCount: 3, inaccurateCount: 1 },
      ],
    ]);

    seedVoteBaseline(
      baseline,
      1,
      {
        accurateCount: 4,
        inaccurateCount: 1,
      },
      false,
    );

    expect(baseline.get(1)).toEqual({
      vote: "CORRECT",
      accurateCount: 4,
      inaccurateCount: 1,
    });
  });

  it("펜딩 중인 변경 사항이 없을 때만 서버 투표 상태로 baseline을 갱신한다", () => {
    const baseline = new Map();

    seedVoteBaseline(
      baseline,
      1,
      {
        isAccurateVoted: true,
        isInaccurateVoted: false,
        accurateCount: 3,
        inaccurateCount: 1,
      },
      false,
    );

    seedVoteBaseline(
      baseline,
      1,
      {
        isAccurateVoted: false,
        isInaccurateVoted: true,
        accurateCount: 99,
        inaccurateCount: 99,
      },
      false,
    );

    expect(baseline.get(1)).toEqual({
      vote: "INCORRECT",
      accurateCount: 99,
      inaccurateCount: 99,
    });

    seedVoteBaseline(
      baseline,
      1,
      {
        isAccurateVoted: true,
        isInaccurateVoted: false,
        accurateCount: 3,
        inaccurateCount: 1,
      },
      true,
    );

    expect(baseline.get(1)).toEqual({
      vote: "INCORRECT",
      accurateCount: 99,
      inaccurateCount: 99,
    });
  });

  it("동일 투표를 다시 누르면 pending에서 취소한다", () => {
    const baseline = new Map([
      [
        1,
        { vote: "CORRECT" as const, accurateCount: 3, inaccurateCount: 0 },
      ],
    ]);
    const pending = toggleVotePending(
      baseline,
      new Map(),
      1,
      "CORRECT",
      { isAccurateVoted: true, isInaccurateVoted: false },
    );

    expect(pending.get(1)).toBeNull();
  });

  it("다른 투표를 누르면 pending을 변경한다", () => {
    const baseline = new Map([
      [
        1,
        { vote: "CORRECT" as const, accurateCount: 3, inaccurateCount: 0 },
      ],
    ]);
    const pending = toggleVotePending(
      baseline,
      new Map(),
      1,
      "INCORRECT",
      { isAccurateVoted: true, isInaccurateVoted: false },
    );

    expect(
      getEffectiveVote(pending, baseline, 1, {
        isAccurateVoted: true,
        isInaccurateVoted: false,
      }),
    ).toBe("INCORRECT");
  });

  it("effective vote를 UI boolean 플래그로 변환한다", () => {
    const baseline = new Map([
      [1, { vote: "INCORRECT" as const, accurateCount: 1, inaccurateCount: 2 }],
    ]);
    const pending = new Map([[1, "CORRECT" as const]]);

    expect(
      getEffectiveVoteFlags(pending, baseline, 1, {
        isAccurateVoted: false,
        isInaccurateVoted: true,
      }),
    ).toEqual(effectiveVoteToServerState("CORRECT"));
  });

  it("서버가 제공하지 않은 카운트는 overlay에서 undefined를 유지한다", () => {
    expect(
      getEffectiveVoteCounts(new Map(), new Map(), 1, {
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
    const baseline = new Map([
      [1, { vote: null, accurateCount: 10, inaccurateCount: 2 }],
    ]);
    const pending = toggleVotePending(
      baseline,
      new Map(),
      1,
      "CORRECT",
      { isAccurateVoted: false, isInaccurateVoted: false },
    );

    expect(
      getEffectiveVoteCounts(pending, baseline, 1, {
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

  it("flush 시 baseline 대비 변경분만 압축한다", () => {
    const baseline = new Map([
      [1, { vote: null, accurateCount: 1, inaccurateCount: 0 }],
      [2, { vote: "CORRECT" as const, accurateCount: 2, inaccurateCount: 0 }],
    ]);
    const pending = new Map([
      [1, "CORRECT"],
      [2, null],
    ]);

    expect(buildVoteFlushOperations(baseline, pending)).toEqual([
      { lockerId: 1, voteType: "CORRECT" },
      { lockerId: 2, voteType: "CORRECT" },
    ]);
  });

  it("flush 성공 시 baseline과 pending을 갱신한다", () => {
    const baseline = new Map([
      [1, { vote: null, accurateCount: 1, inaccurateCount: 0 }],
    ]);
    const pending = new Map([[1, "CORRECT"]]);

    const next = applySuccessfulVoteFlush(baseline, pending, [1]);

    expect(next.baseline.get(1)).toEqual({
      vote: "CORRECT",
      accurateCount: 2,
      inaccurateCount: 0,
    });
    expect(next.pending.size).toBe(0);
  });

  it("flush 실패 locker는 flush 시작 시점과 동일한 pending만 롤백한다", () => {
    const pendingSnapshot = new Map([
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
    const pendingSnapshot = new Map([[1, "CORRECT"]]);
    const pending = new Map([[1, "INCORRECT"]]);

    expect(
      rollbackFailedVoteFlush(pending, [1], pendingSnapshot).get(1),
    ).toBe("INCORRECT");
  });
});
