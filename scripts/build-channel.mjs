// Assembles the evergreen hosted channel from the built package. Needs: npm run build && build:fonts && build:logos.
//   node scripts/build-channel.mjs [--out channel-out] [--key signing.jwk] [--expires-days 120] [--require-signed]
//
//   <out>/v2/          evergreen: redeployed on every release; apps that point here update with no release
//   <out>/<version>/   immutable copy of the same files (pin this + the SRI hashes in integrity.json for reproducibility)
//
// Layout of each:  css/{all,hexadata,base,components,fonts,fonts-fallback}.css  css/fonts/*.woff2   fonts/ttf/*.ttf
//                  js/hexadata.js (custom elements + live update)   logo/*   tokens.json   manifest.json   integrity.json   version.json
// The signing key comes from $HEXA_SIGNING_JWK or --key. Without one the manifest is written as manifest.unsigned.json
// (clients ignore it) and version.json says signed:false: fine for previews, never for production (--require-signed fails instead).
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadSigningJwk, signManifest } from './lib/sign.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const outDir = resolve(root, opt('--out', 'channel-out'));
const expiresDays = Number(opt('--expires-days', '120'));
const requireSigned = args.includes('--require-signed');

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const core = await import(pathToFileURL(join(root, 'dist/core/index.js')).href);
const need = (p) => {
  if (!existsSync(join(root, p)))
    throw new Error(`build-channel: ${p} is missing. Run: npm run build && npm run build:fonts && npm run build:logos`);
};
['dist/css/all.css', 'dist/css/fonts.css', 'dist/elements/auto.js', 'dist/logo/favicon.ico', 'dist/fonts/ttf'].forEach(need);

// ---- manifest ---------------------------------------------------------------
const { DEFAULT_MANIFEST, parseManifest, TRUSTED_KEYS } = core;
const payload = {
  schemaVersion: 2,
  revision: DEFAULT_MANIFEST.revision,
  issuedAt: DEFAULT_MANIFEST.issuedAt,
  expiresAt: new Date(Date.now() + expiresDays * 86_400_000).toISOString().replace(/\.\d{3}Z$/, 'Z'),
  tokens: {
    palette: DEFAULT_MANIFEST.tokens.palette,
    taglines: DEFAULT_MANIFEST.tokens.taglines,
    descriptor: DEFAULT_MANIFEST.tokens.descriptor,
  },
  assets: { logo: DEFAULT_MANIFEST.assets.logo },
};
const check = parseManifest(payload, { minRevision: 0 });
if (!check.ok || check.warnings.length)
  throw new Error(
    `build-channel: refusing to publish an invalid manifest: ${check.ok ? JSON.stringify(check.warnings) : `${check.reason}: ${check.detail}`}`,
  );

const jwk = loadSigningJwk(opt('--key'));
let envelope;
if (jwk) {
  const kid = TRUSTED_KEYS.find((k) => k.publicKey === jwk.x)?.kid;
  if (!kid)
    throw new Error(
      'build-channel: the signing key is not listed in brand/keys.json (apps would reject the manifest). Add its public key first.',
    );
  envelope = await signManifest(payload, jwk, kid);
} else if (requireSigned) {
  throw new Error('build-channel: --require-signed but no signing key ($HEXA_SIGNING_JWK or --key)');
}

// ---- tokens.json (resolved view for tooling) -------------------------------
const hexOf = (k) => core.DEFAULT_PALETTE[k];
const resolveRoles = (mode) =>
  Object.fromEntries(Object.entries(core.SEMANTIC[mode]).map(([role, key]) => [role, { palette: key, hex: hexOf(key) }]));
const tokens = {
  version: pkg.version,
  revision: DEFAULT_MANIFEST.revision,
  source: core.BRAND_SOURCE,
  palette: core.DEFAULT_PALETTE,
  semantic: { light: resolveRoles('light'), dark: resolveRoles('dark') },
  taglines: core.DEFAULT_TAGLINES,
  descriptor: core.BRAND_DESCRIPTOR,
  fonts: core.FONTS,
  foundations: core.FOUNDATIONS,
  logo: core.LOGO_VARIANTS.map((v) => ({ ...v, file: `logo/${v.id}${v.form === 'icon' ? '-256' : ''}.png` })),
  license: 'Software: Apache-2.0. HexaData Brand Assets: see BRAND-LICENSE.md in the repository.',
};

// ---- assemble ---------------------------------------------------------------
const stage = join(outDir, '.stage');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
const put = (from, to) => cpSync(join(root, from), join(stage, to), { recursive: true });
for (const f of ['all', 'hexadata', 'base', 'components', 'fonts', 'fonts-fallback']) put(`dist/css/${f}.css`, `css/${f}.css`);
put('dist/css/fonts', 'css/fonts');
put('dist/fonts/ttf', 'fonts/ttf');
put('dist/elements/auto.js', 'js/hexadata.js');
put('dist/logo', 'logo');
put('dist/licenses', 'licenses');
writeFileSync(join(stage, 'tokens.json'), `${JSON.stringify(tokens, null, 2)}\n`);
writeFileSync(join(stage, envelope ? 'manifest.json' : 'manifest.unsigned.json'), `${JSON.stringify(envelope ?? payload)}\n`);

const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const sri = (buf) => `sha384-${createHash('sha384').update(buf).digest('base64')}`;
const files = walk(stage)
  .map((f) => relative(stage, f).split('\\').join('/'))
  .sort();
const integrity = Object.fromEntries(files.filter((f) => /\.(css|js)$/.test(f)).map((f) => [f, sri(readFileSync(join(stage, f)))]));
writeFileSync(
  join(stage, 'integrity.json'),
  `${JSON.stringify({ version: pkg.version, algorithm: 'sha384 (Subresource Integrity)', files: integrity }, null, 2)}\n`,
);
writeFileSync(
  join(stage, 'version.json'),
  `${JSON.stringify({ version: pkg.version, revision: DEFAULT_MANIFEST.revision, signed: Boolean(envelope), files: files.length + 2, evergreen: '/v2/', pinned: `/${pkg.version}/` }, null, 2)}\n`,
);

for (const dir of ['v2', pkg.version]) cpSync(stage, join(outDir, dir), { recursive: true });
rmSync(stage, { recursive: true, force: true });
console.log(
  `build-channel: ok (v2 + ${pkg.version}, ${files.length + 2} files each, manifest ${envelope ? 'SIGNED' : 'UNSIGNED (preview only)'})`,
);
