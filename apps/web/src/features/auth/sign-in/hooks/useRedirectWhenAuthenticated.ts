import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { resolveSafeReturnPath } from "#/features/auth/sign-in/model/safe-return-path";
import { useAuthStore } from "#/shared/store/authStore";

interface RedirectWhenAuthenticatedOptions {
  returnPath: string;
  /** OAuth 콜백 처리 중에는 콜백 핸들러가 이동을 담당하므로 비활성화한다. */
  isEnabled?: boolean;
}

/**
 * 로그인 페이지 전용 역(逆)가드.
 *
 * 라우트의 `beforeLoad`는 매치가 새로 만들어질 때만 실행되므로,
 * 뒤로가기(popstate)나 bfcache 복원처럼 기존 매치가 재사용되는 경로에서는
 * 이미 로그인한 사용자가 로그인 페이지에 그대로 머무를 수 있습니다.
 * 렌더링 시점과 페이지 복원 시점에 한 번 더 확인해 목적지로 돌려보냅니다.
 */
export const useRedirectWhenAuthenticated = ({
  returnPath,
  isEnabled = true,
}: RedirectWhenAuthenticatedOptions) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const safePath = resolveSafeReturnPath(returnPath);

  const redirectIfAuthenticated = useCallback(() => {
    if (!isEnabled) return;
    if (!useAuthStore.getState().isAuthenticated) return;

    navigate({ to: safePath as never, replace: true });
  }, [isEnabled, navigate, safePath]);

  useEffect(() => {
    if (!isAuthenticated) return;

    redirectIfAuthenticated();
  }, [isAuthenticated, redirectIfAuthenticated]);

  useEffect(() => {
    const handlePageShow = async (event: PageTransitionEvent) => {
      // bfcache 복원은 리렌더 없이 되살아나므로 이 시점에 다시 확인한다.
      if (!event.persisted) return;

      // 이 문서가 얼려 있는 동안 다른 문서에서 로그인이 끝났을 수 있다.
      // 그 경우 쿠키는 로그인 상태지만 복원된 메모리 상태는 로그인 전 값이므로,
      // 판단 전에 persist 저장소를 다시 읽어 최신 상태로 맞춘다.
      await useAuthStore.persist.rehydrate();

      redirectIfAuthenticated();
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [redirectIfAuthenticated]);
};
