import { fileURLToPath } from "node:url";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { PROTECTED_PATHS } from "./src/shared/model/protected-paths";

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
/**
 * Vercel Deployment Protection 이 걸린 배포인지.
 *
 * 보호가 걸리면 인증 없는 요청이 vercel.com/sso-api 로 리다이렉트된다. manifest 는
 * 기본적으로 credentials 없이 요청되므로 이 리다이렉트에 걸려 CORS 로 막힌다.
 * 그 배포에서만 manifest 링크에 use-credentials 를 달아 쿠키를 함께 보낸다.
 *
 * 프로덕션은 공개라 이 처리가 필요 없고, 애초에 붙이지 않아 동작이 달라질 여지도 없다.
 * VERCEL_ENV 는 Vercel 이 빌드에 넣어주는 시스템 변수라 대시보드 설정이 필요 없다.
 * 나중에 프로덕션까지 보호를 켠다면 이 조건도 함께 넓혀야 한다.
 */
const IS_PROTECTED_DEPLOYMENT = process.env.VERCEL_ENV === "preview";

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
// 보호 경로(`/report`, `/my/reports`, `/my/favorites`)는 프리렌더가 비로그인으로 판정돼 홈으로
// 리다이렉트된 결과가 그 경로의 정적 파일로 굳어 있었다. 제보 페이지 자리에
// 홈 HTML 이 `noindex` 도 없이 들어앉아 중복 콘텐츠가 되고, 그 파일이 서빙되면
// 서버 가드도 건너뛴다. 프리렌더 대상에서 제외한다.
// 보호 경로 목록은 서버 가드·클라이언트 가드와 같은 출처를 써야 한다. 하나만
// 빠뜨리면 그 경로가 홈 HTML 로 프리렌더되어 서버 가드까지 건너뛴다.
const AUTH_DEPENDENT_PATHS = ["/login", ...PROTECTED_PATHS] as const;

const nonPrerenderRoutes = AUTH_DEPENDENT_PATHS.flatMap((path) =>
  LOCALES.map((locale) => ({
    path: localizeHref(path, { locale }),
    prerender: {
      enabled: false,
    },
  })),
);

const config = defineConfig({
  define: {
    "import.meta.env.VITE_MANIFEST_USE_CREDENTIALS": JSON.stringify(
      IS_PROTECTED_DEPLOYMENT,
    ),
  },
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
              /*
               * 개발 서버에서만 Origin 을 프로덕션 값으로 바꿔 보낸다.
               *
               * 서버는 상태를 바꾸는 요청에 허용 Origin 검증을 건다. 프록시가
               * 브라우저의 `http://localhost:3000` 을 그대로 넘기면 목록 밖이라
               * 403 COMMON-403 이 온다. 푸시 타이머는 쿠키 신원에 기대므로 이
               * 검증을 통과하지 못하면 로컬에서 흐름 전체를 확인할 수 없다.
               *
               * `SameSite=Lax` 인 deviceToken 은 교차 사이트 XHR 에 실리지 않아
               * 프리뷰 도메인(vercel.app)에서도 검증이 안 된다. 프록시를 거쳐
               * same-origin 으로 만들면 그 제약도 함께 풀린다.
               *
               * NODE_ENV 가 development 일 때만 적용된다. 빌드 산출물에는 들어가지
               * 않는다. 백엔드가 개발 Origin 을 허용 목록에 넣어 주면 지울 수 있다.
               */
              "/api/**": {
                proxy: {
                  to: `${API_BASE_URL}/api/**`,
                  headers: { origin: "https://zimdugo.com" },
                },
              },
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
