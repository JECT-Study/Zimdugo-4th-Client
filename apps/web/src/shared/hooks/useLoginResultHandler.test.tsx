// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  search: {} as Record<string, unknown>,
  refresh: vi.fn(),
  invalidate: vi.fn(),
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

import { useAuthStore } from "../store/authStore";
import { useLoginResultStore } from "../store/loginResultStore";
import { useLoginResultHandler } from "./useLoginResultHandler";

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
