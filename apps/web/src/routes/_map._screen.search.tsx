import { createFileRoute, redirect } from "@tanstack/react-router";
import { createNoIndexFollowMeta } from "#/features/seo/model/robots-meta";
import { createGlobalMapScreenHead } from "./-map-screen-head";

/**
 * 검색 결과. 검색어는 쿼리(`q`)로 남는다. 화면의 정체성이 아니라 상태라서다.
 *
 * 검색어가 없으면 보여 줄 결과가 없어 홈으로 보낸다.
 *
 * 검색 결과는 색인하지 않는다(`noindex, follow`). 검색어마다 주소가 생기지만 내용은
 * 지도 위 목록이라 따로 색인될 이유가 없다. canonical 을 홈으로 두는 것만으로는
 * 내용이 다른 페이지라 검색엔진이 무시할 수 있다. 목록의 상세 링크는 따라가게 둔다.
 */
export const Route = createFileRoute("/_map/_screen/search")({
  beforeLoad: ({ search }) => {
    if ((search as { q?: string }).q === undefined) {
      throw redirect({ to: "/", replace: true });
    }
  },
  head: (context) => {
    const head = createGlobalMapScreenHead(context, { canonicalPathname: "/" });
    return { ...head, meta: [...head.meta, createNoIndexFollowMeta()] };
  },
});
