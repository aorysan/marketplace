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

// --- v2.6 template-consumability asserts (Task 6) ---
const consumabilityChecks = [
  'template-consumability',
  'image directive',
  'pricing rows',
  'differentiator columns',
  'big-number regex',
  'honesty callout'
];

for (const check of consumabilityChecks) {
  if (!content.includes(check)) {
    console.error(`FAIL: reviewer SKILL.md missing template-consumability reference "${check}"`);
    process.exit(1);
  }
}

console.log('PASS: reviewer skill definition enforces the template-consumability checklist');

// --- v2.7 selling points and reviewer verification asserts ---
const v27ReviewerChecks = [
  'selling-points-research.md',
  'Selling Point Verification',
  'Zero Competitor Leak Check',
  'SP-N',
  'Differentiator Table Headers'
];

for (const check of v27ReviewerChecks) {
  if (!content.includes(check)) {
    console.error(`FAIL: reviewer SKILL.md missing v2.7.0 reference "${check}"`);
    process.exit(1);
  }
}

console.log('PASS: reviewer skill definition enforces selling points verification, zero competitor leak check, and differentiator table headers');
process.exit(0);
