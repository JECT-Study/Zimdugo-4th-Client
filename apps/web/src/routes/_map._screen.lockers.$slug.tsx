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
 * 슬러그가 정규 모양이 아니면 정규 슬러그로 옮긴다. `/lockers/164-a%2Fb` 는
 * `/lockers/164` 가 된다.
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
