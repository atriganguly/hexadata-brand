import { createHash } from 'node:crypto';

/** Short fingerprint of everything visual in the brand. The PDF carries it; `npm run pdf:check` fails when the brand changed but the PDF did not. */
export function tokenHash(core) {
  const material = {
    palette: core.DEFAULT_PALETTE,
    semantic: core.SEMANTIC,
    taglines: core.DEFAULT_TAGLINES,
    descriptor: core.BRAND_DESCRIPTOR,
    fonts: core.FONTS,
    foundations: core.FOUNDATIONS,
    logo: Object.fromEntries(core.LOGO_VARIANTS.map((v) => [v.id, v.sha256])),
  };
  return createHash('sha256').update(JSON.stringify(material)).digest('hex').slice(0, 12);
}
