const { describe, test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Writer Skill (SKILL.md contracts)', () => {
  const skillPath = path.join(__dirname, '../skills/writer/SKILL.md');

  test('writer skill instructs sub-agents to render sections independently in parallel with max concurrency 5', () => {
    const skill = fs.readFileSync(skillPath, 'utf8');

    assert.ok(skill.includes('sub-agents'), 'SKILL.md must mention sub-agents');
    assert.ok(skill.includes('independently in parallel'), 'SKILL.md must instruct to render independently in parallel');
    assert.ok(skill.includes('maximum concurrency of 5'), 'SKILL.md must specify maximum concurrency of 5');
    assert.ok(skill.includes('stitch them together'), 'SKILL.md must instruct to stitch them together');

    // Output target
    assert.ok(skill.includes('docs/markdown/'), 'Must reference docs/markdown/ output path');
  });

  test('writer SKILL.md derives sections from plan.md and knowledge, with no local section templates', () => {
    const skill = fs.readFileSync(skillPath, 'utf8');

    assert.ok(skill.includes('.insightify/plan.md'), 'SKILL.md must read the plan for document structure');
    assert.ok(skill.includes('.insightify/knowledge/'), 'SKILL.md must read extracted knowledge files');
    assert.strictEqual(
      fs.existsSync(path.join(__dirname, '../skills/writer/templates')),
      false,
      'writer must not carry its own section templates; sections are planned per archetype'
    );
  });

  test('writer SKILL.md contains Artifact HTML Formatting section with builder utility classes', () => {
    const skill = fs.readFileSync(skillPath, 'utf8');
    assert.ok(skill.includes('## Artifact HTML Formatting'), 'SKILL.md must contain an Artifact HTML Formatting section');

    const utilityClasses = ['artifact-card', 'grid-2', 'grid-3', 'badge', 'status-indicator'];
    utilityClasses.forEach(cls => {
      assert.ok(skill.includes(cls), `Artifact HTML Formatting must reference ${cls}`);
    });

    assert.ok(skill.includes('status-warning'), 'status-indicator guidance must include status-warning modifier');
    assert.ok(skill.includes('status-error'), 'status-indicator guidance must include status-error modifier');

    // Section must sit after Content Structure and before Cross-References
    const contentIdx = skill.indexOf('## Content Structure');
    const artifactIdx = skill.indexOf('## Artifact HTML Formatting');
    const crossRefIdx = skill.indexOf('## Cross-References');
    assert.ok(contentIdx !== -1 && artifactIdx !== -1 && crossRefIdx !== -1, 'Required sections must exist');
    assert.ok(contentIdx < artifactIdx && artifactIdx < crossRefIdx,
      'Artifact HTML Formatting must appear after Content Structure and before Cross-References');

    assert.ok(skill.includes('do not invent other class names'), 'Must restrict Writer to Builder CSS classes');

    // Raw HTML only inside artifact wrappers (marked 12 does not render markdown nested in raw HTML)
    assert.ok(skill.includes('use raw HTML only'), 'Wrapper guidance must mandate raw HTML only inside wrappers');
    assert.ok(skill.includes('Markdown syntax will not be rendered'),
      'Wrapper guidance must warn that markdown syntax will not be rendered inside raw HTML wrappers');

    // Strict HTML Grid card rules and anti-patterns
    assert.ok(skill.includes('Mandatory HTML Grid Cards for Enumerations'),
      'Must enforce mandatory HTML grid cards for enumerations');
    assert.ok(skill.includes('forbid standard markdown lists') || skill.includes('NO Markdown Bullets'),
      'Must explicitly forbid markdown bullet lists for structures');
    assert.ok(skill.includes('<h4>') && skill.includes('<code>'),
      'Must specify <h4> for card titles and <code> for code terms');
    assert.ok(skill.includes('Few-Shot HTML Grid Template'),
      'Must include a few-shot HTML grid template example');
  });
});
