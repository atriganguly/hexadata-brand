// Versioning guard: MAJOR.VISUAL.CHORE.
//   MAJOR  breaking change of the system.
//   VISUAL a visual update of the brand system (colour, type, logo, shape, components, Brand Kit). Resets CHORE to 0.
//   CHORE  everything technical that does not change what the brand looks like (tooling, CI, docs, dependencies, fixes).
// The Brand Kit PDF fingerprints the visual brand (`kit:`, `revision:`, `tokens:`), so the rule is checked mechanically against the
// last released tag: a changed fingerprint needs a new VISUAL number, an unchanged one forbids it.
//   node scripts/check-version.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const git = (...args) => execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024 });
const parse = (v) => {
  const m = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(v);
  return m ? m.slice(1).map(Number) : null;
};
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
const keywords = async (bytes) =>
  Object.fromEntries(
    ((await PDFDocument.load(bytes)).getKeywords() ?? '')
      .split(/[\s,;]+/)
      .filter(Boolean)
      .map((kv) => kv.split(/:(.*)/s).slice(0, 2)),
  );

const problems = [];
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const cur = parse(pkg.version);
if (!cur) throw new Error(`package.json version "${pkg.version}" is not MAJOR.VISUAL.CHORE`);

const cff = /^version:\s*(\S+)/m.exec(readFileSync(join(root, 'CITATION.cff'), 'utf8'))?.[1];
if (cff !== pkg.version) problems.push(`CITATION.cff version ${cff} must equal package.json ${pkg.version}`);

const curPdf = join(root, 'brand/kit', `HexaData-Brand-Kit-v${cur[0]}.${cur[1]}.pdf`);
if (!existsSync(curPdf)) problems.push(`brand/kit/HexaData-Brand-Kit-v${cur[0]}.${cur[1]}.pdf is missing (run npm run build:pdf)`);

let tags = [];
try {
  tags = git('tag', '--list', 'v*')
    .toString()
    .split(/\s+/)
    .filter((t) => parse(t))
    .sort((a, b) => cmp(parse(a), parse(b)));
} catch {
  /* not a git checkout */
}
const prevTag = tags.filter((t) => cmp(parse(t), cur) <= 0).pop();

if (!prevTag) {
  console.log('version: no earlier release tag found (shallow clone?): skipping the comparison with the last release');
} else if (existsSync(curPdf)) {
  const prev = parse(prevTag);
  if (prev[0] === cur[0]) {
    let before;
    try {
      before = await keywords(git('show', `${prevTag}:brand/kit/HexaData-Brand-Kit-v${prev[0]}.${prev[1]}.pdf`));
    } catch (e) {
      problems.push(`cannot read the Brand Kit PDF of ${prevTag}: ${e.message.split('\n')[0]}`);
    }
    if (before) {
      const after = await keywords(readFileSync(curPdf));
      const visual = before.tokens !== after.tokens || before.revision !== after.revision;
      if (visual) {
        if (!(cur[1] > prev[1] && cur[2] === 0))
          problems.push(
            `the visual brand changed since ${prevTag}: the version must be ${cur[0]}.${prev[1] + 1}.0 or higher in the middle number, with the last number 0 (is ${pkg.version})`,
          );
      } else if (cur[1] !== prev[1]) {
        problems.push(
          `the visual brand is unchanged since ${prevTag}: the middle number is reserved for visual updates and must stay ${prev[1]} (is ${cur[1]}); use the last number for chores`,
        );
      } else if (cur[2] < prev[2]) {
        problems.push(`the last number went backwards (${prevTag} -> ${pkg.version})`);
      }
    }
  }
}

if (problems.length) {
  console.error(`version: ${problems.length} problem(s)\n - ${problems.join('\n - ')}`);
  process.exit(1);
}
console.log(`version: ok (${pkg.version}${prevTag ? `, last release ${prevTag}` : ''})`);
