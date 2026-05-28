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

const CRITICAL_LAYOUT_CSS = `
  *, ::before, ::after {
    box-sizing: border-box;
  }

  html,
  body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  body {
    background-color: #f5f5f5;
  }

  #app,
  #root {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  button,
  [role="button"] {
    font: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

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

const shouldShowBottomTab = (pathname: string) => {
    const normalizedPath =
        pathname.replace(/^\/(?:ko|en|ja|zh)(?=\/|$)/, "") || "/";

    return normalizedPath !== "/login";
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

import { useBootstrapAuth } from "#/shared/hooks/useBootstrapAuth";
import { useLoginResultHandler } from "#/shared/hooks/useLoginResultHandler";
import { AuthRequirePopup } from "#/features/auth/sign-in/ui/AuthRequirePopup";
import { LoginResultModal } from "#/features/auth/sign-in/ui/LoginResultModal";

function RootDocument({ children }: { children: ReactNode }) {
  const lang = languageTag();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const showBottomTab = shouldShowBottomTab(pathname);

    // 로그인 상태 초기화 및 인증 결과 감지
  useBootstrapAuth();
  useLoginResultHandler();

  return (
    <html lang={lang}>
      <head>
        <title>Zimdugo</title>
        <style>{CRITICAL_LAYOUT_CSS}</style>
        <HeadContent />
      </head>
      <body>
        <AppContainer>
          <AppShell
            bottomTabBar={
                showBottomTab ? (
                    <BottomTabBar
                        activeTab={getActiveBottomTab(pathname)}
                        links={BOTTOM_TAB_LINKS}
                    />
                ) : undefined
            }
          >
            {children}
          </AppShell>
        </AppContainer>
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
        <AuthRequirePopup />
        <LoginResultModal />
      </body>
    </html>
  );
}
