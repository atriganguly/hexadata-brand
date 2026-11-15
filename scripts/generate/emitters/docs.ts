import { contrastRatio } from '../../../src/core/contrast.ts';
import type { Ctx, Pair, Tokens } from '../types.ts';

export function emit(t: Tokens, { write, HEADER, paletteKeys }: Ctx): void {
  const ratio = (a: string, b: string): number => contrastRatio(t.palette[a]!, t.palette[b]!);
  const cell = (r: number): string => `${r.toFixed(2)}${r >= 7 ? ' ✓✓' : r >= 4.5 ? ' ✓' : r >= 3 ? ' ◐' : ' ✗'}`;
  const matrix = [
    `| | ${paletteKeys.join(' | ')} |`,
    `|---|${paletteKeys.map(() => '---').join('|')}|`,
    ...paletteKeys.map((a) => `| **${a}** | ${paletteKeys.map((b) => (a === b ? '–' : cell(ratio(a, b)))).join(' | ')} |`),
  ].join('\n');
  const rows = (list: Pair[], extra: 'use' | 'reason'): string =>
    list.map((p) => `| ${p.fg} on ${p.bg} | ${ratio(p.fg, p.bg).toFixed(2)} | ${p.min} | ${p[extra] ?? ''} |`).join('\n');
  write(
    'docs/contrast-matrix.md',
    `<!-- ${HEADER} -->
# Contrast matrix (WCAG 2.x)

Computed from \`brand/\`. Legend: ✓✓ ≥ 7 (AAA text) · ✓ ≥ 4.5 (AA text) · ◐ ≥ 3 (large text / UI only) · ✗ < 3.
Contrast is symmetric, but *use* is directional: see the rules below.

${matrix}

## Allowed pairs (enforced in CI and by the remote-manifest guard)

| Pair | Ratio | Min | Use |
|---|---|---|---|
${rows(t.pairs, 'use')}

## Forbidden pairs (documented, and asserted to be below their threshold)

| Pair | Ratio | Needs | Why |
|---|---|---|---|
${rows(t.forbiddenPairs, 'reason')}
`,
  );
}
