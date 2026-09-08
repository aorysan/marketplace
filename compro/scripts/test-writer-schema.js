const fs = require('fs');
const path = require('path');

const skillPath = path.join(__dirname, '..', 'skills', 'writer', 'SKILL.md');
if (!fs.existsSync(skillPath)) {
  console.error('FAIL: skills/writer/SKILL.md does not exist');
  process.exit(1);
}

const content = fs.readFileSync(skillPath, 'utf-8');
const checks = [
  'business-knowledge-base.md',
  'business-audit-report.md',
  'brand-story-guide.md',
  'compros/<slug>/drafts/01-draft.md',
  'Hero Slide',
  'Problem Slide',
  'Solution',
  'Contact'
];

for (const check of checks) {
  if (!content.includes(check)) {
    console.error(`FAIL: SKILL.md missing reference to "${check}"`);
    process.exit(1);
  }
}

console.log('PASS: writer skill definition contains all required inputs, outputs, and slide types');
process.exit(0);
