// Release gate. Usage: node scripts/verify-package.mjs [--strict]
//  --strict additionally requires the self-hosted font artefacts (the release build always has them).
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const problems = [];
const warnings = [];
const fail = (m) => problems.push(m);

// 1. every path in "exports" / main / module / types exists
const targets = new Set();
const walk = (v) => (typeof v === 'string' ? targets.add(v) : v && typeof v === 'object' && Object.values(v).forEach(walk));
walk(pkg.exports);
[pkg.main, pkg.module, pkg.types].forEach((t) => t && targets.add(t));
Object.values(pkg.typesVersions?.['*'] ?? {})
  .flat()
  .forEach((t) => targets.add(`./${t}`));
const optional = /fonts(-fallback)?\.css$/;
for (const t of targets) {
  if (t === './package.json') continue;
  if (!existsSync(join(root, t))) (optional.test(t) && !strict ? warnings : problems).push(`missing export target ${t}`);
}

// 2. "use client" must be the first statement of the React entry (bundlers strip source-level directives)
for (const f of ['dist/react/index.js', 'dist/react/index.cjs']) {
  if (existsSync(join(root, f)) && !/^\s*["']use client["'];/.test(readFileSync(join(root, f), 'utf8')))
    fail(`${f}: "use client" is not the first statement`);
}

// 3. banned APIs / third-party URLs in shipped JS and CSS
const BANNED = [
  [/localStorage|sessionStorage|AsyncStorage|indexedDB|document\.cookie|navigator\.sendBeacon/, 'browser/device storage or beacon API'],
  [/dangerouslySetInnerHTML|\beval\s*\(|new Function\s*\(|document\.write/, 'unsafe code execution / HTML injection'],
  [
    /fonts\.googleapis|fonts\.gstatic|googletagmanager|google-analytics|facebook\.net|cdn\.jsdelivr|unpkg\.com|cloudflare/i,
    'third-party host',
  ],
  [/https?:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+/i, 'hard-coded URL'],
];
const scan = (dir) => {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== 'fonts' && name !== 'licenses') scan(p);
      continue;
    }
    if (!/\.(js|cjs|css|d\.ts|d\.cts)$/.test(name)) continue;
    const text = readFileSync(p, 'utf8');
    for (const [re, label] of BANNED) if (re.test(text)) fail(`${p.replace(root + '/', '')}: contains ${label} (${re.exec(text)[0]})`);
  }
};
scan(join(root, 'dist'));

// 4. no install-time lifecycle scripts (supply-chain hygiene for consumers); one runtime dependency
for (const s of ['preinstall', 'install', 'postinstall']) if (pkg.scripts?.[s]) fail(`package.json has a ${s} script`);
const deps = Object.keys(pkg.dependencies ?? {});
if (deps.join() !== 'zod') fail(`unexpected runtime dependencies: ${deps.join(', ') || '(none)'}; expected only zod`);
for (const k of ['license', 'version', 'exports', 'files', 'engines', 'publishConfig']) if (!pkg[k]) fail(`package.json is missing "${k}"`);

// 5. strict: fonts, licences
if (strict) {
  const woff = existsSync(join(root, 'dist/css/fonts'))
    ? readdirSync(join(root, 'dist/css/fonts')).filter((f) => f.endsWith('.woff2'))
    : [];
  if (woff.length !== 6) fail(`expected 6 woff2 files, found ${woff.length}`);
  for (const slug of ['space-grotesk', 'inter-tight', 'jetbrains-mono'])
    if (!existsSync(join(root, `dist/licenses/${slug}-OFL.txt`))) fail(`missing OFL licence for ${slug}`);
  const css = existsSync(join(root, 'dist/css/fonts.css')) ? readFileSync(join(root, 'dist/css/fonts.css'), 'utf8') : '';
  if ((css.match(/@font-face/g) ?? []).length !== 6) fail('fonts.css should declare 6 @font-face rules');
}

// 6. tarball contents: whitelist only, and size-bounded
try {
  const [{ files, size }] = JSON.parse(
    execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
      shell: process.platform === 'win32',
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }),
  );
  const allowed =
    /^(dist\/|react\/package\.json$|native\/package\.json$|tailwind\/package\.json$|package\.json$|README\.md$|LICENSE$|NOTICE$|SECURITY\.md$|PRIVACY\.md$|ACCESSIBILITY\.md$|CHANGELOG\.md$)/;
  for (const f of files) if (!allowed.test(f.path)) fail(`unexpected file in tarball: ${f.path}`);
  if (size > 1_500_000) fail(`tarball is ${size} bytes (> 1.5 MB)`);
  console.log(`  tarball: ${files.length} files, ${(size / 1024).toFixed(1)} KB packed`);
} catch (e) {
  warnings.push(`could not run npm pack --dry-run (${e.message.split('\n')[0]})`);
}

warnings.forEach((w) => console.log(`  warn: ${w}`));
if (problems.length) {
  problems.forEach((p) => console.error(`  FAIL: ${p}`));
  console.error(`verify: ${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`verify: ok${strict ? ' (strict)' : ''}`);
