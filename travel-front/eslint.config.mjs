// eslint.config.mjs (ESLint 9+, ESM)
import { defineConfig } from 'eslint/config'

// Парсеры/плагины
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettierVue from 'eslint-plugin-prettier-vue'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: { parser: tsParser },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'prettier-vue': prettierVue,
    },
    rules: {
      // запуск Prettier через prettier-vue
      'prettier-vue/prettier': 'error',

      // твои TS-правила
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',

      // общие
      'no-console': 'off',
      'no-debugger': 'off',
    },
  },

  {
    files: ['**/*.vue'],
    extends: [vue.configs['flat/strongly-recommended']],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      vue,
      '@typescript-eslint': tsPlugin,
      'prettier-vue': prettierVue,
    },
    rules: {
      'prettier-vue/prettier': 'error',

      'vue/attributes-order': ['error', { alphabetical: true }],
      'vue/max-attributes-per-line': ['error', { singleline: 3 }],
      'vue/multi-word-component-names': 'off',
      'vue/no-mutating-props': 'off',
      'vue/one-component-per-file': 'off',
      'vue/valid-define-props': 'off',

      'no-console': 'off',
      'no-debugger': 'off',
    },
    settings: {
      'prettier-vue': {
        SFCBlocks: { template: false },
      },
    },
  },

  {
    ignores: ['node_modules', '.nuxt', '.output', 'dist', '.turbo'],
  },
])
