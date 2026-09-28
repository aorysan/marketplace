const { describe, test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Orchestrator Skill', () => {
  test('insightify.md exists and contains pipeline stages', () => {
    const orchestratorPath = path.join(__dirname, '../skills/insightify/SKILL.md');
    assert.strictEqual(fs.existsSync(orchestratorPath), true, 'skills/insightify/SKILL.md must exist');

    const content = fs.readFileSync(orchestratorPath, 'utf8');
    assert.strictEqual(content.includes('name: insightify'), true);
    assert.strictEqual(content.includes('Planner'), true);
    assert.strictEqual(content.includes('Writer'), true);
    assert.strictEqual(content.includes('Reviewer'), true);
    assert.strictEqual(content.includes('Builder'), true);
    assert.strictEqual(content.includes('.insightify/'), true);
  });

  test('insightify.md gates Stage 2 (Writer) behind explicit plan approval', () => {
    const orchestratorPath = path.join(__dirname, '../skills/insightify/SKILL.md');
    const content = fs.readFileSync(orchestratorPath, 'utf8');

    // The orchestrator must stop the pipeline at the Planner gate, not just the
    // planner sub-skill: without this the run would continue straight to Writer.
    assert.strictEqual(content.includes('Approval gate:'), true, 'Planner step must declare the approval gate');
    assert.strictEqual(content.includes('END TURN'), true, 'Gate must end the turn and wait');
    assert.strictEqual(content.includes('until the user explicitly approves'), true, 'Gate must require explicit approval');
    assert.strictEqual(
      content.includes('do NOT start Stage 2 (Writer)'),
      true,
      'Gate must block Stage 2 (Writer) before approval'
    );
  });

  test('insightify.md includes CLI argument parsing, progress indicators, and error resilience', () => {
    const orchestratorPath = path.join(__dirname, '../skills/insightify/SKILL.md');
    const content = fs.readFileSync(orchestratorPath, 'utf8');

    // CLI argument parsing
    assert.strictEqual(content.includes('CLI Argument Parsing & Invocation'), true);
    assert.strictEqual(content.includes('--dry-run'), true);
    assert.strictEqual(content.includes('--resume'), true);
    assert.strictEqual(content.includes('--config'), true);
    assert.strictEqual(content.includes('--project'), true);

    // Progress indicators and error handling
    assert.strictEqual(content.includes('Progress:'), true);
    assert.strictEqual(content.includes('Error:'), true);
    assert.strictEqual(content.includes('.insightify/'), true);
  });
});