import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const FRONTEND_SPA_CATEGORIES = [
  'product', 'directory-structure', 'architecture', 'state-and-data',
  'design-system', 'api-patterns', 'features-and-journeys',
  'business-policies', 'constraints-and-limits', 'workflows'
];

export const BACKEND_API_CATEGORIES = [
  'product', 'directory-structure', 'architecture', 'api-patterns',
  'features-and-journeys', 'business-policies', 'constraints-and-limits',
  'workflows'
];

test('planner SKILL.md Phase 2 lists workflows.md for frontend-spa (10 categories)', () => {
  const skill = fs.readFileSync(path.join(__dirname, 'SKILL.md'), 'utf-8');
  const line = skill.split(/\r?\n/).find(l => l.includes('`frontend-spa`:') && l.includes('default categories'));
  assert.ok(line, 'frontend-spa category line not found in Phase 2');
  assert.match(line, /10 default categories/, 'frontend-spa should now declare 10 categories');
  for (const cat of FRONTEND_SPA_CATEGORIES) {
    assert.ok(line.includes(cat), `frontend-spa category list missing "${cat}"`);
  }
});

test('planner SKILL.md Phase 2 lists workflows for backend-api', () => {
  const skill = fs.readFileSync(path.join(__dirname, 'SKILL.md'), 'utf-8');
  const line = skill.split(/\r?\n/).find(l => l.includes('`backend-api`:'));
  assert.ok(line, 'backend-api category line not found');
  assert.ok(line.includes('workflows'), 'backend-api category list missing "workflows"');
});

test('planner SKILL.md Phase 2 Knowledge Categories enumerates workflows.md as item 10', () => {
  const skill = fs.readFileSync(path.join(__dirname, 'SKILL.md'), 'utf-8');
  assert.match(skill, /10\.\s+`workflows\.md`/, 'Phase 2 knowledge category list must include a numbered workflows.md entry');
});

test('system-design and general archetypes do NOT list workflows', () => {
  const skill = fs.readFileSync(path.join(__dirname, 'SKILL.md'), 'utf-8');
  const systemDesignLine = skill.split(/\r?\n/).find(l => l.includes('`system-design`:'));
  const generalLine = skill.split(/\r?\n/).find(l => l.includes('`general`:'));
  assert.ok(!systemDesignLine.includes('workflows'), 'system-design must not list workflows');
  assert.ok(!generalLine.includes('workflows'), 'general must not list workflows');
});
