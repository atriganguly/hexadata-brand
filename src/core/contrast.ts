/**
 * WCAG 2.x contrast maths. Pure and dependency-free so it can run in the
 * build scripts, the manifest guard, the tests and (if wanted) the browser.
 * Ratios are never rounded up: 4.499 does NOT pass 4.5.
 */

const HEX6 = /^#[0-9A-Fa-f]{6}$/;

export function isHex6(value: unknown): value is string {
  return typeof value === 'string' && HEX6.test(value);
}

export function parseHex(hex: string): [number, number, number] {
  if (!isHex6(hex)) throw new TypeError(`Expected a #RRGGBB colour, got ${JSON.stringify(hex)}`);
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

/** WCAG contrast ratio, 1..21. Symmetric. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export type WcagGrade = 'AAA' | 'AA' | 'AA-large' | 'fail';

/** Grade a ratio for normal text (AAA 7, AA 4.5) or large text / UI (AA 3). */
export function wcagGrade(ratio: number): WcagGrade {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-large';
  return 'fail';
}

/** "0 155 182": the space-separated channel form used by `rgb(var(--x) / <alpha-value>)`. */
export function hexToChannels(hex: string): string {
  return parseHex(hex).join(' ');
}
