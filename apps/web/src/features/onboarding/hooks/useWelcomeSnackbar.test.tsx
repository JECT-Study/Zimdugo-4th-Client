import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WELCOME_SNACKBAR_STORAGE_KEY } from "../model/welcome-snackbar-storage";
import {
  useWelcomeSnackbar,
  WELCOME_SNACKBAR_DURATION_MS,
} from "./useWelcomeSnackbar";

describe("useWelcomeSnackbar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it("안내를 본 적 없는 브라우저의 홈에서는 안내를 띄운다", () => {
    const { result } = renderHook(() => useWelcomeSnackbar(true));

    expect(result.current.isVisible).toBe(true);
  });

  it("안내를 이미 본 브라우저에서는 띄우지 않는다", () => {
    window.localStorage.setItem(WELCOME_SNACKBAR_STORAGE_KEY, "seen");

    const { result } = renderHook(() => useWelcomeSnackbar(true));

    expect(result.current.isVisible).toBe(false);
  });

  it("처음 보이는 순간 닫지 않아도 본 것으로 기록한다", () => {
    renderHook(() => useWelcomeSnackbar(true));

    expect(window.localStorage.getItem(WELCOME_SNACKBAR_STORAGE_KEY)).toBe(
      "seen",
    );
  });

  it("띄울 수 없는 화면에서는 보이지 않고 본 것으로 기록하지도 않는다", () => {
    const { result } = renderHook(() => useWelcomeSnackbar(false));

    expect(result.current.isVisible).toBe(false);
    expect(
      window.localStorage.getItem(WELCOME_SNACKBAR_STORAGE_KEY),
    ).toBeNull();
  });

  it("가려졌던 안내는 홈으로 돌아오면 다시 보인다", () => {
    const { result, rerender } = renderHook(
      ({ canShow }) => useWelcomeSnackbar(canShow),
      { initialProps: { canShow: false } },
    );

    expect(result.current.isVisible).toBe(false);
    rerender({ canShow: true });

    expect(result.current.isVisible).toBe(true);
  });

  it("정해진 시간이 지나면 스스로 사라진다", () => {
    const { result } = renderHook(() => useWelcomeSnackbar(true));

    act(() => {
      vi.advanceTimersByTime(WELCOME_SNACKBAR_DURATION_MS - 1);
    });
    expect(result.current.isVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isVisible).toBe(false);
  });

  it("가려진 동안에는 시간이 흐르지 않는다", () => {
    const { result, rerender } = renderHook(
      ({ canShow }) => useWelcomeSnackbar(canShow),
      { initialProps: { canShow: true } },
    );

    rerender({ canShow: false });
    act(() => {
      vi.advanceTimersByTime(WELCOME_SNACKBAR_DURATION_MS * 2);
    });
    rerender({ canShow: true });

    expect(result.current.isVisible).toBe(true);
  });

  it("닫으면 바로 사라진다", () => {
    const { result } = renderHook(() => useWelcomeSnackbar(true));

    act(() => result.current.dismiss());

    expect(result.current.isVisible).toBe(false);
  });
});
