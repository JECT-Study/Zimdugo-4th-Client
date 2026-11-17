import { deLocalizeUrl, localizeUrl } from "@repo/i18n";
import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { toInternalMapUrl, toPublicMapUrl } from "#/shared/lib/map-path-url";
import {
  parseSearchString,
  stringifySearchParams,
} from "#/shared/lib/search-serialization";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient();

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    parseSearch: parseSearchString,
    stringifySearch: stringifySearchParams,
    /*
     * 바깥 주소와 라우터 안쪽 주소를 오가는 변환. 순서가 뒤집혀 있어야 한다.
     * 들어올 때는 로케일을 먼저 걷고 상세 경로를 쿼리로, 나갈 때는 쿼리를 상세
     * 경로로 옮긴 뒤 로케일을 붙인다. 그래야 `/en/lockers/164` 가 안쪽에서
     * `/?locker=164` 로 보이고 다시 같은 주소로 나간다.
     */
    rewrite: {
      input: ({ url }) => toInternalMapUrl(deLocalizeUrl(url)),
      output: ({ url }) => localizeUrl(toPublicMapUrl(url)),
    },
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
