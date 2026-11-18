import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { parseLockerSearchParam } from "#/features/search/model/search-url-state";
import { toLockerPathSlug } from "#/shared/lib/map-path-url";
import { createLockerDetailHead, loadLockerDetail } from "./-map-screen-head";

/**
 * 보관함 상세.
 *
 * 정적 파일이 없는 경로라 요청마다 서버가 그리고, 로더가 그 보관함을 가져와 상세
 * 메타 태그를 낸다. 홈은 프리렌더된 정적 파일이라 `/?locker=` 로는 이 일을 할 수
 * 없었다(#215 1-7).
 *
 * 경로는 id 만 쓴다(`toLockerPathSlug`). 이름이 붙은 예전 주소(`/lockers/164-강남역-…`)
 * 나 깨진 모양(`/lockers/164-a%2Fb`)은 `/lockers/164` 로 옮긴다. 사이트맵이 색인시켰고
 * 사용자가 공유한 모양이라, 검색엔진이 순위를 새 주소로 옮기도록 301 로 답한다.
 */
export const Route = createFileRoute("/_map/_screen/lockers/$slug")({
  beforeLoad: ({ params, search }) => {
    if (parseLockerSearchParam(params.slug) === undefined) {
      throw notFound();
    }

    const canonicalSlug = toLockerPathSlug(params.slug);
    if (canonicalSlug !== null && canonicalSlug !== params.slug) {
      throw redirect({
        to: "/lockers/$slug",
        params: { slug: canonicalSlug },
        search,
        replace: true,
        statusCode: 301,
      } as never);
    }
  },
  /*
   * 서버에서만 가져온다. 이 로더의 목적은 서버가 상세 메타 태그를 내는 것이다.
   * 클라이언트 이동에서도 돌면 화면이 따로 묻는 상세를 한 번 더 요청하고, 그 응답을
   * 기다리느라 이동이 늦어진다. 화면은 클라이언트 쿼리로 상세를 채운다.
   */
  loader: ({ params }) =>
    typeof window === "undefined"
      ? loadLockerDetail(parseLockerSearchParam(params.slug) as number)
      : { detail: null },
  head: (context) =>
    createLockerDetailHead(context, context.loaderData?.detail),
});
