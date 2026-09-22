const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const manifestFiles = [
  'plugin.json',
  '.claude-plugin/plugin.json',
  '.codex-plugin/plugin.json'
];

for (const relPath of manifestFiles) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`FAIL: ${relPath} does not exist`);
    process.exit(1);
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (err) {
    console.error(`FAIL: ${relPath} contains invalid JSON: ${err.message}`);
    process.exit(1);
  }

  if (manifest.name !== 'compro') {
    console.error(`FAIL: ${relPath} expected name 'compro', got '${manifest.name}'`);
    process.exit(1);
  }

  if (manifest.version !== '2.8.0') {
    console.error(`FAIL: ${relPath} expected version 2.8.0, got '${manifest.version}'`);
    process.exit(1);
  }

  console.log(`PASS: ${relPath} is valid (name: compro, version: 2.8.0)`);
}

const requiredSkills = ['compro', 'writer', 'reviewer', 'builder', 'publisher'];
const skillsDir = path.join(rootDir, 'skills');

for (const skill of requiredSkills) {
  const skillFile = path.join(skillsDir, skill, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    console.error(`FAIL: skill definition missing: ${skill}/SKILL.md`);
    process.exit(1);
  }
}

console.log('PASS: all 5 Layer 3 skill definitions exist');
console.log('PASS: manifest is valid with version 2.8.0 and all 5 Layer 3 skills');
process.exit(0);
