import { fileURLToPath } from "node:url";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const LOCALES = ["ko", "en", "ja", "zh", "zh-TW"] as const;
const appI18nEntry = fileURLToPath(new URL("./src/i18n.ts", import.meta.url));
const appI18nServerEntry = fileURLToPath(
  new URL("./src/i18n-server.ts", import.meta.url),
);
// 로케일 prefix 가 없는 문서 경로. 프리렌더 대상과 겹치는 주 진입 경로들이다.
const LOCALE_LESS_DOCUMENT_SRC = "^/(login|my|notices|report|settings)?(/.*)?$";
const API_BASE_URL =
  process.env.VITE_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "https://api.zimdugo.com";
const localizeHref = (path: string, { locale }: { locale: string }) => {
  if (locale === "ko") return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
};

const prerenderRoutes = ["/"].flatMap((path) =>
  LOCALES.map((locale) => ({
    path: localizeHref(path, { locale }),
    prerender: {
      enabled: true,
    },
  })),
);

// 로그인 여부에 따라 응답이 갈려야 하는 경로들. 정적으로 프리렌더되면 그 파일이
// 서버 핸들러보다 먼저 응답해 가드가 아예 실행되지 않고, CDN에도 한 쪽 상태가
// 그대로 캐시된다.
//
// 보호 경로(`/report`, `/my/*`)는 프리렌더가 비로그인으로 판정돼 홈으로
// 리다이렉트된 결과가 그 경로의 정적 파일로 굳어 있었다. 제보 페이지 자리에
// 홈 HTML 이 `noindex` 도 없이 들어앉아 중복 콘텐츠가 되고, 그 파일이 서빙되면
// 서버 가드도 건너뛴다. 프리렌더 대상에서 제외한다.
const AUTH_DEPENDENT_PATHS = [
  "/login",
  "/report",
  "/my/reports",
  "/my/favorites",
] as const;

const nonPrerenderRoutes = AUTH_DEPENDENT_PATHS.flatMap((path) =>
  LOCALES.map((locale) => ({
    path: localizeHref(path, { locale }),
    prerender: {
      enabled: false,
    },
  })),
);

const config = defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      { find: "@repo/i18n/server", replacement: appI18nServerEntry },
      { find: "@repo/i18n", replacement: appI18nEntry },
    ],
  },
  plugins: [
    devtools(),
    nitro({
      rollupConfig: { external: [/^@sentry\//] },
      vercel: {
        config: {
          version: 3,
          routes: [
            {
              // 서비스 워커 스크립트는 캐시되면 갱신이 지연된다. 페이로드 스키마가 바뀌었을
              // 때 구형 워커가 남아 잘못 표시하는 것을 막으려면 매 요청 재검증해야 한다.
              // Vercel 정적 파일 기본값(public, max-age=0, must-revalidate)도 같은 효과지만,
              // 우리가 통제하지 않는 값이라 명시한다. continue 를 주지 않으면 라우팅이 여기서
              // 끝나 파일이 서빙되지 않는다(Nitro 도 publicAssets 캐시 규칙에 같은 처리를 한다).
              src: "^/sw[.]js$",
              headers: { "cache-control": "no-cache" },
              continue: true,
            },
            {
              // 프리렌더된 정적 HTML 은 Vercel 엣지가 바로 서빙해서 Nitro 핸들러가
              // 아예 실행되지 않는다. 그래서 server-locale-guard 의 Accept-Language
              // 자동 감지가 프리렌더 경로에서만 죽어 있었다.
              // 로케일 prefix 없는 문서 요청만 정적 서빙을 건너뛰고 함수로 보내
              // 기존 가드가 판정하게 한다. /en, /ja, /zh, /zh-TW 와 정적 자산은
              // 이 패턴에 걸리지 않으므로 그대로 CDN 에서 나간다.
              //
              // PARAGLIDE_LOCALE 쿠키가 있으면 건너뛰는 missing 조건을 한때 뒀지만
              // 뺐다. resolvePreferredDocumentLocale 이 쿠키를 가장 먼저 보므로
              // 쿠키 기반 선호 판정도 서버에서 이뤄져야 하는데, missing 이 바로 그
              // 요청을 함수에 닿지 못하게 막아 재방문자가 한국어 정적 페이지에 갇혔다.
              //
              // 대가로 로케일 prefix 없는 문서 요청은 전부 함수를 탄다. 다만 대부분의
              // 봇은 Accept-Language 를 보내지 않아 has 에 걸리지 않고, prefix 가 있는
              // 경로는 src 에 매치되지 않으므로 영향 범위는 prefix 없는 진입뿐이다.
              src: LOCALE_LESS_DOCUMENT_SRC,
              has: [{ type: "header", key: "accept-language" }],
              dest: "/__server",
            },
            {
              // Vercel 의 has 는 AND 라서 "헤더 또는 쿠키" 를 한 규칙으로 표현할 수 없다.
              // Accept-Language 를 보내지 않는 클라이언트(일부 웹뷰·프라이버시 도구)라도
              // 선호 쿠키가 있으면 서버가 그 값으로 판정해야 하므로 규칙을 하나 더 둔다.
              // 두 조건을 모두 만족하는 요청은 위 규칙에서 이미 함수로 가므로 중복 비용은 없다.
              src: LOCALE_LESS_DOCUMENT_SRC,
              has: [{ type: "cookie", key: "PARAGLIDE_LOCALE" }],
              dest: "/__server",
            },
          ],
          // Nitro 의 VercelBuildConfigV3 route 타입에는 has 가 없어서 캐스트 없이는
          // 컴파일되지 않는다. Vercel Build Output API 자체는 지원하며(Nitro 도 skew
          // protection 에서 has 를 emit 한다), 캐스트를 지우면 타입 에러가 나거나
          // 조건이 사라져 모든 요청이 함수로 간다. 지우지 말 것.
        } as never,
      },
      routeRules:
        process.env.NODE_ENV === "development"
          ? {
              "/api/**": { proxy: `${API_BASE_URL}/api/**` },
              "/oauth2/**": { proxy: `${API_BASE_URL}/oauth2/**` },
              "/login/oauth2/**": {
                proxy: `${API_BASE_URL}/login/oauth2/**`,
              },
            }
          : {},
    }),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    vanillaExtractPlugin(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: false,
      },
      pages: [...prerenderRoutes, ...nonPrerenderRoutes],
    }),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
});

export default config;
