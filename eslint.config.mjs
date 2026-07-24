// Flat ESLint config (ESLint 9 + typescript-eslint 8).
//
// Deliberately pragmatic: this repo had no linter, so the rules are tuned to
// catch real problems (accidental globals, unreachable code, unsafe compares)
// while treating stylistic/legacy issues as warnings rather than hard errors,
// so `npm run lint` is green today and can be tightened incrementally.
//
// Formatting is owned by Prettier (eslint-config-prettier disables any rule
// that would fight it).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    // Never lint generated / vendored / report output.
    ignores: [
      'node_modules/**',
      'dist/**',
      '.venv/**',
      'allure-results/**',
      'allure-report/**',
      'playwright-report/**',
      'blob-report/**',
      'test-results/**',
      'reports/**',
      'results/**',
      'artifacts/**',
      'log/**',
      'coverage/**',
      '**/*.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        // Node runtime globals used across scripts/config.
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      // Real-bug guards — keep as errors.
      eqeqeq: ['error', 'smart'],
      'no-var': 'error',
      // Allow the idiomatic parenthesized `while ((m = re.exec(s)) !== null)`.
      'no-cond-assign': ['error', 'except-parens'],
      // Playwright uses `async ({}, testInfo) => {}` — an empty fixture pattern.
      'no-empty-pattern': 'off',

      // Legacy / stylistic — warn so they surface without blocking the build.
      'prefer-const': 'warn',
      'no-empty': 'warn',
      'no-useless-escape': 'warn',
      'no-constant-condition': ['warn', { checkLoops: false }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      // Too noisy for a Playwright/WDIO codebase dominated by dynamic DOM work.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    // The mobile layer is intentionally looser (see tsconfig.mobile.json).
    files: ['pages/mobile/**/*.ts', 'tests/mobile/**/*.ts', 'wdio.mobile.conf.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  prettier,
);
