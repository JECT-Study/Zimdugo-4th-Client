import { createFileRoute, notFound } from "@tanstack/react-router";
import { readSearchPlaceIdParam } from "#/features/search/model/search-url-state";
import { createGlobalMapScreenHead } from "./-map-screen-head";

/**
 * 장소의 보관함 목록. 검색어(`q`)가 함께 있으면 검색에서 연 목록, 없으면 지도에서 연
 * 목록이다(`map-screen`).
 */
export const Route = createFileRoute("/_map/_screen/places/$placeId")({
  beforeLoad: ({ params }) => {
    if (readSearchPlaceIdParam(params.placeId) === undefined) {
      throw notFound();
    }
  },
  head: (context) =>
    createGlobalMapScreenHead(context, { canonicalPathname: "/" }),
});
