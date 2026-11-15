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
}
