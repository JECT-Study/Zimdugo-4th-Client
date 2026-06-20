import { describe, expect, it } from "vitest";
import {
  buildFavoriteFlushOperations,
  getEffectiveFavorite,
  rollbackFailedFlush,
  toggleFavoritePending,
} from "./favorite-locker-session";

describe("favorite-locker-session", () => {
  it("pending overlay가 서버 isFavorite보다 우선한다", () => {
    const pending = new Map([[2, true]]);

    expect(getEffectiveFavorite(pending, 2, false)).toBe(true);
  });

  it("pending이 없으면 서버 isFavorite를 사용한다", () => {
    const pending = new Map<number, boolean>();

    expect(getEffectiveFavorite(pending, 1, true)).toBe(true);
    expect(getEffectiveFavorite(pending, 2, false)).toBe(false);
  });

  it("서버와 같아지면 pending에서 제거한다", () => {
    const pending = toggleFavoritePending(new Map(), 1, true, false);
    const settled = toggleFavoritePending(pending, 1, false, false);

    expect(settled.size).toBe(0);
  });

  it("flush 시 서버 대비 변경분만 압축한다", () => {
    const pending = new Map([
      [1, true],
      [2, true],
      [3, false],
    ]);
    const serverByLockerId = new Map([
      [1, false],
      [2, true],
      [3, true],
    ]);

    expect(buildFavoriteFlushOperations(pending, serverByLockerId)).toEqual([
      { lockerId: 1, action: "add" },
      { lockerId: 3, action: "remove" },
    ]);
  });

  it("서버 상태를 알 수 없으면 pending 값으로 flush operation을 만든다", () => {
    const pending = new Map([[42, false]]);

    expect(buildFavoriteFlushOperations(pending, new Map())).toEqual([
      { lockerId: 42, action: "remove" },
    ]);
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
