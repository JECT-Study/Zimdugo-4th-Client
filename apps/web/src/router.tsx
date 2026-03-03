import { deLocalizeUrl, localizeUrl } from "@repo/i18n";
import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient();

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
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
