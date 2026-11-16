/* GENERATED FILE: DO NOT EDIT. Source: brand/ (run `npm run generate`). */

export const BRAND_SOURCE = "HexaData Brand Kit v1.0";
export const BRAND_REVISION = 2;
export const BRAND_ISSUED_AT = "2026-11-16T00:00:00Z";

export const PALETTE_KEYS = ['cyan', 'deepBlue', 'obsidian', 'vividCerulean', 'midnight', 'grey', 'white', 'crimson', 'copper', 'green'] as const;
export type PaletteKey = (typeof PALETTE_KEYS)[number];

export const DEFAULT_PALETTE: Readonly<Record<PaletteKey, string>> = Object.freeze({
  cyan: '#009BB6',
  deepBlue: '#046AA7',
  obsidian: '#121E36',
  vividCerulean: '#01A3E5',
  midnight: '#040F49',
  grey: '#A3B1C6',
  white: '#F8FAFC',
  crimson: '#FF3B30',
  copper: '#F59E0B',
  green: '#10B981',
});

export const DEFAULT_TAGLINES = Object.freeze({
  primary: "Supercomputing, On-demand.",
  secondary: "Engineered in India. Built for the World.",
});
export type TaglineKey = keyof typeof DEFAULT_TAGLINES;

/**
 * Brand Kit v1.0: pure black/white are acceptable ONLY where the defined shades
 * are technically unusable (print, email, forced-colors) or as a fallback.
 * They are never palette or manifest tokens.
 */
export const FALLBACK_COLORS = Object.freeze({ black: "#000000", white: "#FFFFFF" });

export const FONTS = {
  display: {
    family: "Space Grotesk",
    role: "Title / Heading / Hero",
    weights: [400,500,600,700],
    stack: ["\"Space Grotesk\"","\"Space Grotesk Fallback\"","\"Helvetica Neue\"","\"Arial\"","system-ui","sans-serif"],
  },
  body: {
    family: "Inter Tight",
    role: "Subtitle / Body / Descriptions",
    weights: [400,500,600,700],
    stack: ["\"Inter Tight\"","\"Inter Tight Fallback\"","system-ui","-apple-system","\"Segoe UI\"","\"Roboto\"","\"Helvetica Neue\"","\"Arial\"","\"Noto Sans Devanagari\"","\"Nirmala UI\"","\"Kohinoor Devanagari\"","sans-serif"],
  },
  mono: {
    family: "JetBrains Mono",
    role: "Detailed Descriptions / Paragraphs",
    weights: [400,500,600,700],
    stack: ["\"JetBrains Mono\"","\"JetBrains Mono Fallback\"","ui-monospace","\"SF Mono\"","\"Menlo\"","\"Cascadia Mono\"","\"Liberation Mono\"","\"Consolas\"","\"Courier New\"","monospace"],
  },
} as const;
export type FontRole = keyof typeof FONTS;

export type SemanticRole = 'bg' | 'fg' | 'fgStrong' | 'fgMuted' | 'bgAlt' | 'fgOnAlt' | 'accent' | 'borderStrong' | 'borderSubtle' | 'accentFill' | 'onAccentFill' | 'accentFillHover' | 'indicator' | 'danger' | 'warning' | 'success' | 'onStatus';
export type ThemeMode = 'light' | 'dark';
export const SEMANTIC: Readonly<Record<ThemeMode, Readonly<Record<SemanticRole, PaletteKey>>>> = {
  light: {
    bg: 'white',
    fg: 'obsidian',
    fgStrong: 'midnight',
    fgMuted: 'obsidian',
    bgAlt: 'white',
    fgOnAlt: 'obsidian',
    accent: 'deepBlue',
    borderStrong: 'obsidian',
    borderSubtle: 'grey',
    accentFill: 'deepBlue',
    onAccentFill: 'white',
    accentFillHover: 'midnight',
    indicator: 'cyan',
    danger: 'crimson',
    warning: 'copper',
    success: 'green',
    onStatus: 'obsidian',
  },
  dark: {
    bg: 'obsidian',
    fg: 'white',
    fgStrong: 'white',
    fgMuted: 'grey',
    bgAlt: 'midnight',
    fgOnAlt: 'white',
    accent: 'vividCerulean',
    borderStrong: 'grey',
    borderSubtle: 'grey',
    accentFill: 'vividCerulean',
    onAccentFill: 'obsidian',
    accentFillHover: 'cyan',
    indicator: 'vividCerulean',
    danger: 'crimson',
    warning: 'copper',
    success: 'green',
    onStatus: 'obsidian',
  },
};

export interface ColorPair {
  readonly fg: PaletteKey;
  readonly bg: PaletteKey;
  /** Minimum WCAG contrast ratio: 4.5 for text, 3 for non-text UI. */
  readonly min: number;
  readonly use: string;
}
export interface ForbiddenPair {
  readonly fg: PaletteKey;
  readonly bg: PaletteKey;
  readonly min: number;
  readonly reason: string;
}
export interface SemanticPair {
  readonly mode: ThemeMode;
  readonly fg: SemanticRole;
  readonly bg: SemanticRole;
  readonly min: number;
}

/** Palette pairs the brand permits, each with the minimum ratio it must keep. */
export const ALLOWED_PAIRS: readonly ColorPair[] = [
  { fg: 'obsidian', bg: 'white', min: 4.5, use: "Primary text, light mode" },
  { fg: 'midnight', bg: 'white', min: 4.5, use: "Alternative dark text, light mode" },
  { fg: 'obsidian', bg: 'grey', min: 4.5, use: "Text on secondary light background" },
  { fg: 'midnight', bg: 'grey', min: 4.5, use: "Alternative text on secondary light background" },
  { fg: 'white', bg: 'obsidian', min: 4.5, use: "Primary text, dark mode" },
  { fg: 'white', bg: 'midnight', min: 4.5, use: "Text on secondary dark background" },
  { fg: 'grey', bg: 'obsidian', min: 4.5, use: "Alternative light text / muted text, dark mode" },
  { fg: 'grey', bg: 'midnight', min: 4.5, use: "Alternative light text on secondary dark background" },
  { fg: 'obsidian', bg: 'cyan', min: 4.5, use: "Text on cyan fill (CTA)" },
  { fg: 'obsidian', bg: 'vividCerulean', min: 4.5, use: "Text on cerulean fill (CTA)" },
  { fg: 'obsidian', bg: 'crimson', min: 4.5, use: "Text on crimson fill (error/destructive)" },
  { fg: 'obsidian', bg: 'copper', min: 4.5, use: "Text on copper fill (warning)" },
  { fg: 'obsidian', bg: 'green', min: 4.5, use: "Text on green fill (success)" },
  { fg: 'midnight', bg: 'cyan', min: 4.5, use: "Alternative text on cyan fill" },
  { fg: 'midnight', bg: 'vividCerulean', min: 4.5, use: "Alternative text on cerulean fill" },
  { fg: 'midnight', bg: 'crimson', min: 4.5, use: "Alternative text on crimson fill" },
  { fg: 'midnight', bg: 'copper', min: 4.5, use: "Alternative text on copper fill" },
  { fg: 'midnight', bg: 'green', min: 4.5, use: "Alternative text on green fill" },
  { fg: 'white', bg: 'deepBlue', min: 4.5, use: "Text on deep-blue fill (CTA)" },
  { fg: 'deepBlue', bg: 'white', min: 4.5, use: "Links / accent text, light mode" },
  { fg: 'cyan', bg: 'obsidian', min: 4.5, use: "Accent text, dark mode" },
  { fg: 'cyan', bg: 'midnight', min: 4.5, use: "Accent text, dark mode (secondary)" },
  { fg: 'vividCerulean', bg: 'obsidian', min: 4.5, use: "Accent text, dark mode" },
  { fg: 'vividCerulean', bg: 'midnight', min: 4.5, use: "Accent text, dark mode (secondary)" },
  { fg: 'crimson', bg: 'obsidian', min: 4.5, use: "Error text, dark mode" },
  { fg: 'crimson', bg: 'midnight', min: 4.5, use: "Error text, dark mode (secondary)" },
  { fg: 'copper', bg: 'obsidian', min: 4.5, use: "Warning text, dark mode" },
  { fg: 'copper', bg: 'midnight', min: 4.5, use: "Warning text, dark mode (secondary)" },
  { fg: 'green', bg: 'obsidian', min: 4.5, use: "Success text, dark mode" },
  { fg: 'green', bg: 'midnight', min: 4.5, use: "Success text, dark mode (secondary)" },
  { fg: 'cyan', bg: 'white', min: 3, use: "Non-text UI (icons, borders), light mode" },
  { fg: 'deepBlue', bg: 'white', min: 3, use: "Non-text UI, light mode" },
  { fg: 'crimson', bg: 'white', min: 3, use: "Non-text UI (error outline), light mode" },
  { fg: 'grey', bg: 'obsidian', min: 3, use: "Non-text UI (borders), dark mode" },
  { fg: 'grey', bg: 'midnight', min: 3, use: "Non-text UI (borders), dark mode" },
  { fg: 'deepBlue', bg: 'midnight', min: 3, use: "Non-text UI on secondary dark background" },
];

/** Palette pairs that must never be used (for the stated purpose). */
export const FORBIDDEN_PAIRS: readonly ForbiddenPair[] = [
  { fg: 'grey', bg: 'white', min: 4.5, reason: "Grey text on white is 2.08:1. No single grey can serve both white and obsidian at 4.5:1 (ceiling 3.98:1)." },
  { fg: 'white', bg: 'grey', min: 4.5, reason: "White text on the grey background is 2.08:1." },
  { fg: 'obsidian', bg: 'midnight', min: 3, reason: "1.08:1. Separate dark surfaces with a grey border, never by colour alone." },
  { fg: 'midnight', bg: 'obsidian', min: 3, reason: "1.08:1. Separate dark surfaces with a grey border, never by colour alone." },
  { fg: 'cyan', bg: 'white', min: 4.5, reason: "Cyan text on white is 3.15:1 (UI use at 3:1 is allowed)." },
  { fg: 'vividCerulean', bg: 'white', min: 3, reason: "2.72:1: fails even the 3:1 non-text minimum on light backgrounds." },
  { fg: 'crimson', bg: 'white', min: 4.5, reason: "Crimson text on white is 3.39:1 (UI use at 3:1 is allowed)." },
  { fg: 'copper', bg: 'white', min: 3, reason: "2.05:1: fails the 3:1 non-text minimum on light backgrounds." },
  { fg: 'green', bg: 'white', min: 3, reason: "2.42:1: fails the 3:1 non-text minimum on light backgrounds." },
  { fg: 'deepBlue', bg: 'obsidian', min: 3, reason: "2.87:1 on obsidian: invisible as text or UI in dark mode." },
  { fg: 'deepBlue', bg: 'midnight', min: 4.5, reason: "3.10:1 on midnight: UI use only, never text." },
  { fg: 'deepBlue', bg: 'grey', min: 3, reason: "2.67:1 on the grey background." },
  { fg: 'white', bg: 'cyan', min: 4.5, reason: "White text on cyan fill is 3.15:1. Use obsidian." },
  { fg: 'white', bg: 'vividCerulean', min: 4.5, reason: "White text on cerulean fill is 2.72:1. Use obsidian." },
  { fg: 'white', bg: 'crimson', min: 4.5, reason: "White text on crimson fill is 3.39:1. Use obsidian." },
  { fg: 'white', bg: 'copper', min: 4.5, reason: "White text on copper fill is 2.05:1. Use obsidian." },
  { fg: 'white', bg: 'green', min: 4.5, reason: "White text on green fill is 2.42:1. Use obsidian." },
];

/** Semantic role pairs that must hold in each theme mode. */
export const SEMANTIC_PAIRS: readonly SemanticPair[] = [
  { mode: 'light', fg: 'fg', bg: 'bg', min: 4.5 },
  { mode: 'light', fg: 'fgStrong', bg: 'bg', min: 4.5 },
  { mode: 'light', fg: 'fgMuted', bg: 'bg', min: 4.5 },
  { mode: 'light', fg: 'fgOnAlt', bg: 'bgAlt', min: 4.5 },
  { mode: 'light', fg: 'accent', bg: 'bg', min: 4.5 },
  { mode: 'light', fg: 'borderStrong', bg: 'bg', min: 3 },
  { mode: 'dark', fg: 'fg', bg: 'bg', min: 4.5 },
  { mode: 'dark', fg: 'fgStrong', bg: 'bg', min: 4.5 },
  { mode: 'dark', fg: 'fgMuted', bg: 'bg', min: 4.5 },
  { mode: 'dark', fg: 'fg', bg: 'bgAlt', min: 4.5 },
  { mode: 'dark', fg: 'fgMuted', bg: 'bgAlt', min: 4.5 },
  { mode: 'dark', fg: 'fgOnAlt', bg: 'bgAlt', min: 4.5 },
  { mode: 'dark', fg: 'accent', bg: 'bg', min: 4.5 },
  { mode: 'dark', fg: 'accent', bg: 'bgAlt', min: 4.5 },
  { mode: 'dark', fg: 'borderStrong', bg: 'bg', min: 3 },
  { mode: 'dark', fg: 'borderStrong', bg: 'bgAlt', min: 3 },
  { mode: 'light', fg: 'onAccentFill', bg: 'accentFill', min: 4.5 },
  { mode: 'light', fg: 'onStatus', bg: 'danger', min: 4.5 },
  { mode: 'light', fg: 'onStatus', bg: 'warning', min: 4.5 },
  { mode: 'light', fg: 'onStatus', bg: 'success', min: 4.5 },
  { mode: 'dark', fg: 'onAccentFill', bg: 'accentFill', min: 4.5 },
  { mode: 'dark', fg: 'onStatus', bg: 'danger', min: 4.5 },
  { mode: 'dark', fg: 'onStatus', bg: 'warning', min: 4.5 },
  { mode: 'dark', fg: 'onStatus', bg: 'success', min: 4.5 },
  { mode: 'light', fg: 'onAccentFill', bg: 'accentFillHover', min: 4.5 },
  { mode: 'light', fg: 'indicator', bg: 'bg', min: 3 },
  { mode: 'dark', fg: 'onAccentFill', bg: 'accentFillHover', min: 4.5 },
  { mode: 'dark', fg: 'indicator', bg: 'bg', min: 3 },
];

/** Foundation scales as final CSS values (approved 2026-11-15; see docs/FOUNDATIONS-PROPOSAL.md). Shadows reference palette variables. */
export const FOUNDATIONS = {
  "space": {
    "0": "0",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem",
    "0-5": "0.125rem"
  },
  "radius": {
    "none": "0",
    "sm": "0.125rem",
    "md": "0.25rem",
    "lg": "0.5rem",
    "xl": "0.75rem",
    "full": "9999px"
  },
  "shadow": {
    "1": "0 1px 2px 0 rgb(var(--hd-midnight-rgb) / 0.12)",
    "2": "0 2px 6px 0 rgb(var(--hd-midnight-rgb) / 0.14), 0 1px 2px 0 rgb(var(--hd-midnight-rgb) / 0.1)",
    "3": "0 8px 24px 0 rgb(var(--hd-midnight-rgb) / 0.18), 0 2px 6px 0 rgb(var(--hd-midnight-rgb) / 0.12)"
  },
  "duration": {
    "instant": "0ms",
    "fast": "120ms",
    "base": "200ms",
    "slow": "320ms"
  },
  "easing": {
    "standard": "cubic-bezier(0.2, 0, 0, 1)",
    "enter": "cubic-bezier(0, 0, 0, 1)",
    "exit": "cubic-bezier(0.3, 0, 1, 1)"
  },
  "fontSize": {
    "xs": "0.75rem",
    "sm": "0.875rem",
    "base": "1rem",
    "lg": "1.125rem",
    "xl": "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem"
  },
  "lineHeight": {
    "tight": "1.2",
    "snug": "1.35",
    "normal": "1.5",
    "relaxed": "1.7"
  },
  "breakpoint": {
    "sm": "40rem",
    "md": "48rem",
    "lg": "64rem",
    "xl": "80rem",
    "2xl": "96rem"
  },
  "zIndex": {
    "base": "0",
    "dropdown": "1000",
    "sticky": "1100",
    "overlay": "1200",
    "modal": "1300",
    "toast": "1400",
    "tooltip": "1500"
  }
} as const;

export const cssVarName = (key: string): string => `--hd-${key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
