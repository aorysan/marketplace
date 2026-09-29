// scripts/test-doc-drift.js — Documentation anti-drift test.
//
// `test-cinematic-classifier.js` guarantees the *code* vocabularies agree
// (themes/modern.js ↔ manifest.json ↔ imageFetcher.SLOT_MAP). It cannot see the
// markdown, which is exactly how the docs drifted to "7 archetypes" while the
// SSOT shipped 9. This test closes that gap: every human-facing document that
// enumerates the archetype vocabulary must list all of them, and no document may
// repeat the stale count.
const fs = require('fs');
const path = require('path');
const { CINEMATIC_ARCHETYPES } = require('../skills/builder/scripts/themes/modern');

function assert(cond, msg) { if (!cond) { console.error('FAIL: ' + msg); process.exit(1); } }

const rootDir = path.join(__dirname, '..');

// Documents that enumerate the archetype vocabulary for a human/agent reader.
const DOCS = [
  'README.md',
  'skills/compro/SKILL.md',
  'skills/writer/SKILL.md',
  'skills/builder/SKILL.md',
  'skills/builder/references/visual-hierarchy.md',
  'skills/builder/templates/modern/README.md'
];

// Stale-count phrasings that must never come back.
const STALE_COUNT_RES = [
  /\b7 core slide archetypes\b/i,
  /\b7 layout archetypes\b/i,
  /\b7 slide archetypes\b/i,
  /\b7 arketipe\b/i,
  /\b7 archetypes\b/i,
  /\(7 core\)/i,
  /\bexactly \*\*7 archetypes\*\*/i,
  /\b7 arketipe renderers\b/i
];

assert(CINEMATIC_ARCHETYPES.length === 9, `SSOT must expose 9 archetypes, got ${CINEMATIC_ARCHETYPES.length}`);

for (const rel of DOCS) {
  const full = path.join(rootDir, rel);
  assert(fs.existsSync(full), `doc missing: ${rel}`);
  const text = fs.readFileSync(full, 'utf-8');

  for (const archetype of CINEMATIC_ARCHETYPES) {
    assert(
      text.includes('`' + archetype + '`'),
      `${rel} does not enumerate archetype \`${archetype}\` (docs drifted from CINEMATIC_ARCHETYPES)`
    );
  }

  for (const re of STALE_COUNT_RES) {
    const m = text.match(re);
    assert(!m, `${rel} still carries the stale archetype count "${m && m[0]}" — SSOT has 9`);
  }
}

// ---------------------------------------------------------------------------
// Verification-suite drift: the runner, the scripts on disk, and the README
// count must all agree. A test file that exists but is never registered is dead
// weight; a count in the README that drifts is the same bug class as the
// archetype count above.
// ---------------------------------------------------------------------------
const scriptsDir = path.join(rootDir, 'scripts');
const runnerPath = path.join(scriptsDir, 'test-all.js');
assert(fs.existsSync(runnerPath), 'scripts/test-all.js must exist');
const runner = fs.readFileSync(runnerPath, 'utf-8');
const registered = (runner.match(/'([a-z0-9-]+\.js)'/g) || []).map(s => s.replace(/'/g, ''));

const onDisk = fs
  .readdirSync(scriptsDir)
  .filter(f => /^test-.*\.js$/.test(f) && f !== 'test-all.js');

for (const file of onDisk) {
  assert(
    registered.includes(file),
    `scripts/${file} exists but is not registered in test-all.js (dead test: it never runs)`
  );
}
for (const file of registered) {
  assert(
    fs.existsSync(path.join(scriptsDir, file)),
    `test-all.js registers scripts/${file} which does not exist`
  );
}

const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf-8');
const claimed = readme.match(/seluruh\s+(\d+)\s+script/i);
assert(claimed, 'README.md must state how many scripts the suite runs');
if (claimed) {
  assert(
    Number(claimed[1]) === registered.length,
    `README claims the suite runs ${claimed[1]} scripts but test-all.js registers ${registered.length}`
  );
}

console.log('PASS: all ' + DOCS.length + ' docs enumerate the 9 CINEMATIC_ARCHETYPES and carry no stale count');
console.log('PASS: verification suite consistent — ' + registered.length + ' scripts registered, all exist, README count matches');
process.exit(0);
