import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react';
import {
  DEFAULT_MANIFEST,
  applyManifestToElement,
  clearManifestFromElement,
  fetchSignedManifest,
  type HexaManifest,
  type ManifestWarning,
  type RemoteFailure,
  type RemoteManifestOptions,
  type StyleTarget,
} from '../core/index.js';

const HexaContext = createContext<HexaManifest>(DEFAULT_MANIFEST);

export type HexaIssue =
  | { readonly kind: 'remote-failed'; readonly reason: RemoteFailure; readonly detail?: string }
  | { readonly kind: 'warnings'; readonly warnings: readonly ManifestWarning[] };

export interface HexaProviderProps {
  readonly children: ReactNode;
  /**
   * Opt-in runtime brand updates from a signed manifest. Omit it (the default) and the
   * provider makes NO network requests and uses the brand values baked into this package.
   */
  readonly remote?: Omit<RemoteManifestOptions, 'signal'>;
  /** Called when a remote update is rejected or produced warnings. Silent otherwise. */
  readonly onIssue?: (issue: HexaIssue) => void;
  /** Element that receives the CSS variables. Defaults to document.documentElement. */
  readonly target?: StyleTarget;
}

/**
 * Client component. Always renders with the baked-in manifest first, so server and
 * client markup are identical (no hydration mismatch), then optionally upgrades.
 */
export function HexaProvider({ children, remote, onIssue, target }: HexaProviderProps): ReactElement {
  const [manifest, setManifest] = useState<HexaManifest>(DEFAULT_MANIFEST);
  const onIssueRef = useRef(onIssue);
  onIssueRef.current = onIssue;

  // Stable identity for the effect dependency without forcing callers to memoise `remote`.
  const remoteKey = remote ? JSON.stringify([remote.url, remote.keys, remote.minRevision, remote.timeoutMs, remote.maxBytes]) : null;
  const remoteRef = useRef(remote);
  remoteRef.current = remote;

  useEffect(() => {
    const options = remoteRef.current;
    if (!options) return undefined;
    const el: StyleTarget | undefined = target ?? (typeof document !== 'undefined' ? document.documentElement : undefined);
    const controller = new AbortController();
    let applied = false;

    void fetchSignedManifest({ ...options, signal: controller.signal }).then((result) => {
      if (controller.signal.aborted) return;
      if (!result.ok) {
        if (result.reason !== 'aborted')
          onIssueRef.current?.({
            kind: 'remote-failed',
            reason: result.reason,
            ...(result.detail !== undefined ? { detail: result.detail } : {}),
          });
        return;
      }
      if (result.warnings.length > 0) onIssueRef.current?.({ kind: 'warnings', warnings: result.warnings });
      setManifest(result.manifest);
      if (el) {
        applyManifestToElement(el, result.manifest);
        applied = true;
      }
    });

    return () => {
      controller.abort();
      if (applied && el) clearManifestFromElement(el);
    };
  }, [remoteKey, target]);

  const value = useMemo(() => manifest, [manifest]);
  return <HexaContext.Provider value={value}>{children}</HexaContext.Provider>;
}

/** Returns the active manifest. Works without a provider (returns the baked-in brand). */
export function useHexaBrand(): HexaManifest {
  return useContext(HexaContext);
}
