import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist/**', 'channel-out/**', 'node_modules/**', 'src/core/tokens.ts', 'src/tailwind/preset.cjs', 'test/e2e/demo.tsx'] },
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
    files: ['test/e2e/run.mjs'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        indexedDB: 'readonly',
        caches: 'readonly',
        getComputedStyle: 'readonly',
      },
    },
  },
  {
    files: ['scripts/**/*.mjs', 'test/**/*.mjs', 'test/**/*.ts', 'test/**/*.tsx', 'src/tailwind/preset.cjs'],
    languageOptions: {
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        crypto: 'readonly',
        URL: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        module: 'writable',
        require: 'readonly',
      },
    },
  },
);
