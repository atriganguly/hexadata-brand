/**
 * Generates every derived artefact from brand/ so each brand value is defined exactly once.
 * Output is deterministic (no timestamps) so CI can run `npm run generate:check` and fail on drift.
 * Layout: scripts/generate/model.ts (read + shape) -> validate.ts -> emitters/* (one small module per output).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { emit as emitCoreTokens } from './generate/emitters/core-tokens.ts';
import { emit as emitCss } from './generate/emitters/css.ts';
import { emit as emitDocs } from './generate/emitters/docs.ts';
import { emit as emitLogo } from './generate/emitters/logo.ts';
import { emit as emitFigma } from './generate/emitters/figma.ts';
import { emit as emitPlatforms } from './generate/emitters/platforms.ts';
import { emit as emitTrust } from './generate/emitters/trust.ts';
import { emit as emitTailwindV3 } from './generate/emitters/tailwind-v3.ts';
import { emit as emitTailwindV4 } from './generate/emitters/tailwind-v4.ts';
import { loadModel } from './generate/model.ts';
import type { Ctx, FontSpec } from './generate/types.ts';
import { validate } from './generate/validate.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const t = loadModel(root);
validate(t);

const GENERIC = new Set(['sans-serif', 'serif', 'monospace', 'system-ui', 'ui-monospace', '-apple-system']);
const quoteFamily = (f: string): string => (GENERIC.has(f) ? f : `"${f}"`);
const stack = (f: FontSpec): string[] => [f.family, `${f.family} Fallback`, ...f.system];
const ctx: Ctx = {
  HEADER: 'GENERATED FILE: DO NOT EDIT. Source: brand/ (run `npm run generate`).',
  paletteKeys: Object.keys(t.palette),
  kebab: (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
  quoteFamily,
  stack,
  cssStack: (f) => stack(f).map(quoteFamily).join(', '),
  jsStack: (f) => JSON.stringify(stack(f).map(quoteFamily)),
  write: (rel, content) => {
    const abs = resolve(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content.endsWith('\n') ? content : `${content}\n`);
    console.log(`  wrote ${rel}`);
  },
};

for (const emit of [emitCoreTokens, emitCss, emitTailwindV3, emitTailwindV4, emitDocs, emitLogo, emitTrust, emitPlatforms, emitFigma])
  emit(t, ctx);
console.log('generate: ok');
