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

import Cookies from "js-cookie";
import { useAuthPopupStore } from "#/shared/store/authPopupStore";
import { useAuthStore } from "#/shared/store/authStore";
import { useRedirectWhenUnauthenticated } from "./useRedirectWhenUnauthenticated";

const AUTH_STORAGE_COOKIE = "auth-storage";

/**
 * 다른 탭에서 로그아웃한 상황. 공유 쿠키만 바뀌고 이 문서의 메모리 상태는
 * 그대로 `true` 로 남는다 — 쿠키에는 `storage` 이벤트가 없기 때문이다.
 */
const signOutInAnotherTab = () => {
  Cookies.set(
    AUTH_STORAGE_COOKIE,
    JSON.stringify({ state: { isAuthenticated: false }, version: 0 }),
    { path: "/" },
  );
};

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
  Cookies.remove(AUTH_STORAGE_COOKIE, { path: "/" });
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

  it("bfcache 복원 시 저장소를 다시 읽어 판정한다", async () => {
    setAuthenticated();
    render(<Probe />);

    signOutInAnotherTab();
    // 메모리 상태만 보면 아직 로그인 중이라 이 시점에는 아무 일도 없다.
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(mocks.navigate).not.toHaveBeenCalled();

    await act(async () => {
      window.dispatchEvent(new Event("pageshow"));
    });

    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/", replace: true });
  });

  it("다른 탭에서 로그아웃한 뒤 탭이 다시 보이면 내보낸다", async () => {
    setAuthenticated();
    render(<Probe />);

    signOutInAnotherTab();

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/", replace: true });
  });

  it("끝 슬래시가 붙은 보호 경로도 알아본다", () => {
    mocks.pathname = "/report/";
    setAuthenticated();
    render(<Probe />);

    loseAuthentication();

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
