import type { Ctx, Tokens } from '../types.ts';

export function emit(t: Tokens, { write, HEADER, kebab, paletteKeys }: Ctx): void {
  const roles = Object.keys(t.semantic.light);
  const v4Colors = [...paletteKeys, ...roles].map((n) => `  --color-hd-${kebab(n)}: var(--hd-${kebab(n)});`).join('\n');
  write(
    'src/tailwind/theme.css',
    `/* ${HEADER} */
/* Tailwind v4: import AFTER "tailwindcss" and "@hexadata/brand/css". */
@theme inline {
  --color-*: initial;
  --color-black: var(--hd-obsidian);
  --color-white: var(--hd-white);
  --color-gray: var(--hd-grey);
${v4Colors}
  --font-display: var(--hd-font-display);
  --font-body: var(--hd-font-body);
  --font-mono: var(--hd-font-mono);
}
`,
  );
}
