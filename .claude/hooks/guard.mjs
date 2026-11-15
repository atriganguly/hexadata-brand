// PreToolUse guard for Claude Code (and anything that honours the same hook contract): blocks edits that would break the brand's safety rules.
// Exit code 2 = block, with the reason on stderr. Set HEXA_ALLOW_PROTECTED=1 only when the brand owner explicitly asked for the change.
import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

let input = '';
for await (const chunk of process.stdin) input += chunk;
let event;
try {
  event = JSON.parse(input);
} catch {
  process.exit(0); // not our contract: never block on parse problems
}
const target = event?.tool_input?.file_path ?? event?.tool_input?.notebook_path;
if (typeof target !== 'string' || process.env.HEXA_ALLOW_PROTECTED === '1') process.exit(0);

const root = resolve(process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
const abs = resolve(root, target);
const rel = relative(root, abs).split('\\').join('/');
const block = (why) => {
  console.error(
    `BLOCKED by .claude/hooks/guard.mjs: ${rel}\n${why}\nSee AGENTS.md. If the brand owner explicitly asked for this change, set HEXA_ALLOW_PROTECTED=1 for that one edit.`,
  );
  process.exit(2);
};

if (/\.(jwk|pem|key)$/i.test(rel) || rel.includes('.hexadata-brand-secrets'))
  block('Signing keys and secrets are never read, written or edited by agents.');
if (['LICENSE', 'BRAND-LICENSE.md', 'NOTICE', 'brand/keys.json'].includes(rel))
  block("Licensing files and the trusted-key list change only with the brand owner's approval.");
if (/^(dist|channel-out|site-out|node_modules)\//.test(rel)) block('Build output: change the source and rebuild.');
if (/^brand\/(logo\/source|fonts\/ttf)\//.test(rel) || /^brand\/kit\/.*\.pdf$/i.test(rel))
  block('Official masters (logos, fonts, Brand Kit PDFs) are replaced only by the brand owner, then re-measured with the logo/font tools.');
if (existsSync(abs)) {
  const head = readFileSync(abs, 'utf8').slice(0, 600);
  if (head.includes('GENERATED FILE'))
    block('This file is generated. Edit brand/ or the emitter in scripts/generate/, then run `npm run generate`.');
}
process.exit(0);
