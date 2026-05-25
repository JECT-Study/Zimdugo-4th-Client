import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import "@repo/ui/styles/global.css";
import { languageTag } from "@repo/i18n";
import { AppContainer } from "@repo/ui/components/layout/app-container";
import { AppShell } from "@repo/ui/components/layout/app-shell";
import { BottomTabBar, type BottomTabKey } from "#/entities/navigation";
import { NotFoundComponent } from "#/shared/ui/NotFound";

const BOTTOM_TAB_LINKS: Record<BottomTabKey, string> = {
  home: "/",
  report: "/report",
  my: "/my",
  settings: "/settings",
};

const getActiveBottomTab = (pathname: string): BottomTabKey => {
  const normalizedPath =
    pathname.replace(/^\/(?:ko|en|ja|zh)(?=\/|$)/, "") || "/";

  if (normalizedPath === "/report" || normalizedPath.startsWith("/report/")) {
    return "report";
  }
  if (normalizedPath === "/my" || normalizedPath.startsWith("/my/")) {
    return "my";
  }
  if (
    normalizedPath === "/settings" ||
    normalizedPath.startsWith("/settings/")
  ) {
    return "settings";
  }

  return "home";
};

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      {
        title: "Zimdugo",
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundComponent,
});

function RootDocument({ children }: { children: ReactNode }) {
  const lang = languageTag();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <html lang={lang}>
      <head>
        <title>Zimdugo</title>
        <HeadContent />
      </head>
      <body>
        <AppContainer>
          <AppShell
            bottomTabBar={
              <BottomTabBar
                activeTab={getActiveBottomTab(pathname)}
                links={BOTTOM_TAB_LINKS}
              />
            }
          >
            {children}
          </AppShell>
        </AppContainer>
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
