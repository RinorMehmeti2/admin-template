import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

const BANNED_UI_LIBS = [
  '@radix-ui/*',
  '@mui/*',
  '@chakra-ui/*',
  '@mantine/*',
  '@headlessui/*',
  'react-aria-components',
  'shadcn/*',
  'shadcn-ui/*',
];

export default defineConfig([
  globalIgnores(['dist', 'storybook-static', 'coverage', 'node_modules', '**/*.d.ts']),

  // Base TS/TSX rules
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.strict,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2023 },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React 19 — JSX runtime, no need for React in scope
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/no-unknown-property': 'error',

      // Banned UI libs
      'no-restricted-imports': [
        'error',
        {
          patterns: BANNED_UI_LIBS.map((pattern) => ({
            group: [pattern],
            message:
              'Banned UI library. This repo builds every component from scratch — see CLAUDE.md.',
          })),
        },
      ],

      // TypeScript strictness
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Strict tseslint enables this; many usages here are intentional (post-check
      // narrowing, test queries). Downgrade to warn — strict mode + reviews catch misuse.
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Pure HMR DX rule. Pre-existing pattern in this repo: Provider component +
      // useXContext hook colocated. Downgraded to warn rather than refactor every file.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Our form primitives (Switch, Checkbox, Radio, Input, Select, Textarea) wrap
      // a native input — labels can use them as the associated control.
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          controlComponents: ['Switch', 'Checkbox', 'Radio', 'Input', 'Select', 'Textarea'],
          depth: 3,
        },
      ],
    },
  },

  // Explicit return types — required on hooks/lib/context where inference value is highest.
  // Skipped for src/components and src/pages: components are exported functions returning
  // JSX, where inference is robust and explicit types add boilerplate without payoff.
  // Documented in CONTRIBUTING.md.
  {
    files: ['src/hooks/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}'],
    ignores: ['src/hooks/__tests__/**', '**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': [
        'error',
        {
          allowArgumentsExplicitlyTypedAsAny: false,
          allowDirectConstAssertionInArrowFunctions: true,
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
    },
  },

  // No default exports inside the component library
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}'],
    rules: {
      'import/no-default-export': 'off', // we use the core rule below
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message:
            'Default exports are forbidden in src/components and src/hooks — use named exports (CLAUDE.md).',
        },
      ],
    },
  },

  // Stories files must default-export the meta object — exempt them
  {
    files: ['**/*.stories.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': 'off',
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // Stories often render <label>X<input/></label> patterns for compactness; real
      // components enforce htmlFor via Label/FormField primitives.
      'jsx-a11y/label-has-associated-control': 'off',
    },
  },

  // Test files — relax a few rules
  {
    files: ['**/*.test.{ts,tsx}', 'src/setupTests.ts', 'src/hooks/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },

  // Config files (vite, vitest, storybook) — Node context, default exports allowed
  {
    files: [
      '*.config.{js,ts}',
      '.storybook/**/*.{js,ts,tsx}',
      'vite.config.ts',
      'vitest.config.ts',
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-restricted-syntax': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },

  // Prettier compat — must be last
  prettier,
]);
