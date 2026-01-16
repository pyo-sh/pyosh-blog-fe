import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import pyoshConfig from "eslint-config-pyosh";
import pyoshPrettierConfig from "eslint-config-pyosh/prettier";
import pyoshTsConfig from "eslint-config-pyosh/typescript";
import globals from "globals";

export default [
  { ignores: ["next-env.d.ts", "next.config.js", ".next/**"] },
  js.configs.recommended,
  ...pyoshConfig,
  ...pyoshTsConfig,
  {
    plugins: { "@next/next": nextPlugin },
    rules: { ...nextPlugin.configs.recommended.rules },
  },
  ...pyoshPrettierConfig,
  {
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
];
