import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WELCOME_SNACKBAR_STORAGE_KEY } from "../model/welcome-snackbar-storage";
import { useWelcomeSnackbar } from "./useWelcomeSnackbar";

describe("useWelcomeSnackbar", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("현재 버전을 처음 보는 브라우저에서는 안내를 연다", async () => {
    const { result } = renderHook(() => useWelcomeSnackbar());

    await waitFor(() => expect(result.current.isOpen).toBe(true));
  });

  it("현재 버전을 이미 확인한 브라우저에서는 안내를 열지 않는다", () => {
    window.localStorage.setItem(WELCOME_SNACKBAR_STORAGE_KEY, "seen");

    const { result } = renderHook(() => useWelcomeSnackbar());

    expect(result.current.isOpen).toBe(false);
  });

  it("안내를 닫으면 현재 버전을 확인한 것으로 기록한다", async () => {
    const { result } = renderHook(() => useWelcomeSnackbar());

    await waitFor(() => expect(result.current.isOpen).toBe(true));
    act(() => result.current.dismiss());

    expect(result.current.isOpen).toBe(false);
    expect(window.localStorage.getItem(WELCOME_SNACKBAR_STORAGE_KEY)).toBe(
      "seen",
    );
  });
});
