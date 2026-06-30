import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMobileBackGuard } from "./useMobileBackGuard";

const MOBILE_BACK_HISTORY_STATE_KEY = "__zimdugoMobileBackEntry";

describe("useMobileBackGuard", () => {
  let historyStack: Array<{ state: unknown; url: string }>;
  let currentIndex: number;

  const pushHistoryEntry = (state: unknown, url: string) => {
    historyStack = historyStack.slice(0, currentIndex + 1);
    historyStack.push({ state, url });
    currentIndex = historyStack.length - 1;
  };

  beforeEach(() => {
    window.history.replaceState({ key: "router-a", idx: 0 }, "", "/");

    historyStack = [{ state: { key: "router-a", idx: 0 }, url: "/" }];
    currentIndex = 0;

    vi.spyOn(window.history, "pushState").mockImplementation((state, _title, url) => {
      pushHistoryEntry(state, String(url));
    });

    vi.spyOn(window.history, "replaceState").mockImplementation((state, _title, url) => {
      historyStack[currentIndex] = { state, url: String(url) };
    });

    vi.spyOn(window.history, "back").mockImplementation(() => {
      if (currentIndex > 0) {
        currentIndex -= 1;
        const current = historyStack[currentIndex];
        window.history.replaceState(current.state, "", current.url);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    });

    Object.defineProperty(window.history, "state", {
      configurable: true,
      get: () => historyStack[currentIndex]?.state ?? null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("onBack이 생기면 synthetic history entry를 추가한다", () => {
    const onBack = vi.fn();

    renderHook(() => useMobileBackGuard(onBack));

    expect(historyStack).toHaveLength(2);
    expect(historyStack[1]?.state).toMatchObject({
      idx: 0,
      [MOBILE_BACK_HISTORY_STATE_KEY]: true,
    });
    expect(historyStack[1]?.state).not.toHaveProperty("key");
  });

  it("브라우저 back popstate에서 onBack을 실행한다", () => {
    const onBack = vi.fn();

    renderHook(() => useMobileBackGuard(onBack));

    act(() => {
      window.history.back();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(currentIndex).toBe(0);
  });

  it("onBack이 없어지면 replaceState로 synthetic flag만 제거한다", () => {
    const onBack = vi.fn();
    const { rerender } = renderHook(
      ({ handler }: { handler: (() => void) | undefined }) =>
        useMobileBackGuard(handler),
      { initialProps: { handler: onBack } },
    );

    act(() => {
      rerender({ handler: undefined });
    });

    expect(window.history.back).not.toHaveBeenCalled();
    expect(historyStack).toHaveLength(2);
    expect(historyStack[1]?.state).toEqual({ idx: 0 });
  });

  it("cleanup 직후 새 onBack arming이 즉시 synthetic entry를 추가한다", () => {
    const firstBack = vi.fn();
    const secondBack = vi.fn();

    const { rerender } = renderHook(
      ({ handler }: { handler: (() => void) | undefined }) =>
        useMobileBackGuard(handler),
      { initialProps: { handler: firstBack } },
    );

    act(() => {
      rerender({ handler: undefined });
    });

    act(() => {
      rerender({ handler: secondBack });
    });

    expect(firstBack).not.toHaveBeenCalled();
    expect(window.history.back).not.toHaveBeenCalled();
    expect(historyStack).toHaveLength(3);
    expect(currentIndex).toBe(2);
    expect(historyStack[2]?.state).toMatchObject({
      [MOBILE_BACK_HISTORY_STATE_KEY]: true,
    });
  });
});
