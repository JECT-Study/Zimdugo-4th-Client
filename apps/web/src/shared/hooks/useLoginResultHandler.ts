import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { applyLoginResult } from "#/features/auth/sign-in/model/apply-login-result";
import {
  handOffLoginPopupResult,
  isLoginPopupSupported,
} from "#/features/auth/sign-in/model/login-popup-channel";
import { resolveSafeReturnPath } from "#/features/auth/sign-in/model/safe-return-path";
import { LOGIN_POPUP_ID_PARAM } from "#/features/auth/sign-in/model/social-login-url";

/** 수신 확인 뒤 창이 닫히지 않았다고 보고 이 창에서 직접 처리하기까지 기다리는 시간. */
export const LOGIN_POPUP_CLOSE_FALLBACK_MS = 500;

export const useLoginResultHandler = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // @tanstack/react-router의 useSearch는 strict: false일 때 location.search 전체를 반환합니다.
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const code = search.code as string | undefined;
  const popupId = search[LOGIN_POPUP_ID_PARAM] as string | undefined;
  const returnPath = resolveSafeReturnPath(search.returnPath);

  useEffect(() => {
    if (!code) return;

    const handleInPlace = () =>
      applyLoginResult({ code, returnPath, navigate, queryClient });

    if (!popupId || !isLoginPopupSupported()) {
      handleInPlace();
      return;
    }

    // 팝업 안으로 돌아온 결과다. 팝업을 연 창에 넘기고, 그 창이 받았다고
    // 확인하면 닫힌다. 토큰 발급과 이동은 그 창이 맡는다.
    let isCancelled = false;
    let closeFallbackTimer: number | undefined;

    const handOff = async () => {
      const isAcknowledged = await handOffLoginPopupResult({ popupId, code });
      if (isCancelled) return;

      // 원래 창이 새로고침됐거나 로그인 화면을 떠나 받을 수 없다.
      // 결과를 버리지 않도록 이 창에서 로그인을 마친다.
      if (!isAcknowledged) {
        handleInPlace();
        return;
      }

      window.close();
      // 사용자가 주소를 직접 열었거나 브라우저가 닫기를 막으면 창이 남는다.
      // 빈 화면에 갇히지 않게 이 창도 로그인 상태로 목적지에 보낸다.
      closeFallbackTimer = window.setTimeout(() => {
        if (!window.closed) handleInPlace();
      }, LOGIN_POPUP_CLOSE_FALLBACK_MS);
    };

    handOff();

    return () => {
      isCancelled = true;
      window.clearTimeout(closeFallbackTimer);
    };
  }, [code, popupId, navigate, queryClient, returnPath]);
};
