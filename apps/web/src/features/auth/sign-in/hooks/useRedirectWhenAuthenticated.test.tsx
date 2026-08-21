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

function Probe({
  returnPath = "/my",
  enabled = true,
}: {
  returnPath?: string;
  enabled?: boolean;
}) {
  useRedirectWhenAuthenticated({ returnPath, enabled });

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

describe("useRedirectWhenAuthenticated", () => {
  beforeEach(() => {
    mocks.navigate.mockClear();
    useAuthStore.getState().clearAuth();
  });

  afterEach(() => {
    cleanup();
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

  it("bfcache 복원(pageshow persisted)에서도 다시 확인한다", () => {
    setAuthenticated();
    render(<Probe />);
    mocks.navigate.mockClear();

    act(() => {
      window.dispatchEvent(
        new PageTransitionEvent("pageshow", { persisted: true }),
      );
    });

    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/my",
      replace: true,
    });
  });

  it("일반 pageshow(비복원)에는 반응하지 않는다", () => {
    setAuthenticated();
    render(<Probe />);
    mocks.navigate.mockClear();

    act(() => {
      window.dispatchEvent(
        new PageTransitionEvent("pageshow", { persisted: false }),
      );
    });

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

  it("OAuth 콜백 처리 중(enabled=false)에는 개입하지 않는다", () => {
    setAuthenticated();

    render(<Probe enabled={false} />);

    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
