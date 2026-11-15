/** Resolved, flat view of everything under brand/. Emitters read only this. */
export interface FontSpec {
  family: string;
  role: string;
  weights: number[];
  system: string[];
}
export interface Pair {
  fg: string;
  bg: string;
  min: number;
  use?: string;
  reason?: string;
}
export type FoundationGroup = 'space' | 'radius' | 'shadow' | 'duration' | 'easing' | 'fontSize' | 'lineHeight' | 'breakpoint' | 'zIndex';
/** Each group maps token name -> final CSS value (shadows already reference the palette's --hd-*-rgb variables). */
export type Foundations = Record<FoundationGroup, Record<string, string>>;
export interface Tokens {
  source: string;
  owner: string;
  revision: number;
  issuedAt: string;
  palette: Record<string, string>;
  taglines: { primary: string; secondary: string };
  fallbackColors: { black: string; white: string; note: string };
  fonts: Record<'display' | 'body' | 'mono', FontSpec>;
  semantic: Record<'light' | 'dark', Record<string, string>>;
  semanticPairs: { mode: 'light' | 'dark'; fg: string; bg: string; min: number }[];
  pairs: Pair[];
  forbiddenPairs: Pair[];
  foundations: Foundations;
}

export interface Ctx {
  write: (rel: string, content: string) => void;
  HEADER: string;
  kebab: (s: string) => string;
  quoteFamily: (f: string) => string;
  stack: (f: FontSpec) => string[];
  cssStack: (f: FontSpec) => string;
  jsStack: (f: FontSpec) => string;
  paletteKeys: string[];
}
