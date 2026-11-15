import { isHex6 } from '../../src/core/contrast.ts';
import type { Tokens } from './types.ts';

const fail = (msg: string): never => {
  throw new Error(`brand/: ${msg}`);
};

/** Refuses to generate anything from an inconsistent source. */
export function validate(t: Tokens): void {
  for (const [k, v] of Object.entries(t.palette)) {
    if (!isHex6(v)) fail(`palette.${k} is not #RRGGBB`);
    if (v.toUpperCase() === '#000000' || v.toUpperCase() === '#FFFFFF')
      fail(`palette.${k} is pure black/white (forbidden by Brand Kit v1.0)`);
  }
  for (const p of [...t.pairs, ...t.forbiddenPairs]) {
    if (!(p.fg in t.palette) || !(p.bg in t.palette)) fail(`unknown palette key in pair ${p.fg}/${p.bg}`);
  }
  for (const mode of ['light', 'dark'] as const) {
    for (const [role, key] of Object.entries(t.semantic[mode])) {
      if (!(key in t.palette)) fail(`semantic.${mode}.${role} -> unknown palette key ${key}`);
    }
    if (Object.keys(t.semantic.light).join() !== Object.keys(t.semantic[mode]).join())
      fail('light and dark must define the same roles in the same order');
  }
  for (const sp of t.semanticPairs) {
    if (!(sp.fg in t.semantic[sp.mode]) || !(sp.bg in t.semantic[sp.mode])) fail(`unknown semantic role in ${JSON.stringify(sp)}`);
  }
  if (!/^https:\/\/[a-z0-9.-]+(\/[a-z0-9._~/-]*)?$/i.test(t.origin) || t.origin.endsWith('/'))
    fail('content.origin must be an https origin/base path without a trailing slash');
  const seen = new Set<string>();
  for (const v of t.logo) {
    if (!/^[a-z0-9-]+$/.test(v.id) || seen.has(v.id)) fail(`logo id ${v.id} is invalid or duplicated`);
    seen.add(v.id);
    if (v.width < 1 || v.height < 1) fail(`logo ${v.id} has no size`);
  }
  for (const form of ['icon', 'centered', 'horizontal'] as const) {
    for (const bg of ['light', 'dark'] as const) {
      if (!t.logo.some((v) => v.form === form && v.background === bg)) fail(`logo: no ${form} variant for ${bg} backgrounds`);
    }
  }
  if (t.trustedKeys.length > 2) fail('keys.json: at most 2 trusted keys (current + next, for rotation)');
  for (const k of t.trustedKeys) {
    if (!/^[A-Za-z0-9._-]{1,64}$/.test(k.kid)) fail(`keys.json: invalid kid ${JSON.stringify(k.kid)}`);
    // Raw Ed25519 public key = 32 bytes = 43 base64url characters.
    if (!/^[A-Za-z0-9_-]{43}$/.test(k.publicKey))
      fail(`keys.json: ${k.kid} publicKey must be a 32-byte base64url string (use manifest-tool keygen)`);
  }
  for (const v of t.logo)
    if (!/^[0-9a-f]{64}$/.test(v.sha256)) fail(`logo ${v.id} has no valid sha256 (run: node scripts/logo-tool.mjs measure)`);
}
