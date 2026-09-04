const { describe, test, before } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Extract Schema Reference (10 Merged Categories)', () => {
  const schemaPath = path.join(__dirname, '../skills/planner/references/extraction-schema.md');
  let schemaDoc;

  before(() => {
    if (fs.existsSync(schemaPath)) {
      schemaDoc = fs.readFileSync(schemaPath, 'utf8');
    }
  });

  test('extraction-schema.md exists and defines all 10 merged categories plus unanswered', () => {
    assert.strictEqual(fs.existsSync(schemaPath), true, 'Schema file must exist');

    const categories = [
      'product.md',
      'directory-structure.md',
      'architecture.md',
      'state-and-data.md',
      'design-system.md',
      'api-patterns.md',
      'features-and-journeys.md',
      'business-policies.md',
      'constraints-and-limits.md',
      'workflows.md',
      'unanswered.md'
    ];

    categories.forEach(cat => {
      assert.strictEqual(schemaDoc.includes(cat), true, `Must include category: ${cat}`);
    });
  });

  test('extraction-schema.md specifies YAML frontmatter with confidence and source tracking', () => {
    assert.strictEqual(fs.existsSync(schemaPath), true, 'Schema file must exist');
    assert.ok(schemaDoc.includes('category:'));
    assert.ok(schemaDoc.includes('extracted_from'));
    assert.ok(schemaDoc.includes('confidence: "high" | "medium" | "low"'));
    assert.ok(schemaDoc.includes('extracted_at:'));
  });
});

