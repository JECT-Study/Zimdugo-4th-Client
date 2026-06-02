import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

const webI18nEntry = fileURLToPath(
  new URL("../../web/src/i18n.ts", import.meta.url),
);
const webI18nServerEntry = fileURLToPath(
  new URL("../../web/src/i18n-server.ts", import.meta.url),
);

const config: StorybookConfig = {
  stories: [
    "../../../packages/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../../apps/web/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    config.plugins = [...(config.plugins ?? []), vanillaExtractPlugin()];
    const alias = config.resolve?.alias;
    const aliases = Array.isArray(alias)
      ? alias
      : Object.entries(alias ?? {}).map(([find, replacement]) => ({
          find,
          replacement,
        }));

    config.resolve = {
      ...config.resolve,
      alias: [
        { find: "@repo/i18n/server", replacement: webI18nServerEntry },
        { find: "@repo/i18n", replacement: webI18nEntry },
        ...aliases,
      ],
    };
    return config;
  },
};
export default config;
