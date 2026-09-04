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