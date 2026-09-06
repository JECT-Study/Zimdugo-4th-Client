// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMapPressBus } from "./useMapPressBus";

afterEach(() => {
  cleanup();
});

describe("useMapPressBus", () => {
  it("듣는 쪽에 누름을 알린다", () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useMapPressBus());

    act(() => {
      result.current.subscribe(handler);
      result.current.notify();
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("듣는 쪽이 여럿이면 모두에게 알린다", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result } = renderHook(() => useMapPressBus());

    act(() => {
      result.current.subscribe(first);
      result.current.subscribe(second);
      result.current.notify();
    });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("정리하면 더 듣지 않는다", () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useMapPressBus());

    act(() => {
      const unsubscribe = result.current.subscribe(handler);
      unsubscribe();
      result.current.notify();
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("듣는 쪽이 없어도 알림이 터지지 않는다", () => {
    const { result } = renderHook(() => useMapPressBus());

    expect(() => act(() => result.current.notify())).not.toThrow();
  });

  /**
   * 듣는 도중 구독이 바뀔 수 있다. 원본 Set 을 그대로 돌면 순회 중 삭제된 것이
   * 건너뛰어지거나 추가된 것이 같은 알림에 끼어든다.
   */
  it("듣는 도중 구독을 끊어도 이번 알림은 온전히 돈다", () => {
    const { result } = renderHook(() => useMapPressBus());
    const second = vi.fn();
    let unsubscribeSecond = () => {};

    act(() => {
      result.current.subscribe(() => {
        unsubscribeSecond();
      });
      unsubscribeSecond = result.current.subscribe(second);
      result.current.notify();
    });

    expect(second).toHaveBeenCalledTimes(1);
  });

  it("지도가 바뀌어도 같은 창구다", () => {
    const { result, rerender } = renderHook(() => useMapPressBus());
    const before = result.current;

    rerender();

    expect(result.current).toBe(before);
  });
});
