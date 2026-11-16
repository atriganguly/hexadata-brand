import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
/** Component CSS without comments and whitespace (and so independent of line endings): only real style changes alter the fingerprint. */
const styles = () =>
  ['base.css', 'components.css']
    .map((f) =>
      readFileSync(join(root, 'src/css', f), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .join('\n');

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
    components: styles(),
  };
  return createHash('sha256').update(JSON.stringify(material)).digest('hex').slice(0, 12);
}
