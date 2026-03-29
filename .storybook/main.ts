import type { StorybookConfig } from "@storybook/nextjs";
import path from "path";

const __dirname = import.meta.dirname;

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-themes", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      tsconfigPath: "../tsconfig.storybook.json",
    },
  },
  staticDirs: ["../public"],
  webpackFinal: async (config) => {
    config.cache = false;

    if (config.resolve) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@app": path.resolve(__dirname, "../src/app"),
        "@app-layer": path.resolve(__dirname, "../src/app-layer"),
        "@entities": path.resolve(__dirname, "../src/entities"),
        "@features": path.resolve(__dirname, "../src/features"),
        "@shared": path.resolve(__dirname, "../src/shared"),
        "@widgets": path.resolve(__dirname, "../src/widgets"),
        "@src": path.resolve(__dirname, "../src"),
        "@": path.resolve(__dirname, "../src"),
      };
    }

    config.output = {
      ...config.output,
      chunkFilename: "[name].iframe.bundle.js",
    };

    config.optimization = {
      ...(config.optimization || {}),
      runtimeChunk: false,
      splitChunks: {
        chunks: "async",
        cacheGroups: {
          default: false,
          defaultVendors: false,
        },
      },
    };

    return config;
  },
};

export default config;
