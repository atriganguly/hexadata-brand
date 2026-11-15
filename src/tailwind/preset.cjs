'use strict';
/* GENERATED FILE: DO NOT EDIT. Source: tokens/brand.json (run `npm run generate`). */

// `rgb(var(--x-rgb) / <alpha-value>)` keeps Tailwind opacity modifiers (bg-hd-cyan/50)
// working while the values stay overridable through CSS variables.
const rgb = (name) => `rgb(var(--hd-${name}-rgb) / <alpha-value>)`;

const brandColors = {
  transparent: 'transparent',
  current: 'currentColor',
  inherit: 'inherit',
  black: rgb('obsidian'),
  white: rgb('white'),
  gray: { DEFAULT: rgb('grey') },
  hd: {
    'cyan': rgb('cyan'),
    'deep-blue': rgb('deep-blue'),
    'obsidian': rgb('obsidian'),
    'vivid-cerulean': rgb('vivid-cerulean'),
    'midnight': rgb('midnight'),
    'grey': rgb('grey'),
    'white': rgb('white'),
    'crimson': rgb('crimson'),
    'copper': rgb('copper'),
    'green': rgb('green'),
    'bg': rgb('bg'),
    'fg': rgb('fg'),
    'fg-strong': rgb('fg-strong'),
    'fg-muted': rgb('fg-muted'),
    'bg-alt': rgb('bg-alt'),
    'fg-on-alt': rgb('fg-on-alt'),
    'accent': rgb('accent'),
    'border-strong': rgb('border-strong'),
    'border-subtle': rgb('border-subtle'),
  },
};

const fontFamily = {
  display: ["\"Space Grotesk\"","\"Space Grotesk Fallback\"","\"Helvetica Neue\"","\"Arial\"","system-ui","sans-serif"],
  body: ["\"Inter Tight\"","\"Inter Tight Fallback\"","system-ui","-apple-system","\"Segoe UI\"","\"Roboto\"","\"Helvetica Neue\"","\"Arial\"","\"Noto Sans Devanagari\"","\"Nirmala UI\"","\"Kohinoor Devanagari\"","sans-serif"],
  mono: ["\"JetBrains Mono\"","\"JetBrains Mono Fallback\"","ui-monospace","\"SF Mono\"","\"Menlo\"","\"Cascadia Mono\"","\"Liberation Mono\"","\"Consolas\"","\"Courier New\"","monospace"],
};

/**
 * @param {{ extend?: boolean }} [options]
 * Default (strict): REPLACES Tailwind's colour palette so only brand colours exist.
 * `extend: true`: adds brand colours alongside Tailwind's defaults.
 */
function createPreset(options = {}) {
  if (options.extend === true) {
    return { theme: { extend: { colors: brandColors, fontFamily } } };
  }
  return { theme: { colors: brandColors, extend: { fontFamily } } };
}

const preset = createPreset();
Object.defineProperty(preset, 'createPreset', { value: createPreset, enumerable: false });
module.exports = preset;
