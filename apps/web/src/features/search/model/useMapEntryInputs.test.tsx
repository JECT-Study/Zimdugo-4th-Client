// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const currentLocation = vi.hoisted(() => ({
  value: { pathname: "/", search: {} as Record<string, unknown> },
}));

vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({
    select,
  }: {
    select: (state: { location: typeof currentLocation.value }) => unknown;
  }) => select({ location: currentLocation.value }),
}));

const { useMapEntryInputs } = await import("./useMapEntryInputs");

const read = (pathname: string, search: Record<string, unknown> = {}) => {
  currentLocation.value = { pathname, search };
  return renderHook(() => useMapEntryInputs()).result.current;
};

afterEach(() => {
  cleanup();
});

describe("useMapEntryInputs", () => {
  it("홈으로 들어오면 아무것도 가리키지 않는다", () => {
    expect(read("/")).toEqual({
      lockerIdFromQuery: undefined,
      openLockerId: undefined,
      detailSnap: undefined,
      focusLat: undefined,
      focusLng: undefined,
      searchQueryFromUrl: undefined,
      placeIdFromUrl: undefined,
    });
  });

  it("상세 경로로 들어오면 그 보관함을 연다", () => {
    const inputs = read("/lockers/164-강남역");

    expect(inputs.lockerIdFromQuery).toBe(164);
    expect(inputs.openLockerId).toBe(164);
  });

  it("앱 안 딥링크의 openLockerId 만 있어도 그 보관함을 연다", () => {
    const inputs = read("/", { openLockerId: 164 });

    expect(inputs.lockerIdFromQuery).toBeUndefined();
    expect(inputs.openLockerId).toBe(164);
  });

  it("장소 경로와 검색어를 함께 읽는다", () => {
    const inputs = read("/places/9", { q: "강남" });

    expect(inputs.searchQueryFromUrl).toBe("강남");
    expect(inputs.placeIdFromUrl).toBe(9);
    expect(inputs.lockerIdFromQuery).toBeUndefined();
  });

  it("상세 아래 깔린 장소와 검색어를 함께 읽는다", () => {
    const inputs = read("/lockers/164", { q: "강남", place: 9 });

    expect(inputs.lockerIdFromQuery).toBe(164);
    expect(inputs.placeIdFromUrl).toBe(9);
    expect(inputs.searchQueryFromUrl).toBe("강남");
  });

  it("위치의 쿼리는 검증을 거쳐 잘못된 값을 넘기지 않는다", () => {
    // 위치의 쿼리는 검증 전 원시 값이다. 숫자가 아닌 좌표가 지도 카메라까지 가면 안 된다.
    const inputs = read("/lockers/164", {
      focusLat: "abc",
      focusLng: 127,
      detailSnap: "wide",
      place: "x",
    });

    expect(inputs.focusLat).toBeUndefined();
    expect(inputs.focusLng).toBeUndefined();
    expect(inputs.detailSnap).toBeUndefined();
    expect(inputs.placeIdFromUrl).toBeUndefined();
    expect(inputs.lockerIdFromQuery).toBe(164);
  });

  it("딥링크가 들고 온 좌표와 펼침 요청을 그대로 넘긴다", () => {
    const inputs = read("/lockers/164", {
      detailSnap: "full",
      focusLat: 37.4979,
      focusLng: 127.0276,
    });

    expect(inputs.detailSnap).toBe("full");
    expect(inputs.focusLat).toBe(37.4979);
    expect(inputs.focusLng).toBe(127.0276);
  });
});
