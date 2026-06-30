import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMobileBackGuard } from "./useMobileBackGuard";

const MOBILE_BACK_HISTORY_STATE_KEY = "__zimdugoMobileBackEntry";

describe("useMobileBackGuard", () => {
  let historyStack: Array<{ state: unknown; url: string }>;
  let currentIndex: number;
  let backSpy: ReturnType<typeof vi.spyOn>;

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

    backSpy = vi.spyOn(window.history, "back").mockImplementation(() => {
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

  it("onBack이 생기면 TanStack Router key를 보존한 synthetic entry를 추가한다", () => {
    const onBack = vi.fn();

    renderHook(() => useMobileBackGuard(onBack));

    expect(historyStack).toHaveLength(2);
    // key를 보존하고 flag만 추가해야 TanStack Router가 keyless entry를 만나 오동작하지 않음
    expect(historyStack[1]?.state).toMatchObject({
      key: "router-a",
      idx: 0,
      [MOBILE_BACK_HISTORY_STATE_KEY]: true,
    });
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

  it("onBack이 없어지면 replaceState로 원본 state를 복원한다 (popstate 없음)", () => {
    const onBack = vi.fn();

    const { rerender } = renderHook(
      ({ handler }: { handler: (() => void) | undefined }) =>
        useMobileBackGuard(handler),
      { initialProps: { handler: onBack as (() => void) | undefined } },
    );

    expect(historyStack).toHaveLength(2);

    act(() => {
      rerender({ handler: undefined });
    });

    // history.back()은 호출되지 않아야 함 (popstate를 유발해 TanStack Router 오동작 방지)
    expect(backSpy).not.toHaveBeenCalled();
    // replaceState로 synthetic flag 없이 원본 state를 복원
    expect(historyStack[currentIndex]?.state).toEqual({ key: "router-a", idx: 0 });
    // onBack은 실행되지 않아야 함
    expect(onBack).not.toHaveBeenCalled();
    // currentIndex는 1 유지 (스택에서 제거하지 않고 현재 위치의 state만 교체)
    expect(currentIndex).toBe(1);
  });

  it("cleanup 후 새 onBack이 다시 synthetic entry를 추가하고 back에 반응한다", () => {
    const firstBack = vi.fn();
    const secondBack = vi.fn();

    const { rerender } = renderHook(
      ({ handler }: { handler: (() => void) | undefined }) =>
        useMobileBackGuard(handler),
      { initialProps: { handler: firstBack as (() => void) | undefined } },
    );

    // firstBack 설정 → synthetic entry 추가
    expect(historyStack).toHaveLength(2);

    act(() => {
      rerender({ handler: undefined });
    });

    // cleanup: replaceState로 원본 state 복원 (back()은 미호출)
    expect(backSpy).not.toHaveBeenCalled();
    expect(firstBack).not.toHaveBeenCalled();
    // currentIndex=1, state는 원본으로 복원됨 (synthetic flag 없음)
    expect(isSyntheticEntry(historyStack[currentIndex]?.state)).toBe(false);

    act(() => {
      rerender({ handler: secondBack });
    });

    // cleanup 후 hasEntry=false → 새 synthetic entry push
    expect(historyStack).toHaveLength(3);
    expect(currentIndex).toBe(2);
    expect(historyStack[2]?.state).toMatchObject({
      [MOBILE_BACK_HISTORY_STATE_KEY]: true,
    });

    act(() => {
      window.history.back();
    });

    expect(secondBack).toHaveBeenCalledTimes(1);
  });
});

function isSyntheticEntry(state: unknown): boolean {
  return (
    typeof state === "object" &&
    state !== null &&
    (state as Record<string, unknown>)[MOBILE_BACK_HISTORY_STATE_KEY] === true
  );
}
