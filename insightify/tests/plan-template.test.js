const { describe, test, before } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Plan Template (Parallel Sections)', () => {
  const templatePath = path.join(__dirname, '../skills/planner/templates/plan-template.md');
  const skillPath = path.join(__dirname, '../skills/planner/SKILL.md');

  let templateContent = '';
  let skillContent = '';

  before(() => {
    if (fs.existsSync(templatePath)) {
      templateContent = fs.readFileSync(templatePath, 'utf8');
    }
    if (fs.existsSync(skillPath)) {
      skillContent = fs.readFileSync(skillPath, 'utf8');
    }
  });

  test('plan-template.md exists and contains required frontmatter configuration', () => {
    assert.strictEqual(fs.existsSync(templatePath), true, 'plan-template.md must exist');
    assert.ok(templateContent.startsWith('---'), 'Must start with YAML frontmatter');
    assert.ok(templateContent.includes('total_sections: {{TOTAL_SECTIONS}}'), 'Must set total_sections using template variable');
    assert.ok(templateContent.includes('doc_type: "{{DOC_TYPE}}"'), 'Must define doc_type using template variable');
    assert.ok(templateContent.includes('output_format: "artifact-html"'), 'Must specify artifact-html output_format');
    assert.ok(templateContent.includes('status: "approved"'), 'Must define status field');
  });

  test('plan-template.md defines section breakdowns using template variable', () => {
    assert.strictEqual(fs.existsSync(templatePath), true, 'plan-template.md must exist');
    assert.ok(templateContent.includes('{{SECTION_LIST}}'), 'Must contain SECTION_LIST variable for sections');
  });

  test('plan-template.md defines parallel rendering groups using template variable', () => {
    assert.strictEqual(fs.existsSync(templatePath), true, 'plan-template.md must exist');
    assert.ok(templateContent.includes('## Parallel Rendering'), 'Must define Parallel Rendering');
    assert.ok(templateContent.includes('{{PARALLEL_SECTIONS_LIST}}'), 'Must use PARALLEL_SECTIONS_LIST variable');
  });

  test('plan-template.md specifies sequential writing order and approval checklist', () => {
    assert.strictEqual(fs.existsSync(templatePath), true, 'plan-template.md must exist');

    const writingOrderStartIndex = templateContent.indexOf('## Writing Order (Sequential for Human Review)');
    const approvalChecklistIndex = templateContent.indexOf('## Approval Checklist');

    assert.ok(writingOrderStartIndex !== -1, 'Writing Order section must exist');
    assert.ok(approvalChecklistIndex !== -1, 'Approval Checklist section must exist');
    assert.ok(writingOrderStartIndex < approvalChecklistIndex, 'Writing Order must precede Approval Checklist');

    assert.ok(templateContent.includes('{{WRITING_ORDER_LIST}}'), 'Must use WRITING_ORDER_LIST variable');

    const checklistSection = templateContent.slice(approvalChecklistIndex);
    assert.ok(checklistSection.includes('- [ ] All sections planned with clear purpose and sources'));
    assert.ok(!checklistSection.includes('max 5 waves'), 'Checklist should not enforce 5 waves');
    assert.ok(checklistSection.includes('- [ ] Each section has 3-8 sub-sections'));
  });

  test('planner skill defines archetype-aware categories and user approval workflow in SKILL.md', () => {
    assert.strictEqual(fs.existsSync(skillPath), true, 'planner SKILL.md must exist');

    const expectedKnowledgeCategories = [
      'product.md',
      'directory-structure.md',
      'architecture.md',
      'state-and-data.md',
      'design-system.md',
      'api-patterns.md',
      'features-and-journeys.md',
      'business-policies.md',
      'constraints-and-limits.md'
    ];

    expectedKnowledgeCategories.forEach(cat => {
      assert.ok(skillContent.includes(cat), `SKILL.md must list category: ${cat}`);
    });

    assert.ok(!skillContent.includes('workflows.md'), 'SKILL.md must not list workflows.md category');
    assert.ok(skillContent.includes('detected archetype'), 'SKILL.md must derive category set from detected archetype');
    assert.ok(!skillContent.includes('max 5 waves'), 'SKILL.md must not enforce max 5 waves anymore');
  });

  test('planner skill enforces parallel extraction with a maximum concurrency of 5', () => {
    assert.strictEqual(fs.existsSync(skillPath), true, 'planner SKILL.md must exist');
    assert.ok(skillContent.includes('parallel'), 'SKILL.md must specify parallel extraction');
    assert.ok(skillContent.includes('concurrency limit of 5'), 'SKILL.md must specify a max concurrency limit of 5');
  });
});
