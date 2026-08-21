// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mocks.navigate,
}));

import { useAuthStore } from "#/shared/store/authStore";
import { useRedirectWhenAuthenticated } from "./useRedirectWhenAuthenticated";

const AUTH_STORAGE_COOKIE = "auth-storage";

function Probe({
  returnPath = "/my",
  isEnabled = true,
}: {
  returnPath?: string;
  isEnabled?: boolean;
}) {
  useRedirectWhenAuthenticated({ returnPath, isEnabled });

  return null;
}

const setAuthenticated = () => {
  act(() => {
    useAuthStore.getState().setAuth({
      accessToken: "token",
      userId: 1,
      email: "user@example.com",
    });
  });
};

/** 이 문서를 거치지 않고 persist 저장소(쿠키)만 로그인 상태가 된 상황을 만든다. */
const setPersistedAuthenticated = () => {
  document.cookie = `${AUTH_STORAGE_COOKIE}=${encodeURIComponent(
    JSON.stringify({ state: { isAuthenticated: true }, version: 0 }),
  )}; path=/`;
};

const clearPersistedAuth = () => {
  document.cookie = `${AUTH_STORAGE_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

const firePageShow = async ({ persisted }: { persisted: boolean }) => {
  await act(async () => {
    window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted }));
    // pageshow 핸들러가 await하는 rehydrate가 끝날 때까지 마이크로태스크를 비운다.
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe("useRedirectWhenAuthenticated", () => {
  beforeEach(() => {
    mocks.navigate.mockClear();
    clearPersistedAuth();
    useAuthStore.getState().clearAuth();
  });

  afterEach(() => {
    cleanup();
    clearPersistedAuth();
    useAuthStore.getState().clearAuth();
  });

  it("비로그인 상태에서는 로그인 페이지에 머문다", () => {
    render(<Probe />);

    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("이미 로그인된 상태로 마운트되면 returnPath로 돌려보낸다", () => {
    setAuthenticated();

    render(<Probe />);

    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/my",
      replace: true,
    });
  });

  it("머무는 동안 로그인되면 그 시점에 돌려보낸다", () => {
    render(<Probe />);
    expect(mocks.navigate).not.toHaveBeenCalled();

    setAuthenticated();

    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/my",
      replace: true,
    });
  });

  it("bfcache 복원(pageshow persisted)에서도 다시 확인한다", async () => {
    setAuthenticated();
    render(<Probe />);
    mocks.navigate.mockClear();

    await firePageShow({ persisted: true });

    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/my",
      replace: true,
    });
  });

  it("얼려 있는 동안 다른 문서에서 로그인했으면 복원 시 저장소를 다시 읽는다", async () => {
    // 이 문서는 로그인 전 상태로 얼려 있고, 그 사이 OAuth 문서가 로그인을 끝내
    // 쿠키만 로그인 상태가 된 상황.
    render(<Probe />);
    expect(mocks.navigate).not.toHaveBeenCalled();

    setPersistedAuthenticated();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    await firePageShow({ persisted: true });

    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/my",
      replace: true,
    });
  });

  it("일반 pageshow(비복원)에는 반응하지 않는다", async () => {
    setAuthenticated();
    render(<Probe />);
    mocks.navigate.mockClear();

    await firePageShow({ persisted: false });

    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("외부 URL이 returnPath로 들어오면 홈으로 보낸다", () => {
    setAuthenticated();

    render(<Probe returnPath="https://evil.com" />);

    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/",
      replace: true,
    });
  });

  it("OAuth 콜백 처리 중(isEnabled=false)에는 개입하지 않는다", () => {
    setAuthenticated();

    render(<Probe isEnabled={false} />);

    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
