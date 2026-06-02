import type { StorybookConfig } from "@storybook/react-vite";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

const storybookDir = path.dirname(fileURLToPath(import.meta.url));

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
    const existingAlias = config.resolve?.alias ?? {};
    const i18nAlias = {
      find: "@repo/i18n",
      replacement: path.resolve(storybookDir, "i18n.ts"),
    };

    config.resolve = {
      ...config.resolve,
      alias: Array.isArray(existingAlias)
        ? [...existingAlias, i18nAlias]
        : { ...existingAlias, "@repo/i18n": i18nAlias.replacement },
    };
    config.plugins = [
      ...(config.plugins ?? []),
      paraglideVitePlugin({
        project: path.resolve(
          storybookDir,
          "../../../packages/i18n/project.inlang",
        ),
        outdir: path.resolve(storybookDir, "paraglide"),
        outputStructure: "message-modules",
      }),
      vanillaExtractPlugin(),
    ];
    return config;
  },
};
export default config;
