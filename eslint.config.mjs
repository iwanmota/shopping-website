import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import a11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    ignores: [
      'node_modules/**',
      'server/node_modules/**',
      'dist/**',
      'coverage/**',
      'server/coverage/**',
      'playwright-report/**',
      'test-results/**',
      'public/**',
    ],
  },
  {
    files: [
      'src/**/*.{js,jsx}',
      'e2e/**/*.js',
      '*.mjs',
      'scripts/**/*.mjs',
      'server/**/*.js',
    ],
    ...js.configs.recommended,
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  { files: ['server/**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': hooks, 'jsx-a11y': a11y },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      ...a11y.configs.recommended.rules,
    },
  },
  {
    files: ['src/**/*.{test,spec}.{js,jsx}', 'src/test/**', 'server/tests/**'],
    languageOptions: { globals: { ...globals.jest, vi: 'readonly' } },
  },
];
