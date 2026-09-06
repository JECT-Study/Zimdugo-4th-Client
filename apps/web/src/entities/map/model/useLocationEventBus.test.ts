// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useLocationEventBus } from "./useLocationEventBus";
import type { LocationData } from "./useLocationTracking";

const SEOUL: LocationData = { lat: 37.5665, lng: 126.978, heading: null };

afterEach(() => {
  cleanup();
});

describe("useLocationEventBus", () => {
  it("첫 위치를 듣는 쪽에 좌표째로 넘긴다", () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useLocationEventBus());

    act(() => {
      result.current.subscribeFirstLocation(handler);
      result.current.notifyFirstLocation(SEOUL);
    });

    expect(handler).toHaveBeenCalledExactlyOnceWith(SEOUL);
  });

  it("요청의 결말을 듣는 쪽에 결말째로 넘긴다", () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useLocationEventBus());

    act(() => {
      result.current.subscribeRequestSettled(handler);
      result.current.notifyRequestSettled("timeout");
    });

    expect(handler).toHaveBeenCalledExactlyOnceWith("timeout");
  });

  /** 두 알림이 한 훅에 있으니, 섞이지 않는지가 이 훅의 첫 번째 위험이다. */
  it("첫 위치를 알려도 결말을 듣는 쪽은 조용하다", () => {
    const onFirstLocation = vi.fn();
    const onRequestSettled = vi.fn();
    const { result } = renderHook(() => useLocationEventBus());

    act(() => {
      result.current.subscribeFirstLocation(onFirstLocation);
      result.current.subscribeRequestSettled(onRequestSettled);
      result.current.notifyFirstLocation(SEOUL);
    });

    expect(onFirstLocation).toHaveBeenCalledTimes(1);
    expect(onRequestSettled).not.toHaveBeenCalled();
  });

  it("결말을 알려도 첫 위치를 듣는 쪽은 조용하다", () => {
    const onFirstLocation = vi.fn();
    const onRequestSettled = vi.fn();
    const { result } = renderHook(() => useLocationEventBus());

    act(() => {
      result.current.subscribeFirstLocation(onFirstLocation);
      result.current.subscribeRequestSettled(onRequestSettled);
      result.current.notifyRequestSettled("success");
    });

    expect(onRequestSettled).toHaveBeenCalledTimes(1);
    expect(onFirstLocation).not.toHaveBeenCalled();
  });

  it("듣는 쪽이 여럿이면 모두에게 알린다", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result } = renderHook(() => useLocationEventBus());

    act(() => {
      result.current.subscribeFirstLocation(first);
      result.current.subscribeFirstLocation(second);
      result.current.notifyFirstLocation(SEOUL);
    });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("정리하면 더 듣지 않는다", () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useLocationEventBus());

    act(() => {
      const unsubscribe = result.current.subscribeRequestSettled(handler);
      unsubscribe();
      result.current.notifyRequestSettled("cancelled");
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("듣는 쪽이 없어도 알림이 터지지 않는다", () => {
    const { result } = renderHook(() => useLocationEventBus());

    expect(() =>
      act(() => {
        result.current.notifyFirstLocation(SEOUL);
        result.current.notifyRequestSettled("unsupported");
      }),
    ).not.toThrow();
  });

  /**
   * 듣는 도중 구독이 바뀔 수 있다. 원본 Set 을 그대로 돌면 순회 중 삭제된 것이
   * 건너뛰어지거나 추가된 것이 같은 알림에 끼어든다.
   */
  it("듣는 도중 구독을 끊어도 이번 알림은 온전히 돈다", () => {
    const { result } = renderHook(() => useLocationEventBus());
    const second = vi.fn();
    let unsubscribeSecond = () => {};

    act(() => {
      result.current.subscribeFirstLocation(() => {
        unsubscribeSecond();
      });
      unsubscribeSecond = result.current.subscribeFirstLocation(second);
      result.current.notifyFirstLocation(SEOUL);
    });

    expect(second).toHaveBeenCalledTimes(1);
  });

  it("다시 그려도 같은 창구다", () => {
    const { result, rerender } = renderHook(() => useLocationEventBus());
    const before = result.current;

    rerender();

    expect(result.current).toBe(before);
  });
});
