import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect, type ReactNode } from "react";
import "@repo/ui/styles/global.css";
import { languageTag } from "@repo/i18n";
import { AppContainer } from "@repo/ui/components/layout/app-container";
import { AppShell } from "@repo/ui/components/layout/app-shell";
import { AuthRequirePopup } from "#/features/auth/sign-in/ui/AuthRequirePopup";
import { LoginResultModal } from "#/features/auth/sign-in/ui/LoginResultModal";
import {
  BOTTOM_TAB_LINKS,
  BottomTabBar,
  shouldShowBottomTab,
} from "#/entities/navigation";
import { useBootstrapAuth } from "#/shared/hooks/useBootstrapAuth";
import { useLoginResultHandler } from "#/shared/hooks/useLoginResultHandler";
import {
  getUrlLanguage,
  useAppLanguageStore,
} from "#/shared/store/language";
import { NotFoundComponent } from "#/shared/ui/NotFound";

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
      {
        name: "theme-color",
        content: "#3bd569",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        rel: "icon",
        href: "/icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        rel: "icon",
        href: "/icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        rel: "apple-touch-icon",
        href: "/icons/apple-touch-icon-180x180.png",
        sizes: "180x180",
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundComponent,
});

function RootDocument({ children }: { children: ReactNode }) {
  useBootstrapAuth();
  useLoginResultHandler();

  // 경로 변경 때 URL locale과 앱 언어 상태를 다시 맞춘다.
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const appLanguage = useAppLanguageStore((state) => state.appLanguage);
  const hasLanguageHydrated = useAppLanguageStore((state) => state.hasHydrated);
  const initializeLanguage = useAppLanguageStore(
    (state) => state.initializeLanguage,
  );
  const lang = hasLanguageHydrated ? appLanguage : languageTag();
  const showBottomTab = shouldShowBottomTab(pathname);

  useEffect(() => {
    if (!hasLanguageHydrated) {
      return;
    }

    initializeLanguage(getUrlLanguage(window.location.href));
  }, [hasLanguageHydrated, initializeLanguage, pathname]);

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
                <BottomTabBar links={BOTTOM_TAB_LINKS} />
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
