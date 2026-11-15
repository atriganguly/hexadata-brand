import { hexToChannels } from './contrast.js';
import type { HexaManifest } from './schema.js';
import { PALETTE_KEYS, cssVarName } from './tokens.js';

/** Minimal structural type so this works with any element-like (and in tests without a DOM). */
export interface StyleTarget {
  readonly style: {
    setProperty(name: string, value: string): void;
    removeProperty(name: string): string;
  };
}

/**
 * Writes the validated palette as CSS custom properties through the CSSOM.
 * CSSOM writes are allowed under a strict CSP (`style-src` without 'unsafe-inline');
 * inline `style=""` attributes and <style>/<script> injection are not used anywhere.
 * Only palette keys already validated as #RRGGBB reach this function.
 */
export function applyManifestToElement(target: StyleTarget, manifest: HexaManifest): void {
  for (const key of PALETTE_KEYS) {
    const hex = manifest.tokens.palette[key];
    target.style.setProperty(cssVarName(key), hex);
    target.style.setProperty(`${cssVarName(key)}-rgb`, hexToChannels(hex));
  }
}

/** Removes everything applied above, restoring the stylesheet defaults. */
export function clearManifestFromElement(target: StyleTarget): void {
  for (const key of PALETTE_KEYS) {
    target.style.removeProperty(cssVarName(key));
    target.style.removeProperty(`${cssVarName(key)}-rgb`);
  }
}
