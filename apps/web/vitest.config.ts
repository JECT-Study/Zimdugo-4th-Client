/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const appI18nEntry = fileURLToPath(new URL("./src/i18n.ts", import.meta.url));
const appI18nServerEntry = fileURLToPath(
  new URL("./src/i18n-server.ts", import.meta.url),
);

export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      { find: "@repo/i18n/server", replacement: appI18nServerEntry },
      { find: "@repo/i18n", replacement: appI18nEntry },
    ],
  },
  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    vanillaExtractPlugin(),
    viteReact(),
  ],
  test: {
    environment: "jsdom",
    // e2e/ 는 Playwright 가 돌린다. vitest 가 수집하면 @playwright/test 를
    // 불러오다 실패한다.
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
    server: {
      deps: {
        inline: ["motion", "@repo/ui"],
      },
    },
  },
});
