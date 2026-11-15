// Build: esbuild (ESM + CJS bundles) + tsc (declarations) + .d.cts derivation + asset copy.
// Usage: node scripts/build.mjs [--tsconfig tsconfig.build.json]
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const argIdx = process.argv.indexOf('--tsconfig');
const tsconfig = argIdx > -1 ? process.argv[argIdx + 1] : 'tsconfig.build.json';
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const entries = {
  core: { in: 'src/core/index.ts', banner: undefined },
  // "use client" must be the first statement of the emitted file; bundlers strip source-level directives.
  react: { in: 'src/react/index.ts', banner: '"use client";' },
  native: { in: 'src/native/index.tsx', banner: undefined },
  elements: { in: 'src/elements/index.ts', banner: undefined },
};

for (const [name, entry] of Object.entries(entries)) {
  for (const format of ['esm', 'cjs']) {
    await build({
      entryPoints: [join(root, entry.in)],
      outfile: join(dist, name, format === 'esm' ? 'index.js' : 'index.cjs'),
      bundle: true,
      format,
      platform: 'neutral',
      target: 'es2020',
      packages: 'external', // react and react-native stay external (no runtime dependencies); our own relative modules are bundled
      jsx: 'automatic',
      legalComments: 'none',
      ...(entry.banner ? { banner: { js: entry.banner } } : {}),
      logLevel: 'warning',
    });
  }
}

// Self-registering browser bundle for plain HTML (<script src="auto.js"></script>); no dependencies, no network.
await build({
  entryPoints: [join(root, 'src/elements/auto.ts')],
  outfile: join(dist, 'elements/auto.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  legalComments: 'none',
  logLevel: 'warning',
});

// Declarations (ESM flavour) via tsc.
const tscBin = require.resolve('typescript/bin/tsc');
execFileSync(process.execPath, [tscBin, '-p', join(root, tsconfig)], { stdio: 'inherit', cwd: root });

// Derive a CJS declaration tree: x.d.ts -> x.d.cts with './y.js' specifiers rewritten to './y.cjs'.
function copyCts(from, to) {
  mkdirSync(to, { recursive: true });
  for (const f of readdirSync(from)) {
    const src = join(from, f);
    if (statSync(src).isDirectory()) copyCts(src, join(to, f));
    else if (f.endsWith('.d.ts')) {
      const text = readFileSync(src, 'utf8').replace(/(\bfrom\s+|\bimport\()\s*(['"])(\.{1,2}\/[^'"]+?)\.js\2/g, '$1$2$3.cjs$2');
      writeFileSync(join(to, f.replace(/\.d\.ts$/, '.d.cts')), text);
    }
  }
}
copyCts(join(dist, 'types'), join(dist, 'types-cjs'));

// Static assets.
mkdirSync(join(dist, 'css'), { recursive: true });
mkdirSync(join(dist, 'tailwind'), { recursive: true });
cpSync(join(root, 'src/css/hexadata.css'), join(dist, 'css/hexadata.css'));
cpSync(join(root, 'src/css/base.css'), join(dist, 'css/base.css'));
cpSync(join(root, 'src/css/components.css'), join(dist, 'css/components.css'));
// all.css: tokens + base + components in one file (no @import, so it works from any host without extra requests).
writeFileSync(
  join(dist, 'css/all.css'),
  ['hexadata.css', 'base.css', 'components.css'].map((f) => readFileSync(join(root, 'src/css', f), 'utf8')).join('\n'),
);
cpSync(join(root, 'src/tailwind/preset.cjs'), join(dist, 'tailwind/preset.cjs'));
cpSync(join(root, 'src/tailwind/preset.d.cts'), join(dist, 'tailwind/preset.d.cts'));
cpSync(join(root, 'src/tailwind/theme.css'), join(dist, 'tailwind/theme.css'));

// Shims for resolvers that ignore package.json "exports" (old Metro < 0.79, TS node10).
const shim = (dir, main, module, types) =>
  writeFileSync(
    join(root, dir, 'package.json'),
    JSON.stringify({ name: `@hexadata/brand/${dir}`, private: true, main, ...(module ? { module } : {}), types }, null, 2) + '\n',
  );
shim('react', '../dist/react/index.cjs', '../dist/react/index.js', '../dist/types/react/index.d.ts');
shim('native', '../dist/native/index.cjs', '../dist/native/index.js', '../dist/types/native/index.d.ts');
mkdirSync(join(root, 'elements'), { recursive: true });
shim('elements', '../dist/elements/index.cjs', '../dist/elements/index.js', '../dist/types/elements/index.d.ts');
shim('tailwind', '../dist/tailwind/preset.cjs', undefined, '../dist/tailwind/preset.d.cts');

console.log('build: ok');
