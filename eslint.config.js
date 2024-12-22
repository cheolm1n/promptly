import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";
import js from "@eslint/js";

export default [
  {
    ignores: ["dist/", "dist_local", "archive/", ".idea/"],
    env: { extension: true },
  },
  // 일반적인 규칙을 더 위로 배치
  js.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  ...pluginVue.configs["flat/strongly-recommended"],
  {
    rules: {
      // override/add rules settings here, such as:
      // 'vue/no-unused-vars': 'error'
    },
    ...eslintConfigPrettier,
  },
];
