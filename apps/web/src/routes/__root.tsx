import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Analytics } from "@vercel/analytics/react";
import type { ReactNode } from "react";
import "@repo/ui/styles/global.css";
import { languageTag, m } from "@repo/i18n";
import { AppContainer } from "@repo/ui/components/layout/app-container";
import { AppShell } from "@repo/ui/components/layout/app-shell";
import { AuthRequirePopup } from "#/features/auth/sign-in/ui/AuthRequirePopup";
import { LoginResultModal } from "#/features/auth/sign-in/ui/LoginResultModal";
import {
  getSeoLocale,
  getSeoSiteName,
} from "#/features/seo/model/localized-seo-head";
import { useBootstrapAuth } from "#/shared/hooks/useBootstrapAuth";
import { useLoginResultHandler } from "#/shared/hooks/useLoginResultHandler";
import { useServiceWorker } from "#/shared/hooks/useServiceWorker";
import {
  BASE_LOCALE,
  normalizeLocale,
  stripLocalePathPrefix,
} from "#/shared/i18n/locales";
import { isPathnameTransitionPending } from "#/shared/model/page-transition";
import { GtmBodyNoscript, GtmHeadScript } from "#/shared/ui/GtmContainer";
import { NotFoundComponent } from "#/shared/ui/NotFound";
import {
  PageTransitionContentBoundary,
  PageTransitionOverlay,
} from "#/shared/ui/PageTransitionOverlay";

const GTM_CONTAINER_ID = import.meta.env.VITE_GTM_CONTAINER_ID;

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

  html[data-scroll-page="true"],
  html[data-scroll-page="true"] body {
    height: auto;
    min-height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }

  html[data-scroll-page="true"] #root {
    height: auto;
    min-height: 100%;
    overflow: visible;
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

const COMPACT_DEVICE_LAYOUT_SCRIPT = `
(function () {
  try {
    var hasCoarsePointer =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
    var maxTouchPoints =
      window.navigator && typeof window.navigator.maxTouchPoints === "number"
        ? window.navigator.maxTouchPoints
        : 0;
    var hasTouch = maxTouchPoints > 0 || "ontouchstart" in window;
    var isTouchLike = hasCoarsePointer || hasTouch;

    function isCompactDevice() {
      var screenWidth = window.screen && window.screen.width;
      var screenHeight = window.screen && window.screen.height;
      var viewportWidth = window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || 0;
      var viewportHeight = window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || 0;
      var shortSide = Math.min(screenWidth || 0, screenHeight || 0);
      var pixelRatio = window.devicePixelRatio || 1;
      var isPhysicalScreen =
        (viewportWidth > 0 && (screenWidth || 0) > viewportWidth * 1.5) ||
        (viewportHeight > 0 && (screenHeight || 0) > viewportHeight * 1.5);
      var cssShortSide =
        isPhysicalScreen && pixelRatio > 1 ? shortSide / pixelRatio : shortSide;

      return (
        isTouchLike &&
        ((shortSide > 0 && shortSide < 600) ||
          (cssShortSide > 0 && cssShortSide < 600))
      );
    }

    function syncCompactDeviceLayout() {
      if (isCompactDevice()) {
        document.documentElement.dataset.compactDevice = "true";
      } else {
        delete document.documentElement.dataset.compactDevice;
      }
    }

    syncCompactDeviceLayout();

    if (isTouchLike) {
      window.addEventListener("resize", syncCompactDeviceLayout, {
        passive: true,
      });
      window.addEventListener("orientationchange", syncCompactDeviceLayout, {
        passive: true,
      });
    }
  } catch (_) {
  }
})();
`;

type SeoHeadLocationContext = {
  location?: {
    publicHref?: string;
  };
};

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: (context) => {
    const { matches } = context;
    const publicHref = (context as SeoHeadLocationContext).location?.publicHref;
    const pathname = matches.at(-1)?.pathname ?? "/";
    const locale = getSeoLocale({
      publicHref,
      pathname,
      runtimeLocale: languageTag(),
    });
    const siteName = getSeoSiteName(locale);
    const title = m.seo_global_title({}, { locale });
    const description = m.seo_global_description({}, { locale });

    return {
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        {
          title,
        },
        {
          name: "description",
          content: description,
        },
        {
          property: "og:site_name",
          content: siteName,
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          name: "twitter:card",
          content: "summary",
        },
        {
          name: "theme-color",
          content: "#3bd569",
        },
        // iOS Safari는 홈 화면에 추가된 PWA에서만 웹 푸시를 허용하므로
        // 설치형 실행에 필요한 메타를 함께 내려준다.
        {
          name: "mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "apple-mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "default",
        },
        {
          name: "apple-mobile-web-app-title",
          content: "ZimDugo",
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
          rel: "manifest",
          href: "/manifest.json",
        },
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
    };
  },
  shellComponent: RootDocument,
  notFoundComponent: NotFoundComponent,
});

function RootDocument({ children }: { children: ReactNode }) {
  useBootstrapAuth();
  useLoginResultHandler();
  useServiceWorker();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isPageTransitionPending = useRouterState({
    select: (state) =>
      isPathnameTransitionPending({
        status: state.status,
        currentPathname: state.location.pathname,
        resolvedPathname:
          state.resolvedLocation?.pathname ?? state.matches.at(-1)?.pathname,
      }),
  });
  // paraglide 가 URL 우선 전략이라 서버와 클라이언트가 같은 값을 낸다.
  const lang = normalizeLocale(languageTag()) ?? BASE_LOCALE;
  const normalizedPath = stripLocalePathPrefix(pathname);
  const isDocumentScrollPage =
    normalizedPath === "/report" || normalizedPath.startsWith("/report/");

  return (
    <html
      lang={lang}
      data-scroll-page={isDocumentScrollPage ? "true" : undefined}
    >
      <head>
        <GtmHeadScript containerId={GTM_CONTAINER_ID} />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static bootstrap script marks compact physical devices before first paint
          dangerouslySetInnerHTML={{ __html: COMPACT_DEVICE_LAYOUT_SCRIPT }}
        />
        <style>{CRITICAL_LAYOUT_CSS}</style>
        <HeadContent />
      </head>
      <body>
        <GtmBodyNoscript containerId={GTM_CONTAINER_ID} />
        <AppContainer mode={isDocumentScrollPage ? "document" : "app"}>
          <PageTransitionContentBoundary isBlocked={isPageTransitionPending}>
            <AppShell mode={isDocumentScrollPage ? "document" : "app"}>
              {children}
            </AppShell>
          </PageTransitionContentBoundary>
          <PageTransitionOverlay isActive={isPageTransitionPending} />
        </AppContainer>
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
        <AuthRequirePopup />
        <LoginResultModal />
        <Analytics />
      </body>
    </html>
  );
}
