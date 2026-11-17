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

interface PendingLoginPopup {
  popupId: string;
  returnPath: string;
  popupWindow: Window;
}

/**
 * 소셜 로그인을 팝업 창에서 진행하고, 끝나면 이 창에서 결과를 반영한다.
 *
 * 로그인 과정이 팝업 안에서만 오가므로 이 창의 히스토리에는 제공자 페이지가
 * 쌓이지 않는다. 팝업을 열 수 없으면 지금처럼 이 창을 제공자로 보낸다.
 */
export const useSocialLoginPopup = ({ returnPath }: { returnPath: string }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // 진행 중인 팝업은 하나뿐이다. 결과를 반영하면 비워 같은 결과를 두 번 받지 않는다.
  const pendingRef = useRef<PendingLoginPopup | null>(null);

  const startLogin = useCallback(
    (provider: LoginProvider) => {
      const pending = pendingRef.current;
      // 서버는 마지막 시작 요청만 기억하므로 팝업을 새로 열면 앞의 것이 실패한다.
      // 열려 있는 팝업이 있으면 그 창을 앞으로 가져온다.
      if (pending && !pending.popupWindow.closed) {
        pending.popupWindow.focus();
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
          pendingRef.current = {
            popupId,
            returnPath: safeReturnPath,
            popupWindow,
          };
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
      // 이 창이 연 팝업의 결과만 받는다. 다른 탭의 로그인이나 지난 결과는 무시한다.
      if (!pending || pending.popupId !== popupId) return;

      pendingRef.current = null;
      applyLoginResult({
        code,
        returnPath: pending.returnPath,
        navigate,
        queryClient,
      });
    });
  }, [navigate, queryClient]);

  return { startLogin };
};
