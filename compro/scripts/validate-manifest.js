const fs = require('fs');
const path = require('path');

const pluginJsonPath = path.join(__dirname, '..', 'plugin.json');
if (!fs.existsSync(pluginJsonPath)) {
  console.error('FAIL: plugin.json does not exist');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));

if (manifest.version !== '2.4.0') {
  console.error(`FAIL: expected version 2.4.0, got ${manifest.version}`);
  process.exit(1);
}

const requiredSkills = ['compro', 'writer', 'reviewer', 'builder', 'publisher'];
const skillsDir = path.join(__dirname, '..', 'skills');

for (const skill of requiredSkills) {
  const skillFile = path.join(skillsDir, skill, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    console.error(`FAIL: skill definition missing: ${skill}/SKILL.md`);
    process.exit(1);
  }
}

console.log('PASS: manifest is valid with version 2.4.0 and all 5 Layer 3 skills');
process.exit(0);
