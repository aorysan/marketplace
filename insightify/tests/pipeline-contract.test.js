const { describe, test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function read(rel) {
  const full = path.join(root, rel);
  assert.strictEqual(fs.existsSync(full), true, `${rel} must exist`);
  return fs.readFileSync(full, 'utf8');
}

describe('Pipeline contract (4-stage artifact chain)', () => {
  const orchestrator = read('skills/insightify/SKILL.md');
  const planner = read('skills/planner/SKILL.md');
  const writer = read('skills/writer/SKILL.md');
  const reviewer = read('skills/reviewer/SKILL.md');
  const builder = read('skills/builder/SKILL.md');

  test('orchestrator defines the four stages in flow order', () => {
    const order = ['Planner:', 'Writer:', 'Reviewer:', 'Builder:'];
    let last = -1;
    for (const stage of order) {
      const at = orchestrator.indexOf(stage);
      assert.notStrictEqual(at, -1, `orchestrator must define stage "${stage}"`);
      assert.ok(at > last, `stage "${stage}" must appear after the previous stage`);
      last = at;
    }
  });

  test('every artifact a stage consumes is produced by an earlier stage', () => {
    // [produced artifact, producing stage text, consuming stage text]
    const chain = [
      ['.insightify/plan.md', planner, writer],
      ['.insightify/knowledge/', planner, writer],
      ['docs/markdown/documentation.md', writer, reviewer],
      ['docs/final/final-documentation.md', reviewer, builder]
    ];

    for (const [artifact, producer, consumer] of chain) {
      assert.ok(producer.includes(artifact), `producing stage must declare ${artifact}`);
      assert.ok(
        consumer.includes(artifact),
        `consuming stage must declare reading ${artifact} (broken artifact chain)`
      );
    }
  });

  test('the review report is produced and archived, not orphaned', () => {
    assert.ok(reviewer.includes('.insightify/review/review-report.md'), 'reviewer must produce the review report');
    assert.ok(orchestrator.includes('.insightify/'), 'orchestrator must declare the workspace for intermediate artifacts');
    assert.ok(builder.includes('.insightify/review/'), 'builder must archive the review report into docs/review/');
  });

  test('the Reviewer reads the Writer output and the Builder reads the Reviewer output', () => {
    assert.ok(reviewer.includes('[OUT_DIR]/docs/markdown/documentation.md'), 'reviewer reads writer output');
    assert.ok(builder.includes('[OUT_DIR]/docs/final/final-documentation.md'), 'builder reads reviewer output');
  });

  test('builder assembles from the finalized document, NOT from raw knowledge categories', () => {
    // Regression pin: the orchestrator used to claim the Builder concatenates the
    // raw category files, contradicting the Builder skill and the code.
    assert.ok(
      !/concatenates exactly those category files/i.test(orchestrator),
      'orchestrator must not claim Builder concatenates raw knowledge categories'
    );
    assert.ok(
      builder.toLowerCase().includes('do not concatenate raw knowledge categories'),
      'builder must state it does not concatenate raw knowledge categories'
    );
    assert.ok(
      orchestrator.includes('docs/final/final-documentation.md'),
      'orchestrator must point Builder at the finalized document'
    );
  });

  test('both approval gates are enforced by the orchestrator (END TURN)', () => {
    // Planner gate.
    assert.ok(orchestrator.includes('do NOT start Stage 2 (Writer)'), 'Planner gate must block Stage 2');
    // Reviewer gate — this was missing before the 2026-09-29 fix.
    assert.ok(orchestrator.includes('Reviewer ends with'), 'orchestrator must surface the Reviewer gate');
    assert.ok(orchestrator.includes('do NOT start Stage 4 (Builder)'), 'Reviewer gate must block Stage 4');
    assert.ok(orchestrator.includes('END TURN'), 'gates must end the turn');
  });

  test('documented default paths match the builder code', () => {
    const buildHtml = read('skills/builder/templates/build-html.mjs');
    // The contract the docs promise, verified against the real implementation.
    assert.ok(buildHtml.includes('docs/final/final-documentation.md'), 'code must read the finalized document');
    assert.ok(buildHtml.includes('Product-Knowledge-Base.md'), 'code must write Product-Knowledge-Base.md');
    assert.ok(buildHtml.includes("'index.html'"), 'code must write index.html');
    assert.ok(buildHtml.includes('.insightify/knowledge'), 'code default kbDir must match the documented workspace');
  });

  test('manifest versions stay in sync', () => {
    const plugin = JSON.parse(read('.claude-plugin/plugin.json'));
    const pkg = JSON.parse(read('package.json'));
    assert.strictEqual(
      plugin.version,
      pkg.version,
      `.claude-plugin/plugin.json (${plugin.version}) and package.json (${pkg.version}) must agree`
    );
  });
});

describe('Documentation numeric claims match reality', () => {
  test('README check count matches scripts/verify-output.mjs', () => {
    const readme = read('README.md');
    // Only the count is asserted; the sentence around it is free to change.
    const claimed = readme.match(/passes all (\d+) checks/i);
    assert.ok(claimed, 'README.md must state how many checks a reference build passes');
    const actual = (read('scripts/verify-output.mjs').match(/\bcheck\(/g) || []).length;
    assert.strictEqual(
      Number(claimed[1]),
      actual,
      `README claims ${claimed[1]} checks but verify-output.mjs defines ${actual}`
    );
  });

  test('README does not pin a stale test count', () => {
    // Counts of test declarations drift on every refactor; the docs must not
    // hardcode them (this is exactly the drift class fixed in AGENTS.md).
    for (const rel of ['README.md', 'AGENTS.md', 'CLAUDE.md']) {
      const doc = read(rel);
      assert.ok(
        !/~?\d+\s+tests?\b/i.test(doc),
        `${rel} hardcodes a test count; describe the suite instead of numbering it`
      );
    }
  });
});
