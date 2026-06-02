import path from "node:path";
import { fileURLToPath } from "node:url";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { locales, localizeHref } from "./src/i18n";

const appDir = path.dirname(fileURLToPath(import.meta.url));

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
    alias: {
      "@repo/i18n": path.resolve(appDir, "src/i18n.ts"),
    },
  },
  plugins: [
    devtools(),
    vanillaExtractPlugin(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    paraglideVitePlugin({
      project: "../../packages/i18n/project.inlang",
      outdir: path.resolve(appDir, "src/paraglide"),
      outputStructure: "message-modules",
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
