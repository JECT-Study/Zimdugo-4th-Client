import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "#/shared/store/authStore";

interface RequireAuthenticatedRouteArgs {
  location: { pathname: string };
  preload?: boolean;
}

/**
 * 로그인해야 볼 수 있는 라우트의 `beforeLoad` 가드. 브라우저 안에서 일어나는
 * 이동만 담당한다. 문서 요청은 `server-protected-route-guard` 가 막는다.
 *
 * 비로그인 상태면 홈으로 돌려보내고, 돌아올 경로를 담아 로그인 팝업을 띄운다.
 * 팝업 스토어는 브라우저에서만 의미가 있으므로 동적 import 로 미루고,
 * preload(hover 프리페치)로 들어온 호출에서는 사용자가 이동한 적이 없으니 띄우지 않는다.
 *
 * `/report`, `/my/favorites`, `/my/reports` 가 같은 판정을 각자 복제하고 있어서 한곳으로 모았다.
 */
export const requireAuthenticatedRoute = ({
  location,
  preload,
}: RequireAuthenticatedRouteArgs) => {
  // SSR 에서는 판정하지 않는다. `authStore` 의 쿠키 스토리지가 `window` 없이는
  // `null` 을 돌려줘서 로그인한 사용자도 비로그인으로 보이기 때문이다. 문서
  // 요청은 `resolveProtectedRequest` 가 쿠키를 직접 읽어 서버에서 막는다.
  if (typeof window === "undefined") return;

  if (useAuthStore.getState().isAuthenticated) return;

  if (!preload) {
    import("#/shared/store/authPopupStore").then((module) =>
      module.useAuthPopupStore.getState().openPopup(location.pathname),
    );
  }

  throw redirect({
    to: "/",
    replace: true,
  });
};
