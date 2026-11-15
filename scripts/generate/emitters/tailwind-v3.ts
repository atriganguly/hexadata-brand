import type { Ctx, Tokens } from '../types.ts';

export function emit(t: Tokens, { write, HEADER, kebab, jsStack, paletteKeys }: Ctx): void {
  const roles = Object.keys(t.semantic.light);
  const hdColors = [...paletteKeys, ...roles].map((n) => `    '${kebab(n)}': rgb('${kebab(n)}'),`).join('\n');
  const F = t.foundations;
  const vars = (prefix: string, g: Record<string, string>, rename: Record<string, string> = {}): string =>
    JSON.stringify(Object.fromEntries(Object.keys(g).map((k) => [rename[k] ?? k, `var(--hd-${prefix}-${k})`])));
  const foundationTheme = `{
  borderRadius: ${vars('radius', F.radius)},
  boxShadow: ${vars('shadow', F.shadow, { '1': 'sm', '2': 'md', '3': 'lg' })},
  fontSize: ${vars('font-size', F.fontSize)},
  transitionDuration: ${vars('duration', F.duration)},
  transitionTimingFunction: ${vars('ease', F.easing)},
  zIndex: ${vars('z', F.zIndex)},
  // CSS variables cannot be used inside @media, so breakpoints are literal values.
  screens: ${JSON.stringify(F.breakpoint)},
}`;
  write(
    'src/tailwind/preset.cjs',
    `'use strict';
/* ${HEADER} */

// \`rgb(var(--x-rgb) / <alpha-value>)\` keeps Tailwind opacity modifiers (bg-hd-cyan/50)
// working while the values stay overridable through CSS variables.
const rgb = (name) => \`rgb(var(--hd-\${name}-rgb) / <alpha-value>)\`;

const brandColors = {
  transparent: 'transparent',
  current: 'currentColor',
  inherit: 'inherit',
  black: rgb('obsidian'),
  white: rgb('white'),
  gray: { DEFAULT: rgb('grey') },
  hd: {
${hdColors}
  },
};

const fontFamily = {
  display: ${jsStack(t.fonts.display)},
  body: ${jsStack(t.fonts.body)},
  mono: ${jsStack(t.fonts.mono)},
};

/**
 * @param {{ extend?: boolean }} [options]
 * Default (strict): REPLACES Tailwind's colour palette so only brand colours exist.
 * \`extend: true\`: adds brand colours alongside Tailwind's defaults.
 */
const foundations = ${foundationTheme};

function createPreset(options = {}) {
  if (options.extend === true) {
    return { theme: { extend: { colors: brandColors, fontFamily, ...foundations } } };
  }
  return { theme: { colors: brandColors, ...foundations, extend: { fontFamily } } };
}

const preset = createPreset();
Object.defineProperty(preset, 'createPreset', { value: createPreset, enumerable: false });
module.exports = preset;
`,
  );
}
