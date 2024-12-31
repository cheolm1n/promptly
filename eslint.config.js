import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";
import js from "@eslint/js";
import typescriptEslint from "typescript-eslint";
import globals from "globals";

export default typescriptEslint.config(
  {
    ignores: ["dist/", "dist_local", "archive/", ".idea/", "*.d.ts"],
  },
  {
    extends: [
      // 일반적인 규칙을 더 위로 배치
      js.configs.recommended,
      pluginVue.configs["flat/recommended"],
      pluginVue.configs["flat/strongly-recommended"],
    ],
    files: ["**/*.{ts,vue,js}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: {
      // override/add rules settings here, such as:
      // 'vue/no-unused-vars': 'error'
    },
  },
  {
    files: ["scripts/transformManifest.js", "vite.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  eslintConfigPrettier,
);
