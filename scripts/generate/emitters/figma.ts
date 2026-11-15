import { toNumber } from '../lib.ts';
import type { Ctx, Tokens } from '../types.ts';

/** figma/sync-payload.json: everything the Figma library needs, resolved. The sync script (figma/sync.md) applies it idempotently. */
export function emit(t: Tokens, { write }: Ctx): void {
  const kebab = (s: string): string => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const roles = Object.keys(t.semantic.light);
  const F = t.foundations;
  const num = (g: Record<string, string>): Record<string, number> =>
    Object.fromEntries(Object.entries(g).map(([k, v]) => [k, toNumber(v)]));
  const payload = {
    $generated: 'GENERATED FILE: DO NOT EDIT. Source: brand/ (run `npm run generate`).',
    version: t.version,
    revision: t.revision,
    colors: Object.fromEntries(Object.entries(t.palette).map(([k, v]) => [kebab(k), { hex: v.toUpperCase(), css: `--hd-${kebab(k)}` }])),
    roles: Object.fromEntries(
      roles.map((r) => [kebab(r), { light: kebab(t.semantic.light[r]!), dark: kebab(t.semantic.dark[r]!), css: `--hd-${kebab(r)}` }]),
    ),
    space: num(F.space),
    radius: num(F.radius),
    fontSize: num(F.fontSize),
    fonts: Object.fromEntries(Object.entries(t.fonts).map(([k, f]) => [k, { family: f.family, weights: f.weights }])),
    shadows: Object.entries(F.shadow).map(([k, css]) => ({
      name: k,
      layers: [...css.matchAll(/0 (\d+)px (\d+)px 0 rgb\(var\(--hd-midnight-rgb\) \/ ([0-9.]+)\)/g)].map((m) => ({
        y: Number(m[1]),
        blur: Number(m[2]),
        alpha: Number(m[3]),
      })),
    })),
    taglines: t.taglines,
  };
  write('figma/sync-payload.json', `${JSON.stringify(payload, null, 2)}\n`);
}
