// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LoginPopupResult } from "#/features/auth/sign-in/model/login-popup-channel";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  applyLoginResult: vi.fn(),
  isSupported: true,
  listener: null as ((result: LoginPopupResult) => boolean) | null,
  popupIds: [] as string[],
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({}),
}));

vi.mock("#/features/auth/sign-in/model/apply-login-result", () => ({
  applyLoginResult: mocks.applyLoginResult,
}));

vi.mock("#/features/auth/sign-in/model/login-popup-channel", () => ({
  isLoginPopupSupported: () => mocks.isSupported,
  createLoginPopupId: () => {
    const id = `popup-${mocks.popupIds.length + 1}`;
    mocks.popupIds.push(id);
    return id;
  },
  subscribeLoginPopupResult: (
    listener: (result: LoginPopupResult) => boolean,
  ) => {
    mocks.listener = listener;
    return () => {
      mocks.listener = null;
    };
  },
}));

import type { LoginProvider } from "#/features/auth/sign-in/model/social-login-url";
import {
  LOGIN_POPUP_WINDOW_NAME,
  useSocialLoginPopup,
} from "./useSocialLoginPopup";

let startLogin: (provider: LoginProvider) => void = () => {};

function Probe({ returnPath = "/my" }: { returnPath?: string }) {
  startLogin = useSocialLoginPopup({ returnPath }).startLogin;

  return null;
}

const createPopupWindow = () => {
  const popupWindow = {
    closed: false,
    close: vi.fn(() => {
      popupWindow.closed = true;
    }),
  };

  return popupWindow as unknown as Window & {
    closed: boolean;
    close: ReturnType<typeof vi.fn>;
  };
};

/** window.open 에 넘긴 OAuth 주소에서 서버에 맡긴 callbackUrl 을 꺼낸다. */
const getCallbackUrl = (openedUrl: string) =>
  new URL(
    new URL(openedUrl, window.location.origin).searchParams.get(
      "callbackUrl",
    ) ?? "",
  );

/** 팝업이 결과를 보낸 것처럼 전한다. 돌려준 값은 이 창이 수신을 확인했는지다. */
const sendResult = (result: LoginPopupResult) => {
  let isAcknowledged = false;
  act(() => {
    isAcknowledged = mocks.listener?.(result) ?? false;
  });

  return isAcknowledged;
};

describe("useSocialLoginPopup", () => {
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mocks.applyLoginResult.mockReset();
    mocks.isSupported = true;
    mocks.listener = null;
    mocks.popupIds = [];
    openSpy = vi.spyOn(window, "open");
  });

  afterEach(() => {
    cleanup();
    openSpy.mockRestore();
  });

  it("팝업에 이 요청만의 식별자를 담은 callbackUrl 로 OAuth 를 연다", () => {
    openSpy.mockReturnValue(createPopupWindow());
    render(<Probe returnPath="/my" />);

    startLogin("google");

    expect(openSpy).toHaveBeenCalledTimes(1);
    const [openedUrl, windowName] = openSpy.mock.calls[0] as [string, string];
    expect(openedUrl).toContain("/oauth2/authorization/google?callbackUrl=");
    expect(windowName).toBe(LOGIN_POPUP_WINDOW_NAME);

    const callbackUrl = getCallbackUrl(openedUrl);
    expect(callbackUrl.pathname).toBe("/login");
    expect(callbackUrl.searchParams.get("returnPath")).toBe("/my");
    expect(callbackUrl.searchParams.get("popupId")).toBe("popup-1");
  });

  it("열어 둔 팝업이 있어도 다시 누르면 그 팝업을 닫고 새로 연다", () => {
    const firstPopup = createPopupWindow();
    openSpy.mockReturnValueOnce(firstPopup);
    openSpy.mockReturnValueOnce(createPopupWindow());
    render(<Probe />);

    startLogin("google");
    startLogin("kakao");

    expect(
      openSpy,
      "iOS Safari 는 팝업이 탭이라 focus() 로 전환되지 않는다. 새로 열지 않으면 눌러도 아무 일이 없다",
    ).toHaveBeenCalledTimes(2);
    expect(firstPopup.close).toHaveBeenCalledTimes(1);
    expect(
      getCallbackUrl(openSpy.mock.calls[1]?.[0] as string).searchParams.get(
        "popupId",
      ),
    ).toBe("popup-2");
  });

  it("닫고 새로 연 뒤에는 닫힌 앞 팝업의 결과를 받지 않는다", () => {
    openSpy.mockReturnValueOnce(createPopupWindow());
    openSpy.mockReturnValueOnce(createPopupWindow());
    render(<Probe returnPath="/my" />);

    startLogin("google");
    startLogin("google");

    expect(sendResult({ popupId: "popup-1", code: "LOGIN_SUCCESS" })).toBe(
      false,
    );
    expect(mocks.applyLoginResult).not.toHaveBeenCalled();

    expect(sendResult({ popupId: "popup-2", code: "LOGIN_SUCCESS" })).toBe(
      true,
    );
    expect(mocks.applyLoginResult).toHaveBeenCalledTimes(1);
  });

  it("앞의 팝업이 닫혔으면 다시 누를 때 새 팝업을 연다", () => {
    const firstPopup = createPopupWindow();
    openSpy.mockReturnValueOnce(firstPopup);
    openSpy.mockReturnValueOnce(createPopupWindow());
    render(<Probe />);

    startLogin("google");
    firstPopup.closed = true;
    startLogin("google");

    expect(openSpy).toHaveBeenCalledTimes(2);
  });

  it("자기가 연 팝업의 결과만 반영하고 수신을 확인한다", () => {
    openSpy.mockReturnValue(createPopupWindow());
    render(<Probe returnPath="/my" />);

    startLogin("google");
    expect(
      sendResult({ popupId: "other-tab-popup", code: "LOGIN_SUCCESS" }),
      "다른 탭의 팝업에 확인을 보내면 그 팝업이 닫혀 로그인이 사라진다",
    ).toBe(false);
    expect(mocks.applyLoginResult).not.toHaveBeenCalled();

    expect(sendResult({ popupId: "popup-1", code: "LOGIN_SUCCESS" })).toBe(
      true,
    );
    expect(mocks.applyLoginResult).toHaveBeenCalledTimes(1);
    expect(mocks.applyLoginResult).toHaveBeenCalledWith(
      expect.objectContaining({ code: "LOGIN_SUCCESS", returnPath: "/my" }),
    );
  });

  it("같은 결과가 두 번 오면 두 번째는 확인하지 않고 반영도 한 번만 한다", () => {
    openSpy.mockReturnValue(createPopupWindow());
    render(<Probe />);

    startLogin("google");
    expect(sendResult({ popupId: "popup-1", code: "LOGIN_SUCCESS" })).toBe(
      true,
    );
    expect(sendResult({ popupId: "popup-1", code: "LOGIN_SUCCESS" })).toBe(
      false,
    );

    expect(mocks.applyLoginResult).toHaveBeenCalledTimes(1);
  });

  describe("COOP 로 팝업 참조가 끊겼을 때", () => {
    /** 제공자 페이지가 창을 떼어 내면 팝업이 열려 있어도 closed 가 true 가 된다. */
    const startTwoPopups = () => {
      const firstPopup = createPopupWindow();
      openSpy.mockReturnValueOnce(firstPopup);
      openSpy.mockReturnValueOnce(createPopupWindow());
      render(<Probe returnPath="/my" />);

      startLogin("google");
      firstPopup.closed = true;
      startLogin("google");
    };

    it("앞의 팝업이 성공하면 그 결과를 반영한다", () => {
      startTwoPopups();

      expect(sendResult({ popupId: "popup-1", code: "LOGIN_SUCCESS" })).toBe(
        true,
      );
      expect(mocks.applyLoginResult).toHaveBeenCalledWith(
        expect.objectContaining({ code: "LOGIN_SUCCESS", returnPath: "/my" }),
      );
    });

    it("앞의 팝업이 실패하면 팝업은 닫히게 하되 실패를 알리지 않는다", () => {
      startTwoPopups();

      expect(sendResult({ popupId: "popup-1", code: "LOGIN_FAILED" })).toBe(
        true,
      );
      expect(
        mocks.applyLoginResult,
        "뒤의 팝업이 진행 중인데 실패를 알리면 사용자는 로그인이 끝난 줄 안다",
      ).not.toHaveBeenCalled();

      expect(sendResult({ popupId: "popup-2", code: "LOGIN_SUCCESS" })).toBe(
        true,
      );
      expect(mocks.applyLoginResult).toHaveBeenCalledTimes(1);
    });

    it("가장 최근 팝업의 실패는 알린다", () => {
      startTwoPopups();

      expect(sendResult({ popupId: "popup-2", code: "LOGIN_FAILED" })).toBe(
        true,
      );
      expect(mocks.applyLoginResult).toHaveBeenCalledWith(
        expect.objectContaining({ code: "LOGIN_FAILED" }),
      );
    });
  });

  describe("팝업을 쓸 수 없을 때", () => {
    const originalLocation = window.location;
    let assignedHref = "";

    beforeEach(() => {
      assignedHref = "";
      Object.defineProperty(window, "location", {
        configurable: true,
        value: {
          origin: originalLocation.origin,
          set href(value: string) {
            assignedHref = value;
          },
          get href() {
            return assignedHref;
          },
        },
      });
    });

    afterEach(() => {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
      });
    });

    it("팝업이 막히면 이 창을 식별자 없는 callbackUrl 로 OAuth 에 보낸다", () => {
      openSpy.mockReturnValue(null);
      render(<Probe returnPath="/my" />);

      startLogin("naver");

      expect(assignedHref).toContain("/oauth2/authorization/naver");
      const callbackUrl = getCallbackUrl(assignedHref);
      expect(callbackUrl.searchParams.get("returnPath")).toBe("/my");
      expect(callbackUrl.searchParams.has("popupId")).toBe(false);
    });

    it("BroadcastChannel 이 없으면 팝업을 열지 않고 이 창에서 진행한다", () => {
      mocks.isSupported = false;
      render(<Probe />);

      startLogin("kakao");

      expect(openSpy).not.toHaveBeenCalled();
      expect(assignedHref).toContain("/oauth2/authorization/kakao");
    });
  });
});
