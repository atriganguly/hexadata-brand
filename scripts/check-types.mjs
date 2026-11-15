// Consumer type-check: resolves the package through its "exports" map exactly as a consumer would,
// from BOTH an ESM (.mts) and a CJS (.cts) file under node16 resolution. Catches the "masquerading as ESM" class of bug.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'package.json'));
const tmp = mkdtempSync(join(tmpdir(), 'hexa-types-'));
mkdirSync(join(tmp, 'node_modules/@hexadata'), { recursive: true });
symlinkSync(root, join(tmp, 'node_modules/@hexadata/brand'), 'junction');
let hasReactTypes = false;
try {
  require.resolve('@types/react/package.json');
  hasReactTypes = true;
} catch {
  /* offline sandbox */
}
if (hasReactTypes)
  symlinkSync(join(dirname(require.resolve('@types/react/package.json')), '..'), join(tmp, 'node_modules/@types'), 'junction');

const body = (kind) => `
import { parseManifest, contrastRatio, DEFAULT_PALETTE, type HexaManifest, type PaletteKey } from '@hexadata/brand';
${hasReactTypes ? "import { HexaProvider, HexaTagline, useHexaBrand } from '@hexadata/brand/react';\nimport { HexaNativeProvider, resolveNativeTheme } from '@hexadata/brand/native';" : ''}
const r = parseManifest({});
const ratio: number = contrastRatio(DEFAULT_PALETTE.white, DEFAULT_PALETTE.obsidian);
const k: PaletteKey = 'cyan';
const m: HexaManifest | undefined = r.ok ? r.manifest : undefined;
// @ts-expect-error unknown palette key must be rejected by the types
const bad: PaletteKey = 'teal';
${hasReactTypes ? 'void HexaProvider; void HexaTagline; void useHexaBrand; void HexaNativeProvider; void resolveNativeTheme;' : ''}
void ratio; void k; void m; void bad;
${kind === 'cjs' ? "import preset = require('@hexadata/brand/tailwind');\nconst built: unknown = preset.createPreset({ extend: true }).theme.extend;\nvoid built;" : "import preset from '@hexadata/brand/tailwind';\nconst strict: unknown = preset.theme.colors;\nvoid strict;"}
export {};
`;
writeFileSync(join(tmp, 'esm.mts'), body('esm'));
writeFileSync(join(tmp, 'cjs.cts'), body('cjs'));
writeFileSync(
  join(tmp, 'tsconfig.json'),
  JSON.stringify({
    compilerOptions: {
      module: 'node16',
      moduleResolution: 'node16',
      target: 'es2022',
      strict: true,
      noEmit: true,
      skipLibCheck: false,
      types: [],
      lib: ['es2022', 'dom'],
    },
    files: ['esm.mts', 'cjs.cts'],
  }),
);
try {
  execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', join(tmp, 'tsconfig.json')], { stdio: 'inherit', cwd: tmp });
  console.log(
    `check-types: ok (ESM + CJS consumers under node16${hasReactTypes ? ', incl. react/native' : '; react/native skipped: @types/react not installed'})`,
  );
} catch {
  console.error('check-types: FAILED');
  process.exit(1);
}
