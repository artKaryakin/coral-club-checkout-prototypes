import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import storybook from 'eslint-plugin-storybook'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/storybook-static/**'],
  },

  // Дизайн-система требует соблюдения официального style guide Vue.
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  skipFormatting,
  ...storybook.configs['flat/recommended'],

  {
    name: 'coral/conventions',
    rules: {
      // Компоненты именуются как Cc3ProjectName[Sub1][Sub2].
      'vue/multi-word-component-names': 'error',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      // Только Composition API + <script setup>.
      'vue/component-api-style': ['error', ['script-setup']],
      // Шаблон должен быть чистым: без вызовов функций и вычислений.
      'vue/no-restricted-syntax': [
        'warn',
        {
          selector: 'VElement > VExpressionContainer CallExpression',
          message:
            'Вызовы функций в шаблоне запрещены — вынесите в computed или под-компонент.',
        },
      ],
    },
  },
)
