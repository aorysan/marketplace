const fs = require('fs');
const path = require('path');

const skillPath = path.join(__dirname, '..', 'skills', 'compro', 'SKILL.md');
if (!fs.existsSync(skillPath)) {
  console.error('FAIL: skills/compro/SKILL.md does not exist');
  process.exit(1);
}

const content = fs.readFileSync(skillPath, 'utf-8');
const checks = [
  'Gate 0',
  'Phase 1',
  'Phase 2',
  'Phase 3',
  'Phase 4',
  'Gate 5',
  'Phase 6',
  '/writer',
  '/reviewer',
  '/builder',
  '/publisher',
  'compros/<slug>/'
];

for (const check of checks) {
  if (!content.includes(check)) {
    console.error(`FAIL: orchestrator SKILL.md missing phase or skill reference: "${check}"`);
    process.exit(1);
  }
}

console.log('PASS: orchestrator SKILL.md contains all gates, phases, simplified skills, and consolidated paths');
process.exit(0);
