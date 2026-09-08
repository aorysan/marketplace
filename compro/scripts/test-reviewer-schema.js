const fs = require('fs');
const path = require('path');

const skillPath = path.join(__dirname, '..', 'skills', 'reviewer', 'SKILL.md');
if (!fs.existsSync(skillPath)) {
  console.error('FAIL: skills/reviewer/SKILL.md does not exist');
  process.exit(1);
}

const content = fs.readFileSync(skillPath, 'utf-8');
const checks = [
  'compros/<slug>/drafts/01-draft.md',
  'compros/<slug>/drafts/02-final.md',
  'compros/<slug>/reports/review-report.md',
  'APPROVED',
  'REVISION_REQUIRED',
  'Content SEO',
  'Meta Title',
  'Meta Description'
];

for (const check of checks) {
  if (!content.includes(check)) {
    console.error(`FAIL: reviewer SKILL.md missing reference to "${check}"`);
    process.exit(1);
  }
}

console.log('PASS: reviewer skill definition contains all required QA gates and SEO criteria');
process.exit(0);