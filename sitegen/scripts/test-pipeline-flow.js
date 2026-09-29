// scripts/test-pipeline-flow.js — Pipeline flow contract test.
//
// The sitegen "pipeline" is AI instructions (SKILL.md/AGENTS.md), not runtime
// code, so it cannot be executed end-to-end. What CAN be verified is that the
// flow is *internally consistent*: every artifact a step consumes is produced by
// an earlier step, every hard gate ends the turn, every invoked sub-skill really
// exists with its local constitution, and the documented counts/versions agree.
//
// This is the regression net for the exact class of bug that shipped before:
// a step listing the "13 skills" that don't all exist, a gate that doesn't stop,
// or a cross-reference to a file that was renamed.
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const failures = [];
function fail(msg) { failures.push(msg); }

function read(rel) {
  const full = path.join(rootDir, rel);
  if (!fs.existsSync(full)) { fail(`missing file: ${rel}`); return ''; }
  return fs.readFileSync(full, 'utf-8');
}

const skillMd = read('SKILL.md');
const readme = read('README.md');
const masterAgents = read('AGENTS.md');

// ---------------------------------------------------------------------------
// 1. Artifact chain continuity (parsed from the dependency-graph table)
// ---------------------------------------------------------------------------
// Landing artifacts are written as `landings/<brand>/planning/PLAN.md` while
// some cells shorten them to `PLAN.md`; normalize away the brand prefix and any
// trailing slash, and fall back to basename matching for file artifacts.
function normalize(artifact) {
  return artifact
    .replace(/^landings\/<brand>\//, '')
    .replace(/\/+$/, '')
    .trim();
}
function basename(artifact) {
  const parts = normalize(artifact).split('/');
  return parts[parts.length - 1];
}

const tableRows = skillMd
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => /^\|\s*\d+\./.test(line))
  .map(line => {
    const cells = line.split('|').map(c => c.trim());
    // cells[0] === '' (leading pipe), cells[1] = step, cells[2] = inputs, cells[3] = outputs
    const step = parseInt(cells[1].match(/^(\d+)\./)[1], 10);
    const backticks = cell => (cell.match(/`([^`]+)`/g) || []).map(t => t.slice(1, -1));
    return { step, inputs: backticks(cells[2] || ''), outputs: backticks(cells[3] || '') };
  });

if (tableRows.length < 14) {
  fail(`dependency-graph table parsed only ${tableRows.length} steps (expected 14: step 0..13)`);
}

// Record the EARLIEST step that produces each artifact. Several steps mention
// the same path later (e.g. step 13 "stops the dev server in .../web/"), and
// those mentions must not be mistaken for the producer.
const produce = (map, key, step) => {
  if (!map.has(key) || step < map.get(key)) map.set(key, step);
};
const producedBy = new Map();
const producedBasename = new Map();
for (const row of tableRows) {
  for (const out of row.outputs) {
    const norm = normalize(out);
    if (norm) produce(producedBy, norm, row.step);
    produce(producedBasename, basename(out), row.step);
  }
}

for (const row of tableRows) {
  for (const input of row.inputs) {
    const norm = normalize(input);
    const byPath = producedBy.has(norm) ? producedBy.get(norm) : undefined;
    const byBase = producedBasename.has(basename(input)) ? producedBasename.get(basename(input)) : undefined;
    const producer = byPath !== undefined ? byPath : byBase;

    if (producer === undefined) {
      fail(`step ${row.step} consumes \`${input}\` but no earlier step produces it (broken artifact chain)`);
    } else if (producer >= row.step) {
      fail(`step ${row.step} consumes \`${input}\` produced by step ${producer} (must be produced by an EARLIER step)`);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Hard gates: present, ordered, and each ends the turn
// ---------------------------------------------------------------------------
const lines = skillMd.split(/\r?\n/);

// Group lines into step blocks so a gate declared in a step heading is checked
// against the whole step body (the heading alone never contains "END TURN").
const blocks = [];
for (let i = 0; i < lines.length; i++) {
  const heading = lines[i].match(/^(\d+)\.\s+\*\*/);
  if (heading) {
    blocks.push({ step: parseInt(heading[1], 10), line: i + 1, lines: [lines[i]] });
  } else if (blocks.length) {
    blocks[blocks.length - 1].lines.push(lines[i]);
  }
}

if (blocks.length < 14) fail(`SKILL.md parsed only ${blocks.length} step blocks (expected 14: step 0..13)`);

// A step that declares a gate must end the turn somewhere in its body, unless
// the mention is prose that merely *refers* to a gate (escalation instructions).
const REFERENCE_ONLY = /eskalasi|memicu gerbang/i;
const gateSteps = [];
for (const block of blocks) {
  const body = block.lines.join('\n');
  if (!/\[(HARD|CRITICAL) STOP/.test(body)) continue;
  gateSteps.push(block.step);
  const enforced = /END TURN/.test(body) || REFERENCE_ONLY.test(body);
  if (!enforced) fail(`step ${block.step} declares a hard gate but never ENDs TURN`);
}

if (gateSteps.length === 0) fail('no [HARD STOP]/[CRITICAL STOP] gate found in SKILL.md');

// Gates must appear in non-decreasing step order.
for (let i = 1; i < gateSteps.length; i++) {
  if (gateSteps[i] < gateSteps[i - 1]) {
    fail(`hard gates out of order: step ${gateSteps[i - 1]} then step ${gateSteps[i]}`);
  }
}

// ---------------------------------------------------------------------------
// 3. Sub-skill closure: every invoked sitegen-<x> resolves to a real skill + constitution
// ---------------------------------------------------------------------------
const invoked = [...new Set((skillMd.match(/sitegen-[a-z0-9-]+/g) || []))];
if (invoked.length === 0) fail('SKILL.md invokes no sitegen-<subskill> at all');

for (const token of invoked) {
  const skillName = token.replace(/^sitegen-/, '');
  const skillFile = path.join('skills', skillName, 'SKILL.md');
  const agentsFile = path.join('skills', skillName, 'AGENTS.md');
  if (!fs.existsSync(path.join(rootDir, skillFile))) {
    fail(`SKILL.md invokes \`${token}\` but ${skillFile} does not exist`);
  }
  if (!fs.existsSync(path.join(rootDir, agentsFile))) {
    fail(`sub-skill \`${skillName}\` has no local constitution (${agentsFile})`);
  }
}

// The master orchestrator must carry the Pasal II.2 binding so delegated agents
// are told to obey their local AGENTS.md (constitution requirement).
if (!/PASAL II\.2/i.test(skillMd) || !/AGENTS\.md/.test(skillMd.split(/PASAL II\.2/i)[1] || '')) {
  fail('SKILL.md preamble is missing the Pasal II.2 requirement (delegations must bind the sub-skill AGENTS.md)');
}
if (!/PASAL II/i.test(masterAgents)) {
  fail('master AGENTS.md no longer declares PASAL II');
}

// ---------------------------------------------------------------------------
// 4. Documented skill count agrees with the skills/ directory
// ---------------------------------------------------------------------------
const skillDirs = fs
  .readdirSync(path.join(rootDir, 'skills'), { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .filter(name => fs.existsSync(path.join(rootDir, 'skills', name, 'SKILL.md')));

const documentedMatch = readme.match(/(\d+)\s+Skill/);
if (!documentedMatch) {
  fail('README.md does not declare a skill count ("N Skill")');
} else {
  // README counts the master orchestrator too (N sub-skills + 1 master).
  const documented = parseInt(documentedMatch[1], 10);
  if (documented !== skillDirs.length + 1) {
    fail(`README declares ${documented} skills but skills/ contains ${skillDirs.length} sub-skills (+1 master)`);
  }
}

// ---------------------------------------------------------------------------
// 5. Version sync between manifests
// ---------------------------------------------------------------------------
const pluginJson = JSON.parse(read(path.join('.claude-plugin', 'plugin.json')) || '{}');
const pkgJson = JSON.parse(read('package.json') || '{}');
if (pluginJson.version !== pkgJson.version) {
  fail(`version mismatch: .claude-plugin/plugin.json=${pluginJson.version} package.json=${pkgJson.version}`);
}
if (pluginJson.name !== 'sitegen') {
  fail(`plugin.json name must be "sitegen", got ${JSON.stringify(pluginJson.name)}`);
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
  `PASS: sitegen pipeline flow — ${tableRows.length} steps chained, ` +
  `${gateSteps.length} gated steps end-turn/ordered, ${invoked.length} sub-skills resolved, ` +
  `${skillDirs.length} sub-skills + master, version ${pluginJson.version}`
);
process.exit(0);
