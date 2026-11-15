import {
  DEFAULT_MANIFEST,
  resolveRemote,
  startLive,
  type HexaManifest,
  type LiveHandle,
  type LiveIssue,
  type RemoteConfig,
} from '../core/index.js';

/**
 * Shared brand state for the custom elements. Starts as the baked-in brand; a verified live update replaces it and
 * notifies every element (and fires `hexa-brand-update` on `document`). Nothing is persisted.
 */
let current: HexaManifest = DEFAULT_MANIFEST;
const subscribers = new Set<() => void>();

export const getBrand = (): HexaManifest => current;

export function onBrandChange(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export interface HexaLiveOptions {
  /** `false` = never make a request. Default: on, using the brand channel and the keys embedded in this package. */
  readonly live?: boolean;
  /** Use your own signed manifest instead of the brand channel. */
  readonly remote?: RemoteConfig;
  readonly onIssue?: (issue: LiveIssue) => void;
}

/** Fetches the signed brand manifest (if any is configured), applies its colours as CSS variables and refreshes the elements. */
export function startHexaLive(options: HexaLiveOptions = {}): LiveHandle {
  const target = typeof document === 'undefined' ? undefined : document.documentElement;
  return startLive(resolveRemote(options), {
    target,
    onManifest: (m) => {
      current = m;
      for (const fn of subscribers) fn();
      if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent('hexa-brand-update', { detail: m }));
    },
    ...(options.onIssue ? { onIssue: options.onIssue } : {}),
  });
}
