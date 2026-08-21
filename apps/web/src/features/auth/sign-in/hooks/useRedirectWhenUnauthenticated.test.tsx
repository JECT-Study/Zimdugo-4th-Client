// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  pathname: "/report",
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mocks.navigate,
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ location: { pathname: mocks.pathname } }),
}));

import { useAuthPopupStore } from "#/shared/store/authPopupStore";
import { useAuthStore } from "#/shared/store/authStore";
import { useRedirectWhenUnauthenticated } from "./useRedirectWhenUnauthenticated";

function Probe() {
  useRedirectWhenUnauthenticated();

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

const loseAuthentication = () => {
  act(() => {
    useAuthStore.getState().clearAuth();
  });
};

beforeEach(() => {
  mocks.navigate.mockClear();
  mocks.pathname = "/report";
  useAuthStore.getState().clearAuth();
  useAuthPopupStore.getState().closePopup();
});

afterEach(() => {
  cleanup();
});

describe("useRedirectWhenUnauthenticated", () => {
  it("보호 경로 체류 중 인증이 끊기면 홈으로 내보낸다", () => {
    setAuthenticated();
    render(<Probe />);
    expect(mocks.navigate).not.toHaveBeenCalled();

    loseAuthentication();

    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/", replace: true });
  });

  it("쫓겨난 자리를 담아 로그인 팝업을 연다", () => {
    mocks.pathname = "/my/reports";
    setAuthenticated();
    render(<Probe />);

    loseAuthentication();

    expect(useAuthPopupStore.getState()).toMatchObject({
      isOpen: true,
      returnPath: "/my/reports",
    });
  });

  it("로케일 접두사가 붙은 보호 경로도 알아본다", () => {
    mocks.pathname = "/ja/my/favorites";
    setAuthenticated();
    render(<Probe />);

    loseAuthentication();

    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/", replace: true });
  });

  it("보호 경로가 아니면 인증이 끊겨도 내보내지 않는다", () => {
    mocks.pathname = "/notices";
    setAuthenticated();
    render(<Probe />);

    loseAuthentication();

    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("`/settings` 는 비로그인도 보는 화면이라 내보내지 않는다", () => {
    mocks.pathname = "/settings";
    setAuthenticated();
    render(<Probe />);

    loseAuthentication();

    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("로그인 상태에서는 아무것도 하지 않는다", () => {
    setAuthenticated();
    render(<Probe />);

    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(useAuthPopupStore.getState().isOpen).toBe(false);
  });

  it("한 번 내보낸 뒤에는 같은 목적지로 다시 보내지 않는다", () => {
    setAuthenticated();
    render(<Probe />);

    loseAuthentication();
    act(() => {
      window.dispatchEvent(new Event("pageshow"));
    });

    expect(mocks.navigate).toHaveBeenCalledTimes(1);
  });

  it("bfcache 복원처럼 effect 없이 돌아온 경우에도 내보낸다", () => {
    // 로그인 상태로 렌더한 뒤, effect 를 깨우지 않고 스토어만 비운다.
    setAuthenticated();
    render(<Probe />);
    useAuthStore.setState({ isAuthenticated: false });
    expect(mocks.navigate).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new Event("pageshow"));
    });

    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/", replace: true });
  });

  it("다시 로그인하면 다음 인증 상실에서 또 내보낸다", () => {
    setAuthenticated();
    render(<Probe />);

    loseAuthentication();
    expect(mocks.navigate).toHaveBeenCalledTimes(1);

    setAuthenticated();
    loseAuthentication();

    expect(mocks.navigate).toHaveBeenCalledTimes(2);
  });
});
