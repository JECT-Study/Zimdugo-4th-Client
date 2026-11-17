import { fileURLToPath } from "node:url";
import babel from "@rolldown/plugin-babel";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const locales = ["ko", "en", "ja", "zh"] as const;
const appI18nEntry = fileURLToPath(new URL("./src/i18n.ts", import.meta.url));
const appI18nServerEntry = fileURLToPath(
  new URL("./src/i18n-server.ts", import.meta.url),
);
const localizeHref = (path: string, { locale }: { locale: string }) => {
  if (locale === "ko") return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
};

const prerenderRoutes = ["/"].flatMap((path) =>
  locales.map((locale) => ({
    path: localizeHref(path, { locale }),
    prerender: {
      enabled: true,
    },
  })),
);

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: [
      { find: "@repo/i18n/server", replacement: appI18nServerEntry },
      { find: "@repo/i18n", replacement: appI18nEntry },
    ],
  },
  plugins: [
    devtools(),
    vanillaExtractPlugin(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tanstackStart({
      prerender: {
        enabled: true,
      },
      pages: prerenderRoutes,
    }),
    viteReact(),
    // plugin-react 6 부터 babel 옵션이 없어 React Compiler 는 Babel 플러그인을 따로 건다.
    // 컴파일러 자체는 그대로 babel-plugin-react-compiler 다.
    babel({ presets: [reactCompilerPreset()] }),
  ],
});

export default config;
