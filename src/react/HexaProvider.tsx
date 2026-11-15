import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react';
import {
  DEFAULT_MANIFEST,
  resolveRemote,
  startLive,
  type HexaManifest,
  type LiveIssue,
  type RemoteConfig,
  type StyleTarget,
} from '../core/index.js';

const HexaContext = createContext<HexaManifest>(DEFAULT_MANIFEST);

export type HexaIssue = LiveIssue;

export interface HexaProviderProps {
  readonly children: ReactNode;
  /**
   * Live brand updates are ON by default: the provider renders the baked-in brand first, then (in the browser) fetches the
   * brand's signed manifest from the evergreen hosted channel and applies it. Set `live={false}` for zero network requests
   * (strict CSP / offline / air-gapped). If no trusted keys are embedded in this package version, no request is made either way.
   */
  readonly live?: boolean;
  /** Advanced: use your own signed manifest (url + trusted Ed25519 keys) instead of the brand channel. Always wins over `live`. */
  readonly remote?: RemoteConfig;
  /** Called when a live update is rejected or produced warnings. Silent otherwise. */
  readonly onIssue?: (issue: HexaIssue) => void;
  /** Element that receives the CSS variables. Defaults to document.documentElement. */
  readonly target?: StyleTarget;
}

/**
 * Client component. Always renders with the baked-in manifest first, so server and
 * client markup are identical (no hydration mismatch), then optionally upgrades.
 */
export function HexaProvider({ children, live, remote, onIssue, target }: HexaProviderProps): ReactElement {
  const [manifest, setManifest] = useState<HexaManifest>(DEFAULT_MANIFEST);
  const onIssueRef = useRef(onIssue);
  onIssueRef.current = onIssue;

  // Stable identity for the effect dependency without forcing callers to memoise `remote`.
  const config = resolveRemote({ live, remote });
  const configKey = config ? JSON.stringify([config.url, config.keys, config.minRevision, config.timeoutMs, config.maxBytes]) : null;
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const options = configRef.current;
    if (!options) return undefined;
    const el: StyleTarget | undefined = target ?? (typeof document !== 'undefined' ? document.documentElement : undefined);
    const handle = startLive(options, { target: el, onManifest: setManifest, onIssue: (i) => onIssueRef.current?.(i) });
    return () => handle.stop();
  }, [configKey, target]);

  const value = useMemo(() => manifest, [manifest]);
  return <HexaContext.Provider value={value}>{children}</HexaContext.Provider>;
}

/** Returns the active manifest. Works without a provider (returns the baked-in brand). */
export function useHexaBrand(): HexaManifest {
  return useContext(HexaContext);
}
