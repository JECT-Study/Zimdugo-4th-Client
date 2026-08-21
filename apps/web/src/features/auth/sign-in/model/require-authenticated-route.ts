import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "#/shared/store/authStore";

interface RequireAuthenticatedRouteArgs {
  location: { pathname: string };
  preload?: boolean;
}

/**
 * 로그인해야 볼 수 있는 라우트의 `beforeLoad` 가드.
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
  if (useAuthStore.getState().isAuthenticated) return;

  if (typeof window !== "undefined" && !preload) {
    import("#/shared/store/authPopupStore").then((module) =>
      module.useAuthPopupStore.getState().openPopup(location.pathname),
    );
  }

  throw redirect({
    to: "/",
    replace: true,
  });
};
