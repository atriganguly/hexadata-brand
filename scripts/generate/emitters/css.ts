import { hexToChannels } from '../../../src/core/contrast.ts';
import type { Ctx, Tokens } from '../types.ts';

export function emit(t: Tokens, { write, HEADER, kebab, cssStack, paletteKeys }: Ctx): void {
  const paletteVars = paletteKeys
    .map((k) => `  --hd-${kebab(k)}: ${t.palette[k]!.toUpperCase()};\n  --hd-${kebab(k)}-rgb: ${hexToChannels(t.palette[k]!)};`)
    .join('\n');
  const semVars = (mode: 'light' | 'dark', indent: string): string =>
    Object.entries(t.semantic[mode])
      .map(
        ([role, key]) =>
          `${indent}--hd-${kebab(role)}: var(--hd-${kebab(key)});\n${indent}--hd-${kebab(role)}-rgb: var(--hd-${kebab(key)}-rgb);`,
      )
      .join('\n');
  write(
    'src/css/hexadata.css',
    `/* ${HEADER} */
:root {
${paletteVars}

  --hd-font-display: ${cssStack(t.fonts.display)};
  --hd-font-body: ${cssStack(t.fonts.body)};
  --hd-font-mono: ${cssStack(t.fonts.mono)};

  /* Semantic roles: light (default) */
${semVars('light', '  ')}
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${semVars('dark', '    ')}
    color-scheme: dark;
  }
}

:root[data-theme='dark'] {
${semVars('dark', '  ')}
  color-scheme: dark;
}

/* Users who ask for more contrast get the strong border/text roles everywhere. */
@media (prefers-contrast: more) {
  :root {
    --hd-border-subtle: var(--hd-border-strong);
    --hd-border-subtle-rgb: var(--hd-border-strong-rgb);
    --hd-fg-muted: var(--hd-fg);
    --hd-fg-muted-rgb: var(--hd-fg-rgb);
  }
}
`,
  );
}
