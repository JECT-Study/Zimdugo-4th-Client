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
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    paraglideVitePlugin({
      project: "../../packages/i18n/project.inlang",
      outdir: "../../packages/i18n/src/paraglide",
    }),
    tanstackStart({
      prerender: {
        enabled: true,
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
