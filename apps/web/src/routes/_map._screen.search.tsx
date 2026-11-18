import { createFileRoute, redirect } from "@tanstack/react-router";
import { createGlobalMapScreenHead } from "./-map-screen-head";

/**
 * 검색 결과. 검색어는 쿼리(`q`)로 남는다. 화면의 정체성이 아니라 상태라서다.
 *
 * 검색어가 없으면 보여 줄 결과가 없어 홈으로 보낸다.
 */
export const Route = createFileRoute("/_map/_screen/search")({
  beforeLoad: ({ search }) => {
    if ((search as { q?: string }).q === undefined) {
      throw redirect({ to: "/", replace: true });
    }
  },
  head: (context) =>
    createGlobalMapScreenHead(context, { canonicalPathname: "/" }),
});
