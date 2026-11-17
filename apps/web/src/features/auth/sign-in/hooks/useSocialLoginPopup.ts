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

const LOGIN_POPUP_WINDOW_NAME_PREFIX = "zimdugo-social-login";

/**
 * 팝업마다 다른 창 이름을 쓴다.
 *
 * 같은 이름으로 window.open 을 부르면 그 이름의 창이 이미 있을 때 새 창을 열지
 * 않고 그 창으로 이동시킨다. 다시 누를 때 앞의 팝업을 close() 로 닫아도 닫기는
 * 바로 끝나지 않아, iOS Safari 에서는 닫히는 중인 뒤쪽 탭이 새 주소를 받고
 * 화면에는 아무 변화가 없었다. 이름이 다르면 언제나 새 탭이 열린다.
 */
export const getLoginPopupWindowName = (popupId: string) =>
  `${LOGIN_POPUP_WINDOW_NAME_PREFIX}-${popupId}`;
const LOGIN_POPUP_FEATURES = "popup=yes,width=480,height=720";

interface PendingLoginPopups {
  /** 이 창이 연 팝업들의 식별자와 그때의 목적지. 결과가 오기 전까지 남는다. */
  returnPathById: Map<string, string>;
  latestPopupId: string | null;
  latestPopupWindow: Window | null;
}

const closeLatestPopup = (pending: PendingLoginPopups) => {
  const { latestPopupId, latestPopupWindow } = pending;
  if (!latestPopupId || !latestPopupWindow || latestPopupWindow.closed) return;

  latestPopupWindow.close();
  pending.returnPathById.delete(latestPopupId);
  pending.latestPopupId = null;
  pending.latestPopupWindow = null;
};

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
      // 다시 누르면 언제나 로그인을 처음부터 새 창으로 시작한다.
      // 열린 팝업을 focus() 로 앞으로 가져오는 방식은 iOS Safari 에서 통하지 않는다.
      // 팝업이 새 탭으로 열려 다른 탭의 focus() 로는 전환되지 않으므로, 누르면
      // 아무 일도 일어나지 않는다. 서버는 마지막 시작 요청만 기억하므로 앞의
      // 팝업은 어차피 쓸 수 없다. 닫을 수 있으면 닫고 기억에서도 지운다.
      // 참조가 끊겨 닫을 수 없는 팝업은 남는다. 그 팝업의 실패는 가장 최근
      // 팝업의 것이 아니므로 결과를 받을 때 무시된다.
      closeLatestPopup(pending);

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
          getLoginPopupWindowName(popupId),
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
