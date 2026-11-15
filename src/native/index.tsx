import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react';
import {
  DEFAULT_MANIFEST,
  FOUNDATIONS,
  SEMANTIC,
  startLive,
  type HexaManifest,
  type LiveIssue,
  type PaletteKey,
  type RemoteConfig,
  type SemanticRole,
  type ThemeMode,
} from '../core/index.js';

const HexaNativeContext = createContext<HexaManifest>(DEFAULT_MANIFEST);

export type HexaNativeIssue = LiveIssue;

export interface HexaNativeProviderProps {
  readonly children: ReactNode;
  /**
   * Opt-in signed runtime updates (OFF by default on native). React Native (Hermes) has no WebCrypto Ed25519, so you
   * MUST supply `verify` (e.g. backed by @noble/ed25519 or react-native-quick-crypto) and the trusted keys
   * (`TRUSTED_KEYS`, `DEFAULT_MANIFEST_URL` are exported from the core entry); without a verifier a remote update is
   * rejected with reason 'no-verifier' and the baked-in brand stays active. Nothing is persisted to device storage.
   */
  readonly remote?: RemoteConfig;
  readonly onIssue?: (issue: HexaNativeIssue) => void;
}

export function HexaNativeProvider({ children, remote, onIssue }: HexaNativeProviderProps): ReactElement {
  const [manifest, setManifest] = useState<HexaManifest>(DEFAULT_MANIFEST);
  const onIssueRef = useRef(onIssue);
  onIssueRef.current = onIssue;
  const remoteRef = useRef(remote);
  remoteRef.current = remote;
  const remoteKey = remote ? JSON.stringify([remote.url, remote.keys, remote.minRevision, remote.timeoutMs, remote.maxBytes]) : null;

  useEffect(() => {
    const handle = startLive(remoteRef.current, { onManifest: setManifest, onIssue: (i) => onIssueRef.current?.(i) });
    return () => handle.stop();
  }, [remoteKey]);

  const value = useMemo(() => manifest, [manifest]);
  return <HexaNativeContext.Provider value={value}>{children}</HexaNativeContext.Provider>;
}

export function useHexaNativeManifest(): HexaManifest {
  return useContext(HexaNativeContext);
}

export interface HexaNativeTheme {
  readonly palette: Readonly<Record<PaletteKey, string>>;
  readonly taglines: HexaManifest['tokens']['taglines'];
  /** Semantic colours already resolved for the requested mode. */
  readonly colors: Readonly<Record<SemanticRole, string>>;
  readonly fonts: typeof NATIVE_FONTS;
  /** Foundation scales in dp (rem x 16). Proposed values; see docs/FOUNDATIONS-PROPOSAL.md. */
  readonly space: Readonly<Record<string, number>>;
  readonly radius: Readonly<Record<string, number>>;
  readonly fontSize: Readonly<Record<string, number>>;
  readonly duration: Readonly<Record<string, number>>;
}

/** '1.5rem' -> 24, '9999px' -> 9999, '120ms' -> 120, '0' -> 0. */
export function toNumber(css: string): number {
  const n = parseFloat(css);
  return css.endsWith('rem') ? n * 16 : n;
}
const scale = (g: Readonly<Record<string, string>>): Record<string, number> =>
  Object.fromEntries(Object.entries(g).map(([k, v]) => [k, toNumber(v)]));

/** PostScript-style family names. Bundle matching static TTFs (see README → React Native fonts). */
export const NATIVE_FONTS = {
  display: { regular: 'SpaceGrotesk-Regular', medium: 'SpaceGrotesk-Medium', semibold: 'SpaceGrotesk-SemiBold', bold: 'SpaceGrotesk-Bold' },
  body: { regular: 'InterTight-Regular', medium: 'InterTight-Medium', semibold: 'InterTight-SemiBold', bold: 'InterTight-Bold' },
  mono: {
    regular: 'JetBrainsMono-Regular',
    medium: 'JetBrainsMono-Medium',
    semibold: 'JetBrainsMono-SemiBold',
    bold: 'JetBrainsMono-Bold',
  },
} as const;

/** Pure helper (also usable outside React): resolve the theme for a manifest + colour scheme. */
export function resolveNativeTheme(manifest: HexaManifest, mode: ThemeMode): HexaNativeTheme {
  const roles = SEMANTIC[mode];
  const colors = Object.fromEntries(
    (Object.keys(roles) as SemanticRole[]).map((role) => [role, manifest.tokens.palette[roles[role]]]),
  ) as Record<SemanticRole, string>;
  return {
    palette: manifest.tokens.palette,
    taglines: manifest.tokens.taglines,
    colors,
    fonts: NATIVE_FONTS,
    space: scale(FOUNDATIONS.space),
    radius: scale(FOUNDATIONS.radius),
    fontSize: scale(FOUNDATIONS.fontSize),
    duration: scale(FOUNDATIONS.duration),
  };
}

/** Hook: `const theme = useHexaNativeTheme(useColorScheme() === 'dark' ? 'dark' : 'light')`. */
export function useHexaNativeTheme(mode: ThemeMode = 'light'): HexaNativeTheme {
  const manifest = useHexaNativeManifest();
  return useMemo(() => resolveNativeTheme(manifest, mode), [manifest, mode]);
}
