// Lint rules for Aisle.
//
// Deliberately small. The ones that matter here are the React hooks rules: the
// app memoises a lot of derived state (baskets, due items, price resolution)
// and a stale dependency shows the wrong total without any error at all.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'ios',
      'android',
      'node_modules',
      'public',
      'src/vendor',
      'coverage',
      'test-results',
      'playwright-report',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.ts', '*.ts', '../server/**/*.ts'],
    languageOptions: {ecmaVersion: 2023, globals: {...globals.browser, ...globals.node}},
    plugins: {'react-hooks': reactHooks},
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none'},
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['tools/**/*.mjs', 'tests/**/*.mjs', '*.mjs'],
    languageOptions: {ecmaVersion: 2023, sourceType: 'module', globals: globals.node},
  },
  // Vendored shadcn primitives are kept as upstream ships them.
  {
    files: ['src/components/ui/**'],
    rules: {'react-hooks/exhaustive-deps': 'off', '@typescript-eslint/no-unused-vars': 'off'},
  },
  prettier,
);
