// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const searchParams = vi.hoisted(() => ({
  current: {} as Record<string, unknown>,
}));

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => searchParams.current,
}));

const { useMapEntryInputs } = await import("./useMapEntryInputs");

const read = (params: Record<string, unknown>) => {
  searchParams.current = params;
  return renderHook(() => useMapEntryInputs()).result.current;
};

beforeEach(() => {
  searchParams.current = {};
});

afterEach(() => {
  cleanup();
});

describe("useMapEntryInputs", () => {
  it("빈 주소로 들어오면 아무것도 가리키지 않는다", () => {
    expect(read({})).toEqual({
      lockerIdFromQuery: undefined,
      openLockerId: undefined,
      detailSnap: undefined,
      focusLat: undefined,
      focusLng: undefined,
      searchQueryFromUrl: undefined,
      placeIdFromUrl: undefined,
    });
  });

  it("locker 로 들어오면 그 보관함을 연다", () => {
    const inputs = read({ locker: "164-강남역" });

    expect(inputs.lockerIdFromQuery).toBe(164);
    expect(inputs.openLockerId).toBe(164);
  });

  it("openLockerId 만 있어도 그 보관함을 연다", () => {
    const inputs = read({ openLockerId: 164 });

    expect(inputs.lockerIdFromQuery).toBeUndefined();
    expect(inputs.openLockerId).toBe(164);
  });

  it("검색어와 장소를 그대로 넘긴다", () => {
    const inputs = read({ q: "강남", place: 9, locker: "164" });

    expect(inputs.searchQueryFromUrl).toBe("강남");
    expect(inputs.placeIdFromUrl).toBe(9);
    expect(inputs.lockerIdFromQuery).toBe(164);
  });

  it("장소로 인정하지 않는 값은 넘기지 않는다", () => {
    expect(read({ place: "abc" }).placeIdFromUrl).toBeUndefined();
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
