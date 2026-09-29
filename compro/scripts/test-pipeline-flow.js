// scripts/test-pipeline-flow.js — Pipeline flow contract test.
//
// The compro pipeline is AI instructions (SKILL.md), so it cannot be executed
// end-to-end. `test-modern-golden.js` and `test-density-e2e.js` already execute
// the builder stage for real; this test covers the *flow* around it: phase order,
// the artifact chain writer -> reviewer -> builder -> publisher, that the gates
// actually stop the run, and that every invoked sub-skill exists.
//
// It also pins the fixes for the two flow bugs found in the 2026-09-29 audit:
// resuming from an existing index.html must not skip the blocking Visual
// Self-Check, and review iterations must not re-run the approved Phase 0.5
// research.
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const failures = [];
function fail(msg) { failures.push(msg); }
function assert(cond, msg) { if (!cond) fail(msg); }

const skillPath = path.join(rootDir, 'skills', 'compro', 'SKILL.md');
if (!fs.existsSync(skillPath)) {
  console.error('FAIL: skills/compro/SKILL.md does not exist');
  process.exit(1);
}
const skill = fs.readFileSync(skillPath, 'utf-8');

// ---------------------------------------------------------------------------
// 1. Phase order — anchored on the numbered flow items so incidental mentions
//    of "Gate 0"/"Phase 2" elsewhere in the doc cannot satisfy the check.
// ---------------------------------------------------------------------------
const FLOW = [
  { label: 'Gate -1', anchor: '0. **Gate -1' },
  { label: 'Gate 0', anchor: '1. **Gate 0' },
  { label: 'Phase 1', anchor: '2. **Phase 1' },
  { label: 'Phase 2', anchor: '3. **Phase 2' },
  { label: 'Phase 3', anchor: '4. **Phase 3' },
  { label: 'Phase 3b', anchor: '5. **Phase 3b' },
  { label: 'Phase 4', anchor: '6. **Phase 4' },
  { label: 'Gate 5', anchor: '7. **Gate 5' },
  { label: 'Phase 6', anchor: '8. **Phase 6' }
];

const flowOffsets = [];
let lastAt = -1;
for (const stage of FLOW) {
  const at = skill.indexOf(stage.anchor);
  if (at === -1) {
    fail(`orchestrator SKILL.md is missing flow stage "${stage.label}"`);
    flowOffsets.push(-1);
    continue;
  }
  if (at <= lastAt) fail(`flow stage "${stage.label}" is out of order`);
  lastAt = at;
  flowOffsets.push(at);
}

// Block = the stage's text, bounded by the next stage anchor.
function stageBlock(index) {
  const start = flowOffsets[index];
  if (start === -1) return '';
  const rest = skill.slice(start);
  const next = rest.slice(1).search(/\n\d+\.\s+\*\*(Gate|Phase)/);
  return next === -1 ? rest : rest.slice(0, next + 1);
}
const blockOf = label => stageBlock(FLOW.findIndex(s => s.label === label));

// ---------------------------------------------------------------------------
// 2. Artifact chain: every consumed artifact is produced by an earlier phase
// ---------------------------------------------------------------------------
const skillText = name => fs.readFileSync(path.join(rootDir, 'skills', name, 'SKILL.md'), 'utf-8');

// The orchestrator phases are coarse; the artifact I/O contract lives in each
// sub-skill. A link is valid when the producer phase AND the producing sub-skill
// declare the artifact, and the consuming sub-skill declares reading it.
const CHAIN = [
  { name: 'writer -> reviewer', artifact: 'compros/<slug>/drafts/01-draft.md', phase: 'Phase 1', from: 'writer', to: 'reviewer' },
  { name: 'reviewer -> builder', artifact: 'compros/<slug>/drafts/02-final.md', phase: 'Phase 2', from: 'reviewer', to: 'builder' },
  { name: 'builder -> publisher', artifact: 'compros/<slug>/index.html', phase: 'Phase 3', from: 'builder', to: 'publisher' }
];

for (const link of CHAIN) {
  assert(blockOf(link.phase).includes(link.artifact),
    `${link.phase} does not declare producing \`${link.artifact}\` (${link.name} chain broken)`);
  assert(skillText(link.from).includes(link.artifact),
    `skills/${link.from} does not declare producing \`${link.artifact}\` (${link.name} chain broken)`);
  assert(skillText(link.to).includes(link.artifact),
    `skills/${link.to} does not declare consuming \`${link.artifact}\` (${link.name} chain broken)`);
}

// ---------------------------------------------------------------------------
// 3. Gates must actually stop the run
// ---------------------------------------------------------------------------
assert(/HARD GATE/.test(blockOf('Gate -1')), 'Gate -1 must declare a HARD GATE');
assert(/DILARANG membaca/i.test(blockOf('Gate -1')), 'Gate -1 must forbid reading files before confirmation');
assert(/\*\*`APPROVED`\*\*/.test(blockOf('Phase 2')), 'Phase 2 must require an APPROVED status before building');
assert(/blocking/i.test(blockOf('Phase 3b')), 'Phase 3b (Visual Self-Check) must be declared blocking');
assert(/Tunggu respon pengguna/i.test(blockOf('Gate 5')), 'Gate 5 must wait for the user response');

// ---------------------------------------------------------------------------
// 4. Audit-fix pins (flow regressions that shipped before)
// ---------------------------------------------------------------------------
// Resume must not jump past the blocking visual self-check.
assert(
  /Phase 3b \(Visual Self-Check\)/.test(skill),
  'resume table must resume at Phase 3b, not jump past the blocking visual self-check'
);
// Review iterations must not repeat the already-approved Phase 0.5 research.
assert(
  /melewati Phase 0\.5/i.test(skill),
  'Phase 2 QA loop must instruct revision passes to skip the approved Phase 0.5 research'
);
// No hardcoded, version-pinned plugins/cache path.
assert(
  !/plugins\/cache\/[^\s`]*\/compro\/\d/.test(skill),
  'orchestrator must not hardcode a version-pinned plugins/cache path'
);

// ---------------------------------------------------------------------------
// 5. Sub-skill closure
// ---------------------------------------------------------------------------
for (const name of ['compro', 'writer', 'reviewer', 'builder', 'publisher']) {
  const rel = path.join('skills', name, 'SKILL.md');
  assert(fs.existsSync(path.join(rootDir, rel)), `invoked sub-skill missing: ${rel}`);
}

// ---------------------------------------------------------------------------
// 6. Manifest version sync
// ---------------------------------------------------------------------------
const pluginManifests = [
  ['.claude-plugin/plugin.json', path.join(rootDir, '.claude-plugin', 'plugin.json')],
  ['.codex-plugin/plugin.json', path.join(rootDir, '.codex-plugin', 'plugin.json')]
].map(([rel, full]) => [rel, JSON.parse(fs.readFileSync(full, 'utf-8'))]);
pluginManifests.push(['package.json', JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))]);

for (const [rel, manifest] of pluginManifests) {
  if (!manifest.version) fail(`${rel} has no version`);
}
const versions = [...new Set(pluginManifests.map(([, m]) => m.version))];
assert(versions.length === 1, `manifest versions disagree: ${pluginManifests.map(([r, m]) => `${r}=${m.version}`).join(', ')}`);

for (const rel of ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json']) {
  const manifest = pluginManifests.find(([r]) => r === rel)[1];
  assert(manifest.name === 'compro', `${rel} must declare name "compro", got ${JSON.stringify(manifest.name)}`);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
if (failures.length) {
  console.error('FAIL: pipeline flow contract violated:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}

console.log(
  `PASS: compro pipeline flow — ${FLOW.length} stages ordered, ` +
  `${CHAIN.length} artifact links chained, gates stop the run, ` +
  `5 sub-skills resolved, version ${versions[0]}`
);
process.exit(0);
