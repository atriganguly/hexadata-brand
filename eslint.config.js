import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'channel-out/**',
      'site-out/**',
      'claude-ds-out/**',
      'node_modules/**',
      'src/core/tokens.ts',
      'src/tailwind/preset.cjs',
      'test/e2e/demo.tsx',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.tsx'],
    plugins: { 'react-hooks': reactHooks },
    rules: { 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'warn' },
  },
  {
    // Hard guarantees of the privacy posture, enforced at lint time as well as by tests.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': ['error', 'localStorage', 'sessionStorage', 'indexedDB', 'XMLHttpRequest'],
      'no-restricted-properties': ['error', { object: 'document', property: 'cookie' }, { object: 'navigator', property: 'sendBeacon' }],
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-syntax': ['error', { selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']", message: 'Never inject HTML.' }],
    },
  },
  {
    // Node tooling, the site generator and tests.
    files: [
      'scripts/**/*.mjs',
      'site/**/*.mjs',
      '.claude/**/*.mjs',
      'test/**/*.mjs',
      'test/**/*.ts',
      'test/**/*.tsx',
      'src/tailwind/preset.cjs',
    ],
    languageOptions: { globals: { ...globals.node, module: 'writable', require: 'readonly' } },
  },
  {
    // Code that runs in the browser: the site's script and the Playwright page.evaluate() callbacks inside e2e tests.
    files: ['site/assets/site.js', 'site/assets/theme.js', 'test/e2e/run.mjs', 'test/site.e2e.mjs', 'scripts/build-pdf.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
);
