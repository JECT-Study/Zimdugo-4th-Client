import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";
import { stripLocalePathPrefix } from "#/shared/i18n/locales";
import { isProtectedPath } from "#/shared/model/protected-paths";
import { useAuthPopupStore } from "#/shared/store/authPopupStore";
import { useAuthStore } from "#/shared/store/authStore";

/**
 * 보호 경로 체류 중 인증이 끊기면 내보내는 가드.
 *
 * `requireAuthenticatedRoute` 는 `beforeLoad` 라서 매치가 새로 만들어질 때만 돈다.
 * 이미 렌더된 페이지 위에서 `isAuthenticated` 가 false 로 바뀌어도 다시 확인하지
 * 않으므로, 사용자는 아무것도 할 수 없는 페이지에 그대로 남는다. 인증이 끊기는
 * 경로는 최소 세 갈래다.
 *
 * - `useBootstrapAuth` 의 세션 복구 실패
 * - `apiClient` 401 인터셉터의 재시도 실패 (페이지를 열어둔 채 세션 만료)
 * - 다른 탭에서 로그아웃 — 이 경우는 공유 쿠키만 바뀌고 이 문서의 메모리 상태는
 *   그대로라, 탭이 다시 보이거나 bfcache 로 복원될 때 저장소를 다시 읽어야 한다
 *
 * 로그인 페이지의 역가드 `useRedirectWhenAuthenticated` 와 방향만 반대인 같은 구조다.
 * 그쪽 주석이 설명하는 "`beforeLoad` 가 다시 실행되지 않는" 문제를 보호 경로가
 * 방향만 바꿔 겪는다.
 *
 * 라우트마다 붙이지 않고 루트에서 한 번만 돈다. 경로 판정을 `PROTECTED_PATHS` 에
 * 위임하므로 보호 라우트가 늘어도 이 훅을 다시 손댈 일이 없다.
 */
export const useRedirectWhenUnauthenticated = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  // bfcache 복원은 재수화가 상태를 바꿔 구독 effect 도 같이 깨우므로 pageshow 처리와
  // 겹친다. 같은 목적지로 두 번 이동하지 않도록 한 번만 보낸다.
  const hasRedirectedRef = useRef(false);

  const redirectIfUnauthenticated = useCallback(() => {
    if (hasRedirectedRef.current) return;
    if (!isProtectedPath(stripLocalePathPrefix(pathname))) return;
    if (useAuthStore.getState().isAuthenticated) return;

    hasRedirectedRef.current = true;
    // 쫓겨난 자리를 담아 두어야 로그인 후 하던 일로 돌아올 수 있다.
    useAuthPopupStore.getState().openPopup(pathname);
    navigate({ to: "/", replace: true });
  }, [navigate, pathname]);

  /**
   * 저장소를 다시 읽은 뒤 판정한다.
   *
   * 로그아웃은 공유 쿠키를 갱신하지만, 쿠키에는 `storage` 이벤트가 없어서 다른
   * 탭의 zustand 메모리 상태는 `true` 로 남는다. 그래서 이 문서의 스토어만 보면
   * 이미 로그아웃한 사용자를 계속 보호 페이지에 두게 된다. 탭이 다시 보이는
   * 시점과 bfcache 복원 시점에 쿠키를 메모리로 끌어와야 판정이 최신이 된다.
   */
  const rehydrateAndRedirect = useCallback(() => {
    void Promise.resolve(useAuthStore.persist.rehydrate()).then(() => {
      redirectIfUnauthenticated();
    });
  }, [redirectIfUnauthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      // 다시 로그인하면 다음 상실에서 또 내보낼 수 있어야 한다.
      hasRedirectedRef.current = false;
      return;
    }

    redirectIfUnauthenticated();
  }, [isAuthenticated, redirectIfUnauthenticated]);

  useEffect(() => {
    const handlePageShow = () => {
      rehydrateAndRedirect();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      rehydrateAndRedirect();
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [rehydrateAndRedirect]);
};
