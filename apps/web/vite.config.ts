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
              // 프리렌더된 정적 HTML 은 Vercel 엣지가 바로 서빙해서 Nitro 핸들러가
              // 아예 실행되지 않는다. 그래서 server-locale-guard 의 Accept-Language
              // 자동 감지가 프리렌더 경로에서만 죽어 있었다.
              // 로케일 prefix 없는 문서 요청만 정적 서빙을 건너뛰고 함수로 보내
              // 기존 가드가 판정하게 한다. /en, /ja, /zh, /zh-TW 와 정적 자산은
              // 이 패턴에 걸리지 않으므로 그대로 CDN 에서 나간다.
              src: "^/(login|my|notices|report|settings)?(/.*)?$",
              has: [{ type: "header", key: "accept-language" }],
              missing: [{ type: "cookie", key: "PARAGLIDE_LOCALE" }],
              dest: "/__server",
            },
          ],
          // Nitro 의 VercelBuildConfigV3 route 타입에는 has/missing 이 없어서
          // 캐스트 없이는 컴파일되지 않는다. Vercel Build Output API 자체는 둘 다
          // 지원하며(Nitro 도 skew protection 에서 has 를 emit 한다), 캐스트를 지우면
          // 타입 에러가 나거나 조건이 사라져 모든 요청이 함수로 간다. 지우지 말 것.
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
      pages: prerenderRoutes,
    }),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
});

export default config;
