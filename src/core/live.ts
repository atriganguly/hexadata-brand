import { applyManifestToElement, clearManifestFromElement, type StyleTarget } from './apply.js';
import { fetchSignedManifest, type RemoteFailure, type RemoteManifestOptions, type RemoteResult } from './remote.js';
import type { HexaManifest, ManifestWarning } from './schema.js';
import { DEFAULT_MANIFEST_URL, TRUSTED_KEYS } from './trust.js';

/**
 * Live brand updates: the evergreen hosted channel publishes a signed manifest; apps pick it up without a release.
 * Failure is always silent for the user: any problem (offline, bad signature, expired, rollback, contrast regression)
 * keeps the baked-in brand. Nothing is stored, no cookies/credentials are sent (see remote.ts).
 */
export type RemoteConfig = Omit<RemoteManifestOptions, 'signal'>;

export type LiveIssue =
  | { readonly kind: 'remote-failed'; readonly reason: RemoteFailure; readonly detail?: string }
  | { readonly kind: 'warnings'; readonly warnings: readonly ManifestWarning[] };

/**
 * Decides which remote (if any) to use. Explicit `remote` always wins. Otherwise the brand's own channel is used
 * unless `live === false` or no trusted keys are embedded (then there is nothing to verify against, so no request is made).
 */
export function resolveRemote(
  options: { readonly live?: boolean | undefined; readonly remote?: RemoteConfig | undefined },
  trusted: readonly { kid: string; publicKey: string }[] = TRUSTED_KEYS,
  url: string = DEFAULT_MANIFEST_URL,
): RemoteConfig | undefined {
  if (options.remote) return options.remote;
  if (options.live === false || trusted.length === 0) return undefined;
  return { url, keys: trusted };
}

export interface LiveHooks {
  /** Element that receives the CSS variables (browser only). */
  readonly target?: StyleTarget | undefined;
  readonly onManifest?: (manifest: HexaManifest) => void;
  readonly onIssue?: (issue: LiveIssue) => void;
}

export interface LiveHandle {
  /** Aborts an in-flight request and removes any variables this handle applied. Safe to call repeatedly. */
  stop(): void;
  /** Resolves when the attempt finished (never rejects). `undefined` when live is off or stopped. */
  readonly done: Promise<RemoteResult | undefined>;
}

export function startLive(config: RemoteConfig | undefined, hooks: LiveHooks = {}): LiveHandle {
  if (!config) return { stop: () => undefined, done: Promise.resolve(undefined) };
  const controller = new AbortController();
  let applied = false;
  const done = fetchSignedManifest({ ...config, signal: controller.signal }).then((result): RemoteResult | undefined => {
    if (controller.signal.aborted) return undefined;
    if (!result.ok) {
      if (result.reason !== 'aborted') {
        hooks.onIssue?.({
          kind: 'remote-failed',
          reason: result.reason,
          ...(result.detail !== undefined ? { detail: result.detail } : {}),
        });
      }
      return result;
    }
    if (result.warnings.length > 0) hooks.onIssue?.({ kind: 'warnings', warnings: result.warnings });
    if (hooks.target) {
      applyManifestToElement(hooks.target, result.manifest);
      applied = true;
    }
    hooks.onManifest?.(result.manifest);
    return result;
  });
  return {
    done,
    stop: () => {
      controller.abort();
      if (applied && hooks.target) clearManifestFromElement(hooks.target);
      applied = false;
    },
  };
}
