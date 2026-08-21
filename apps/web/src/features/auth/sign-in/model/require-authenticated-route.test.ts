import { isRedirect } from "@tanstack/react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthPopupStore } from "#/shared/store/authPopupStore";
import { useAuthStore } from "#/shared/store/authStore";
import { requireAuthenticatedRoute } from "./require-authenticated-route";

const guard = (pathname: string, preload?: boolean) =>
  requireAuthenticatedRoute({ location: { pathname }, preload });

/** 팝업은 동적 import 로 열리므로 마이크로태스크가 비워질 때까지 기다린다. */
const flushPopup = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  useAuthStore.getState().clearAuth();
  useAuthPopupStore.getState().closePopup();
});

describe("requireAuthenticatedRoute", () => {
  it("로그인 상태면 그대로 통과시킨다", () => {
    useAuthStore
      .getState()
      .setAuth({ accessToken: "token", userId: 1, email: null });

    expect(() => guard("/report")).not.toThrow();
  });

  it("비로그인 상태면 홈으로 돌려보낸다", () => {
    try {
      guard("/report");
      expect.unreachable("리다이렉트가 발생해야 한다");
    } catch (error) {
      expect(isRedirect(error)).toBe(true);
      expect(error).toMatchObject({ options: { to: "/", replace: true } });
    }
  });

  it("비로그인 상태면 돌아올 경로를 담아 로그인 팝업을 연다", async () => {
    expect(() => guard("/my/reports")).toThrow();
    await flushPopup();

    expect(useAuthPopupStore.getState()).toMatchObject({
      isOpen: true,
      returnPath: "/my/reports",
    });
  });

  it("preload 로 들어온 호출에서는 팝업을 열지 않는다", async () => {
    expect(() => guard("/my/favorites", true)).toThrow();
    await flushPopup();

    expect(useAuthPopupStore.getState().isOpen).toBe(false);
  });
});
