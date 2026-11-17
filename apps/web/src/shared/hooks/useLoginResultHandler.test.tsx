// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  search: {} as Record<string, unknown>,
  refresh: vi.fn(),
  invalidate: vi.fn(),
  postLoginPopupResult: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mocks.navigate,
  useSearch: () => mocks.search,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({}),
}));

vi.mock("#/shared/lib/invalidate-personalized-queries", () => ({
  invalidatePersonalizedQueries: mocks.invalidate,
}));

vi.mock("../../features/auth/sign-in/api/authService", () => ({
  authService: { refresh: mocks.refresh },
}));

vi.mock("#/features/auth/sign-in/model/login-popup-channel", () => ({
  isLoginPopupSupported: () => true,
  postLoginPopupResult: mocks.postLoginPopupResult,
}));

import { useAuthStore } from "../store/authStore";
import { useLoginResultStore } from "../store/loginResultStore";
import {
  LOGIN_POPUP_CLOSE_FALLBACK_MS,
  useLoginResultHandler,
} from "./useLoginResultHandler";

function Probe() {
  useLoginResultHandler();

  return null;
}

const renderWithSearch = async (search: Record<string, unknown>) => {
  mocks.search = search;
  await act(async () => {
    render(<Probe />);
  });
};

const setAuthenticated = () => {
  useAuthStore.getState().setAuth({
    accessToken: "token",
    userId: 1,
    email: "user@example.com",
  });
};

describe("useLoginResultHandler", () => {
  beforeEach(() => {
    mocks.navigate.mockReset().mockResolvedValue(undefined);
    mocks.refresh.mockReset();
    mocks.invalidate.mockReset().mockResolvedValue(undefined);
    mocks.postLoginPopupResult.mockReset();
    useAuthStore.getState().clearAuth();
    useLoginResultStore.getState().forceClose();
  });

  afterEach(() => {
    cleanup();
    useAuthStore.getState().clearAuth();
    useLoginResultStore.getState().forceClose();
  });

  it("비로그인 상태로 LOGIN_FAILED 를 받으면 실패를 알리고 로그인 화면으로 보낸다", async () => {
    await renderWithSearch({ code: "LOGIN_FAILED", returnPath: "/my" });

    expect(useLoginResultStore.getState().type).toBe("failure");
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/login",
      search: { returnPath: "/my", code: undefined },
      replace: true,
    });
  });

  it("이미 로그인한 상태로 LOGIN_FAILED 를 받으면 실패를 알리지 않고 returnPath 로 보낸다", async () => {
    setAuthenticated();

    await renderWithSearch({ code: "LOGIN_FAILED", returnPath: "/my" });

    expect(useLoginResultStore.getState().isOpen).toBe(false);
    expect(mocks.navigate).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/my", replace: true });
  });

  it("이미 로그인한 상태로 알 수 없는 code 를 받아도 조용히 returnPath 로 보낸다", async () => {
    setAuthenticated();

    await renderWithSearch({ code: "SOMETHING_ELSE", returnPath: "/my" });

    expect(useLoginResultStore.getState().isOpen).toBe(false);
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/my", replace: true });
  });

  it("refresh 가 실패해 로그인 상태가 지워지면 실패를 알린다", async () => {
    setAuthenticated();
    mocks.refresh.mockImplementation(async () => {
      useAuthStore.getState().clearAuth();
      throw new Error("refresh failed");
    });

    await renderWithSearch({ code: "LOGIN_SUCCESS", returnPath: "/my" });

    expect(useLoginResultStore.getState().type).toBe("failure");
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/login",
      search: { returnPath: "/my", code: undefined },
      replace: true,
    });
  });

  it("LOGIN_SUCCESS 를 받으면 토큰을 받아 returnPath 로 보내고 성공을 알린다", async () => {
    mocks.refresh.mockResolvedValue({
      accessToken: "token",
      userId: 1,
      email: "user@example.com",
      provider: "google",
    });

    await renderWithSearch({ code: "LOGIN_SUCCESS", returnPath: "/my" });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/my", replace: true });
    expect(useLoginResultStore.getState().type).toBe("success");
  });
});

describe("useLoginResultHandler 팝업 안", () => {
  let closeSpy: ReturnType<typeof vi.spyOn>;

  const setWindowClosed = (isClosed: boolean) => {
    Object.defineProperty(window, "closed", {
      configurable: true,
      get: () => isClosed,
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    mocks.navigate.mockReset().mockResolvedValue(undefined);
    mocks.refresh.mockReset();
    mocks.postLoginPopupResult.mockReset();
    closeSpy = vi.spyOn(window, "close").mockImplementation(() => {});
    useAuthStore.getState().clearAuth();
    useLoginResultStore.getState().forceClose();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    closeSpy.mockRestore();
    setWindowClosed(false);
    useAuthStore.getState().clearAuth();
    useLoginResultStore.getState().forceClose();
  });

  it("결과를 연 창에 알리고 스스로 닫으며 토큰 발급과 이동은 하지 않는다", async () => {
    setWindowClosed(true);

    await renderWithSearch({
      code: "LOGIN_SUCCESS",
      returnPath: "/my",
      popupId: "popup-1",
    });
    await act(async () => {
      vi.advanceTimersByTime(LOGIN_POPUP_CLOSE_FALLBACK_MS);
    });

    expect(mocks.postLoginPopupResult).toHaveBeenCalledWith({
      popupId: "popup-1",
      code: "LOGIN_SUCCESS",
    });
    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("창이 닫히지 않으면 그 창에서 직접 로그인을 마친다", async () => {
    setWindowClosed(false);
    mocks.refresh.mockResolvedValue({
      accessToken: "token",
      userId: 1,
      email: "user@example.com",
      provider: "google",
    });

    await renderWithSearch({
      code: "LOGIN_SUCCESS",
      returnPath: "/my",
      popupId: "popup-1",
    });
    expect(mocks.refresh).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(LOGIN_POPUP_CLOSE_FALLBACK_MS);
    });

    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/my", replace: true });
  });
});
