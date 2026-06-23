import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { type ReactNode, useEffect, useState } from "react";
import "@repo/ui/styles/global.css";
import { languageTag, m } from "@repo/i18n";
import { AppContainer } from "@repo/ui/components/layout/app-container";
import { AppShell } from "@repo/ui/components/layout/app-shell";
import {
  BOTTOM_TAB_LINKS,
  BottomTabBar,
  shouldShowBottomTab,
} from "#/entities/navigation";
import { AuthRequirePopup } from "#/features/auth/sign-in/ui/AuthRequirePopup";
import { LoginResultModal } from "#/features/auth/sign-in/ui/LoginResultModal";
import { useBootstrapAuth } from "#/shared/hooks/useBootstrapAuth";
import { useLoginResultHandler } from "#/shared/hooks/useLoginResultHandler";
import {
  BASE_LOCALE,
  LOCALE_NORMALIZATION_GROUPS,
  LOCALE_PATH_PREFIX,
} from "#/shared/i18n/locales";
import {
  getRuntimeLanguage,
  getUrlLanguage,
  resolveLanguageSyncAction,
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

const INITIAL_LANGUAGE_REDIRECT_SCRIPT = `
(function () {
  try {
    var baseLocale = ${JSON.stringify(BASE_LOCALE)};
    var normalizationGroups = ${JSON.stringify(LOCALE_NORMALIZATION_GROUPS)};
    var localePathPattern = new RegExp(${JSON.stringify(LOCALE_PATH_PREFIX.source)}, ${JSON.stringify(LOCALE_PATH_PREFIX.flags)});
    var raw = window.localStorage.getItem("app-language");
    if (!raw) return;

    var parsed = JSON.parse(raw);
    var language = parsed && parsed.state && parsed.state.appLanguage;
    var normalized = null;

    if (typeof language === "string") {
      var lower = language.toLowerCase().replace(/_/g, "-");
      for (var i = 0; i < normalizationGroups.length; i += 1) {
        var group = normalizationGroups[i];
        for (var j = 0; j < group.prefixes.length; j += 1) {
          if (lower.indexOf(group.prefixes[j]) === 0) {
            normalized = group.locale;
            break;
          }
        }
        if (normalized) break;
      }
    }

    if (!normalized || normalized === baseLocale) return;

    var pathname = window.location.pathname;
    var hasPathLocale = localePathPattern.test(pathname);
    if (hasPathLocale) return;

    var nextPathname = "/" + normalized + (pathname === "/" ? "" : pathname);
    window.location.replace(nextPathname + window.location.search + window.location.hash);
  } catch (_) {
  }
})();
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
        title: m.seo_global_title(),
      },
      {
        name: "description",
        content: m.seo_global_description(),
      },
      {
        name: "theme-color",
        content: "#3bd569",
      },
      {
        name: "google-site-verification",
        content: "gpgSPQCFt-Gg188XTXUl8KrpB4gPuU6EH0b0i9OTlLE",
      },
      {
        name: "naver-site-verification",
        content: "afc6fa2a6561bcfafa769e5938396bb6e61fd894",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        rel: "icon",
        href: "/favicon.ico",
        sizes: "any",
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

  // 경로가 바뀌면 URL locale과 runtime/store 언어를 다시 맞춘다.
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [runtimeLanguage, setRuntimeLanguage] = useState(() =>
    getRuntimeLanguage(),
  );
  const hasLanguageHydrated = useAppLanguageStore((state) => state.hasHydrated);
  const initializeLanguage = useAppLanguageStore(
    (state) => state.initializeLanguage,
  );
  const lang = runtimeLanguage;
  const showBottomTab = shouldShowBottomTab(pathname);

  useEffect(() => {
    if (!hasLanguageHydrated) {
      return;
    }

    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const action = resolveLanguageSyncAction({
      href: currentHref,
      urlLanguage: getUrlLanguage(pathname),
      persistedLanguage: useAppLanguageStore.getState().appLanguage,
      runtimeLanguage: languageTag(),
    });

    if (action.kind === "redirect") {
      window.location.replace(action.href);
      return;
    }

    initializeLanguage(action.language);
    setRuntimeLanguage(getRuntimeLanguage());
  }, [hasLanguageHydrated, initializeLanguage, pathname]);

  return (
    <html lang={lang}>
      <head>
        <title>{m.seo_global_title()}</title>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static bootstrap script runs before hydration to normalize locale-less URLs
          dangerouslySetInnerHTML={{ __html: INITIAL_LANGUAGE_REDIRECT_SCRIPT }}
        />
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
