import { deLocalizeUrl, localizeUrl } from "@repo/i18n";
import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { keepDocumentLocaleOnTraverse } from "#/shared/i18n/document-locale-history";
import { BASE_LOCALE, parsePathLocale } from "#/shared/i18n/locales";
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
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
  });

  if (typeof window !== "undefined") {
    keepDocumentLocaleOnTraverse(
      router.history,
      parsePathLocale(window.location.pathname) ?? BASE_LOCALE,
    );
  }

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
