import type { Ctx, Tokens } from '../types.ts';

export function emit(t: Tokens, { write, HEADER }: Ctx): void {
  const keys = t.trustedKeys.map((k) => `  { kid: ${JSON.stringify(k.kid)}, publicKey: ${JSON.stringify(k.publicKey)} },`).join('\n');
  write(
    'src/core/trust.ts',
    `/* ${HEADER} */
import { BRAND_ORIGIN } from './logo.js';
import type { TrustedKey } from './remote.js';

/** Public keys the signed live-update manifest must verify against (brand/keys.json). Empty = live updates are off. */
export const TRUSTED_KEYS: readonly TrustedKey[] = [
${keys}
];

/** The signed manifest published by the evergreen hosted channel. */
export const DEFAULT_MANIFEST_URL = \`\${BRAND_ORIGIN}/v2/manifest.json\`;
`,
  );
}
