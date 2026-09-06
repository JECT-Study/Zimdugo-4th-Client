// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const searchParams = vi.hoisted(() => ({
  current: {} as Record<string, unknown>,
}));

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => searchParams.current,
}));

const restored = vi.hoisted(() => ({ current: null as unknown }));

vi.mock("./map-sheet-session-storage", () => ({
  readRestoredSessionForTabReturn: () => restored.current,
}));

const { useMapEntryInputs } = await import("./useMapEntryInputs");

const SESSION = { mapPlaceId: 7, listKind: "place" } as never;

const read = (params: Record<string, unknown>) => {
  searchParams.current = params;
  return renderHook(() => useMapEntryInputs()).result.current;
};

beforeEach(() => {
  searchParams.current = {};
  restored.current = null;
});

afterEach(() => {
  cleanup();
});

describe("useMapEntryInputs", () => {
  it("빈 주소로 들어오면 아무 조건도 서지 않는다", () => {
    const inputs = read({});

    expect(inputs.lockerIdFromQuery).toBeUndefined();
    expect(inputs.hasExplicitLockerEntry).toBe(false);
    expect(inputs.hasSearchQueryEntry).toBe(false);
    expect(inputs.hasSearchPlaceEntry).toBe(false);
  });

  it("locker 로 들어오면 보관함을 가리킨 것으로 본다", () => {
    const inputs = read({ locker: "164" });

    expect(inputs.lockerIdFromQuery).toBe(164);
    expect(inputs.openLockerId).toBe(164);
    expect(inputs.hasExplicitLockerEntry).toBe(true);
  });

  /** 딥링크는 `openLockerId` 로 들어와 열린 뒤 `locker` 로 다시 쓰인다. */
  it("openLockerId 만 있어도 보관함을 가리킨 것으로 본다", () => {
    const inputs = read({ openLockerId: 921 });

    expect(inputs.lockerIdFromQuery).toBeUndefined();
    expect(inputs.openLockerId).toBe(921);
    expect(inputs.hasExplicitLockerEntry).toBe(true);
  });

  it("q 로 들어오면 검색 결과를 연 채로 시작한다", () => {
    const inputs = read({ q: "강남" });

    expect(inputs.searchQueryFromUrl).toBe("강남");
    expect(inputs.hasSearchQueryEntry).toBe(true);
    expect(inputs.hasSearchPlaceEntry).toBe(false);
  });

  it("searchPlaceId 로 들어오면 장소 목록도 함께 선다", () => {
    const inputs = read({ searchPlaceId: "42" });

    expect(inputs.searchPlaceIdFromUrl).toBe(42);
    expect(inputs.hasSearchPlaceEntry).toBe(true);
    expect(inputs.hasSearchQueryEntry).toBe(true);
  });

  /**
   * 사용자가 그 보관함을 보러 온 것이라, 검색 조건이 함께 있어도 상세가 이긴다.
   * 목록을 연 채로 시작하면 요청한 것과 다른 것을 보여 주게 된다.
   */
  it("보관함을 가리켰으면 검색 조건이 함께 있어도 목록을 열지 않는다", () => {
    const inputs = read({ locker: "164", q: "강남", searchPlaceId: "42" });

    expect(inputs.searchQueryFromUrl).toBe("강남");
    expect(inputs.searchPlaceIdFromUrl).toBe(42);
    expect(inputs.hasSearchQueryEntry).toBe(false);
    expect(inputs.hasSearchPlaceEntry).toBe(false);
  });

  it("되살릴 세션이 있으면 들고 온다", () => {
    restored.current = SESSION;

    expect(read({}).restoredSession).toBe(SESSION);
  });

  /** 지난번 화면으로 되돌리면 딥링크가 요청한 것과 다른 것을 보여 주게 된다. */
  it("보관함을 가리켰으면 되살릴 세션을 버린다", () => {
    restored.current = SESSION;

    expect(read({ locker: "164" }).restoredSession).toBeNull();
    expect(read({ openLockerId: 921 }).restoredSession).toBeNull();
  });

  it("딥링크가 들고 온 좌표와 펼침 요청을 그대로 넘긴다", () => {
    const inputs = read({
      openLockerId: 164,
      detailSnap: "full",
      focusLat: 37.4979,
      focusLng: 127.0276,
    });

    expect(inputs.detailSnap).toBe("full");
    expect(inputs.focusLat).toBe(37.4979);
    expect(inputs.focusLng).toBe(127.0276);
  });
});
