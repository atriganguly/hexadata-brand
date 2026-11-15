/* GENERATED FILE: DO NOT EDIT. Source: brand/ (run `npm run generate`). */
import { BRAND_ORIGIN } from './logo.js';
import type { TrustedKey } from './remote.js';

/** Public keys the signed live-update manifest must verify against (brand/keys.json). Empty = live updates are off. */
export const TRUSTED_KEYS: readonly TrustedKey[] = [

];

/** The signed manifest published by the evergreen hosted channel. */
export const DEFAULT_MANIFEST_URL = `${BRAND_ORIGIN}/v2/manifest.json`;
