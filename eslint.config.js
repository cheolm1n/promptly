import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    ignores: ["dist*/", "archive/", ".idea/"],
  },
  // add more generic rulesets here, such as:
  // js.configs.recommended,
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
