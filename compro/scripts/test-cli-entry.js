// Regression guard for the circular-dependency class of bug that the rest of the
// suite structurally cannot see.
//
// build-deck.js and themes/modern.js require each other. Every other test does
// `require('../skills/builder/scripts/build-deck')` and then calls runMain(), so
// build-deck's `module.exports` is already complete when runMain starts. The real
// CLI entry (`node skills/builder/scripts/build-deck.js`, the command the SKILL.md
// files document) calls runMain() from inside the module body instead, so any
// `require('./themes/modern')` reached in runMain's synchronous prefix used to see
// an empty exports object. Trigger: a slide with NO image directive, because
// resolveSlideSlot only reaches its lazy require in that fallback branch. The whole
// build died with "TypeError: resolveSlideSlot is not a function".
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const buildDeck = path.join(__dirname, '..', 'skills', 'builder', 'scripts', 'build-deck.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'compro-cli-'));
const slug = 'cli';
const drafts = path.join(tmp, 'compros', slug, 'drafts');
fs.mkdirSync(drafts, { recursive: true });

// Slide 1 deliberately has NO directive (this is what triggered the crash),
// slide 2 has one so both the fallback and the directive path are exercised.
fs.writeFileSync(path.join(drafts, '02-final.md'), [
  '# PT Tanpa Directive',
  '',
  'Cover tanpa arahan gambar sama sekali.',
  '',
  '# Masalah Nyata',
  '<!-- image: problem -->',
  'Dua masalah nyata.',
  '',
  '- **Biaya naik** — tanpa kontrol',
  '- **Audit gagal** — sekali per kuartal',
  ''
].join('\n'), 'utf8');

const result = spawnSync(process.execPath, [buildDeck, `--name=${slug}`, `--root=${tmp}`], {
  cwd: tmp,
  encoding: 'utf8',
  env: { ...process.env, COMPRO_OFFLINE: '1' },
  timeout: 120000
});

const output = `${result.stdout || ''}${result.stderr || ''}`;
const fail = msg => {
  console.error('FAIL: ' + msg);
  console.error(output.split('\n').slice(-15).join('\n'));
  process.exit(1);
};

if (result.status !== 0) fail(`CLI build exited with status ${result.status}`);
if (/is not a function/.test(output)) fail('CLI build hit the circular-require crash (is not a function)');
if (!/slides compiled/.test(output)) fail('CLI build did not report a completed slide count');

const htmlPath = path.join(tmp, 'compros', slug, 'index.html');
if (!fs.existsSync(htmlPath)) fail('CLI build produced no index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const articles = (html.match(/<article[\s>]/g) || []).length;
if (articles !== 2) fail(`expected 2 rendered slides, got ${articles}`);
for (const cls of ['slide-cover', 'slide-problem']) {
  if (!html.includes(cls)) fail(`CLI deck is missing ${cls}`);
}

console.log('PASS: build-deck CLI entry renders a deck with a directive-less slide');
process.exit(0);
