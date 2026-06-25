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
    parseSearch: (searchStr) => {
      const params = new URLSearchParams(searchStr);
      const result: Record<string, any> = {};
      params.forEach((value, key) => {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      });
      return result;
    },
    stringifySearch: (search) => {
      const params = new URLSearchParams();
      Object.entries(search).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (typeof value === "string") {
          params.set(key, value);
        } else {
          params.set(key, JSON.stringify(value));
        }
      });
      const query = params.toString();
      return query ? `?${query}` : "";
    },
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
