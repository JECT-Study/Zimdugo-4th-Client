import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  readMapScreenSearch,
  toMapScreenRoute,
} from "#/shared/lib/map-path-url";
import { createGlobalMapScreenHead } from "./-map-screen-head";

/**
 * 홈.
 *
 * 화면이 경로를 갖기 전의 쿼리 주소(`/?q=…`, `/?searchPlaceId=…`, `/?locker=…`)로
 * 들어오면 그 화면의 경로로 옮긴다. 상세의 구 주소는 서버가 먼저 301 로 옮기지만,
 * 프리렌더된 홈 파일이 먼저 응답하는 환경에서는 여기까지 온다.
 *
 * 앱 안 딥링크(`/?openLockerId=…`)는 옮기지 않는다. 화면이 보관함을 연 뒤 상세 경로로
 * 바꾼다.
 */
export const Route = createFileRoute("/_map/_screen/")({
  beforeLoad: ({ location }) => {
    /*
     * 서버에서만 옮긴다. 클라이언트에서는 하이드레이션 중에 이 리다이렉트와 화면의
     * 주소 정리(`useMapScreenNavigation`)가 함께 일어나 라우터가 대기 상태에 갇혔다.
     * 프리렌더된 홈 파일로 들어온 경우처럼 서버가 못 본 주소는 화면이 정리한다.
     */
    if (typeof window !== "undefined") return;

    const route = toMapScreenRoute(
      readMapScreenSearch({
        pathname: "/",
        search: location.search as Record<string, unknown>,
      }),
    );

    if (route.to !== "/") {
      throw redirect({ ...route, replace: true } as never);
    }
  },
  head: (context) => createGlobalMapScreenHead(context),
});
