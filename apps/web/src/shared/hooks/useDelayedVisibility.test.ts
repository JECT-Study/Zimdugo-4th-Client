import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDelayedVisibility } from "./useDelayedVisibility";

describe("useDelayedVisibility", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("지연 시간보다 빠른 전환에는 표시하지 않는다", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ isActive }) => useDelayedVisibility(isActive, 180),
      { initialProps: { isActive: true } },
    );

    act(() => {
      vi.advanceTimersByTime(179);
      rerender({ isActive: false });
      vi.runAllTimers();
    });

    expect(result.current).toBe(false);
  });

  it("지연 시간 뒤 표시하고 종료 상태는 즉시 반영한다", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ isActive }) => useDelayedVisibility(isActive, 180),
      { initialProps: { isActive: true } },
    );

    act(() => {
      vi.advanceTimersByTime(180);
    });
    expect(result.current).toBe(true);

    act(() => {
      rerender({ isActive: false });
    });
    expect(result.current).toBe(false);
  });
});
