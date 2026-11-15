// Everything the site shows comes from the BUILT package (dist/core), so the site can never disagree with what ships.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadData(root) {
  const core = await import(pathToFileURL(join(root, 'dist/core/index.js')).href);
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const read = (f) => readFileSync(join(root, f), 'utf8');
  const contrastDoc = JSON.parse(read('brand/contrast.json'));
  const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ');
  return {
    core,
    pkg,
    version: pkg.version,
    origin: core.BRAND_ORIGIN,
    palette: core.DEFAULT_PALETTE,
    paletteKeys: core.PALETTE_KEYS,
    semantic: core.SEMANTIC,
    taglines: core.DEFAULT_TAGLINES,
    descriptor: core.BRAND_DESCRIPTOR,
    fonts: core.FONTS,
    foundations: core.FOUNDATIONS,
    logos: core.LOGO_VARIANTS,
    allowed: core.ALLOWED_PAIRS,
    forbidden: core.FORBIDDEN_PAIRS,
    kebab,
    rgb,
    ratio: (a, b) => core.contrastRatio(core.DEFAULT_PALETTE[a], core.DEFAULT_PALETTE[b]),
    logoDoc: JSON.parse(read('brand/logo/logo.json')),
    fontsDoc: JSON.parse(read('brand/fonts/fonts.json')),
    brandLicense: read('BRAND-LICENSE.md'),
    changelog: read('CHANGELOG.md'),
    contrastDoc,
  };
}
