'use strict';
/* GENERATED FILE: DO NOT EDIT. Source: brand/ (run `npm run generate`). */

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
    'accent-fill': rgb('accent-fill'),
    'on-accent-fill': rgb('on-accent-fill'),
    'danger': rgb('danger'),
    'warning': rgb('warning'),
    'success': rgb('success'),
    'on-status': rgb('on-status'),
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
const foundations = {
  borderRadius: {"none":"var(--hd-radius-none)","sm":"var(--hd-radius-sm)","md":"var(--hd-radius-md)","lg":"var(--hd-radius-lg)","xl":"var(--hd-radius-xl)","full":"var(--hd-radius-full)"},
  boxShadow: {"sm":"var(--hd-shadow-1)","md":"var(--hd-shadow-2)","lg":"var(--hd-shadow-3)"},
  fontSize: {"xs":"var(--hd-font-size-xs)","sm":"var(--hd-font-size-sm)","base":"var(--hd-font-size-base)","lg":"var(--hd-font-size-lg)","xl":"var(--hd-font-size-xl)","2xl":"var(--hd-font-size-2xl)","3xl":"var(--hd-font-size-3xl)","4xl":"var(--hd-font-size-4xl)","5xl":"var(--hd-font-size-5xl)","6xl":"var(--hd-font-size-6xl)"},
  transitionDuration: {"instant":"var(--hd-duration-instant)","fast":"var(--hd-duration-fast)","base":"var(--hd-duration-base)","slow":"var(--hd-duration-slow)"},
  transitionTimingFunction: {"standard":"var(--hd-ease-standard)","enter":"var(--hd-ease-enter)","exit":"var(--hd-ease-exit)"},
  zIndex: {"base":"var(--hd-z-base)","dropdown":"var(--hd-z-dropdown)","sticky":"var(--hd-z-sticky)","overlay":"var(--hd-z-overlay)","modal":"var(--hd-z-modal)","toast":"var(--hd-z-toast)","tooltip":"var(--hd-z-tooltip)"},
  // CSS variables cannot be used inside @media, so breakpoints are literal values.
  screens: {"sm":"40rem","md":"48rem","lg":"64rem","xl":"80rem","2xl":"96rem"},
};

function createPreset(options = {}) {
  if (options.extend === true) {
    return { theme: { extend: { colors: brandColors, fontFamily, ...foundations } } };
  }
  return { theme: { colors: brandColors, ...foundations, extend: { fontFamily } } };
}

const preset = createPreset();
Object.defineProperty(preset, 'createPreset', { value: createPreset, enumerable: false });
module.exports = preset;
