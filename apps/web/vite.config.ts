import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { locales, localizeHref } from "@repo/i18n";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const prerenderRoutes = ["/"].flatMap((path) =>
  locales.map((locale) => ({
    path: localizeHref(path, { locale }),
    prerender: {
      enabled: true,
    },
  })),
);

const config = defineConfig({
  plugins: [
    devtools(),
    vanillaExtractPlugin(),
    nitro({ 
      rollupConfig: { external: [/^@sentry\//] },
      routeRules: process.env.NODE_ENV === 'development' ? {
        "/api/**": { proxy: "http://localhost:8080/api/**" },
        "/oauth2/**": { proxy: "http://localhost:8080/oauth2/**" },
        "/login/oauth2/**": { proxy: "http://localhost:8080/login/oauth2/**" }
      } : {}
    }),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    paraglideVitePlugin({
      project: "../../packages/i18n/project.inlang",
      outdir: "../../packages/i18n/src/paraglide",
        outputStructure: "message-modules",

    }),
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
