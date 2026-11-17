import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";
import { applyLoginResult } from "#/features/auth/sign-in/model/apply-login-result";
import {
  createLoginPopupId,
  isLoginPopupSupported,
  subscribeLoginPopupResult,
} from "#/features/auth/sign-in/model/login-popup-channel";
import { resolveSafeReturnPath } from "#/features/auth/sign-in/model/safe-return-path";
import {
  buildLoginCallbackUrl,
  buildSocialLoginUrl,
  type LoginProvider,
} from "#/features/auth/sign-in/model/social-login-url";

export const LOGIN_POPUP_WINDOW_NAME = "zimdugo-social-login";
const LOGIN_POPUP_FEATURES = "popup=yes,width=480,height=720";

interface PendingLoginPopups {
  /** 이 창이 연 팝업들의 식별자와 그때의 목적지. 결과가 오기 전까지 남는다. */
  returnPathById: Map<string, string>;
  latestPopupId: string | null;
  latestPopupWindow: Window | null;
}

/**
 * 소셜 로그인을 팝업 창에서 진행하고, 끝나면 이 창에서 결과를 반영한다.
 *
 * 로그인 과정이 팝업 안에서만 오가므로 이 창의 히스토리에는 제공자 페이지가
 * 쌓이지 않는다. 팝업을 열 수 없으면 지금처럼 이 창을 제공자로 보낸다.
 *
 * 팝업 창 참조의 `closed` 는 믿을 수 없다. 제공자 페이지가 COOP 로 창을 떼어 내면
 * 팝업이 열려 있어도 `true` 가 된다. 그래서 `closed` 로 진행 중인 요청을 지우지
 * 않고, 결과가 올 때까지 열었던 팝업을 모두 기억한다.
 */
export const useSocialLoginPopup = ({ returnPath }: { returnPath: string }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pendingRef = useRef<PendingLoginPopups>({
    returnPathById: new Map(),
    latestPopupId: null,
    latestPopupWindow: null,
  });

  const startLogin = useCallback(
    (provider: LoginProvider) => {
      const pending = pendingRef.current;
      // 서버는 마지막 시작 요청만 기억하므로 팝업을 새로 열면 앞의 것이 실패한다.
      // 열려 있는 게 확실한 팝업은 앞으로 가져온다. 참조가 끊겼으면 확인할 수
      // 없으니, 사용자가 닫았을 수도 있다고 보고 새로 연다.
      if (pending.latestPopupWindow && !pending.latestPopupWindow.closed) {
        pending.latestPopupWindow.focus();
        return;
      }

      const safeReturnPath = resolveSafeReturnPath(returnPath);
      const origin = window.location.origin;

      if (isLoginPopupSupported()) {
        const popupId = createLoginPopupId();
        const popupWindow = window.open(
          buildSocialLoginUrl(
            provider,
            buildLoginCallbackUrl({
              origin,
              returnPath: safeReturnPath,
              popupId,
            }),
          ),
          LOGIN_POPUP_WINDOW_NAME,
          LOGIN_POPUP_FEATURES,
        );

        if (popupWindow) {
          pending.returnPathById.set(popupId, safeReturnPath);
          pending.latestPopupId = popupId;
          pending.latestPopupWindow = popupWindow;
          return;
        }
      }

      // 팝업이 막혔거나 지원되지 않으면 이 창에서 진행한다.
      window.location.href = buildSocialLoginUrl(
        provider,
        buildLoginCallbackUrl({ origin, returnPath: safeReturnPath }),
      );
    },
    [returnPath],
  );

  useEffect(() => {
    if (!isLoginPopupSupported()) return;

    return subscribeLoginPopupResult(({ popupId, code }) => {
      const pending = pendingRef.current;
      const pendingReturnPath = pending.returnPathById.get(popupId);
      // 다른 탭의 로그인이나 이미 반영한 결과는 이 창의 몫이 아니다.
      // 수신을 확인하지 않으므로 그 팝업은 스스로 마무리한다.
      if (pendingReturnPath === undefined) return false;

      const isLatest = popupId === pending.latestPopupId;
      if (code !== "LOGIN_SUCCESS" && !isLatest) {
        // 뒤에 연 팝업이 서버의 인증 요청을 덮어써 앞의 팝업이 실패한 것이다.
        // 진행 중인 로그인이 있으니 실패를 알리지 않는다. 팝업은 닫히게 확인만 한다.
        pending.returnPathById.delete(popupId);
        return true;
      }

      // 로그인이 끝났으니 기억하던 팝업을 모두 비워 같은 결과를 두 번 받지 않는다.
      pending.returnPathById.clear();
      pending.latestPopupId = null;
      pending.latestPopupWindow = null;

      applyLoginResult({
        code,
        returnPath: pendingReturnPath,
        navigate,
        queryClient,
      });
      return true;
    });
  }, [navigate, queryClient]);

  return { startLogin };
};
