const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', '.codex-plugin', 'plugin.json');

if (!fs.existsSync(manifestPath)) {
  console.error('FAIL: .codex-plugin/plugin.json does not exist');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const requiredSkills = [
  'compro',
  'company-profile-writer',
  'company-profile-reviewer',
  'company-profile-builder',
  'company-profile-publisher'
];

if (manifest.name !== 'compro') {
  console.error(`FAIL: expected manifest.name to be "compro", got "${manifest.name}"`);
  process.exit(1);
}

const skillNames = (manifest.skills || []).map(s => s.name);
const missing = requiredSkills.filter(s => !skillNames.includes(s));

if (missing.length > 0) {
  console.error(`FAIL: missing skills in manifest: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('PASS: manifest is valid with all 5 Layer 3 skills');
process.exit(0);
