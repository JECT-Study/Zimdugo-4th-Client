import { describe, expect, it } from "vitest";
import {
  applySuccessfulFlush,
  buildFavoriteFlushOperations,
  getEffectiveFavorite,
  rollbackFailedFlush,
  seedFavoriteBaseline,
  toggleFavoritePending,
} from "./favorite-locker-session";

describe("favorite-locker-session", () => {
  it("baseline이 없을 때만 서버 isFavorite로 시드한다", () => {
    const baseline = new Map<number, boolean>();

    seedFavoriteBaseline(baseline, 1, false);
    seedFavoriteBaseline(baseline, 1, true);

    expect(baseline.get(1)).toBe(false);
  });

  it("flush 후 stale 서버 isFavorite로 baseline을 덮어쓰지 않는다", () => {
    const baseline = new Map<number, boolean>([[1, true]]);

    seedFavoriteBaseline(baseline, 1, false);

    expect(baseline.get(1)).toBe(true);
  });

  it("pending overlay가 baseline·서버 isFavorite보다 우선한다", () => {
    const pending = new Map([[2, true]]);
    const baseline = new Map([[2, false]]);

    expect(getEffectiveFavorite(pending, baseline, 2, false)).toBe(true);
  });

  it("pending이 없으면 baseline이 서버 isFavorite보다 우선한다", () => {
    const pending = new Map<number, boolean>();
    const baseline = new Map([[1, true]]);

    expect(getEffectiveFavorite(pending, baseline, 1, false)).toBe(true);
    expect(getEffectiveFavorite(pending, baseline, 2, true)).toBe(true);
  });

  it("baseline과 같아지면 pending에서 제거한다", () => {
    const baseline = new Map([[1, false]]);
    const pending = toggleFavoritePending(baseline, new Map(), 1, true);
    const settled = toggleFavoritePending(baseline, pending, 1, false);

    expect(settled.size).toBe(0);
  });

  it("flush 시 baseline 대비 변경분만 압축한다", () => {
    const baseline = new Map([
      [1, false],
      [2, true],
      [3, true],
    ]);
    const pending = new Map([
      [1, true],
      [2, true],
      [3, false],
    ]);

    expect(buildFavoriteFlushOperations(baseline, pending)).toEqual([
      { lockerId: 1, action: "add" },
      { lockerId: 3, action: "remove" },
    ]);
  });

  it("flush 성공 시 baseline을 갱신하고 pending을 비운다", () => {
    const baseline = new Map([[1, false]]);
    const pending = new Map([[1, true]]);

    const next = applySuccessfulFlush(baseline, pending, [1]);

    expect(next.baseline.get(1)).toBe(true);
    expect(next.pending.size).toBe(0);
  });

  it("flush 실패 locker는 pending에서 롤백한다", () => {
    const pending = new Map([
      [1, true],
      [2, false],
    ]);

    expect(rollbackFailedFlush(pending, [1]).get(1)).toBeUndefined();
    expect(rollbackFailedFlush(pending, [1]).get(2)).toBe(false);
  });
});
