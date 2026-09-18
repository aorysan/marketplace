const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'skills', 'builder', 'templates');
const requiredThemes = ['minimal-editorial', 'electric-modern', 'modern', 'profile'];

for (const theme of requiredThemes) {
  const dir = path.join(templatesDir, theme);
  if (!fs.existsSync(dir)) {
    console.error(`FAIL: theme dir missing: ${theme}`);
    process.exit(1);
  }
  for (const file of ['manifest.json', 'shell.html', 'theme.css', 'README.md']) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`FAIL: ${theme} missing ${file}`);
      process.exit(1);
    }
  }
}
console.log('PASS: required theme bundles exist');
process.exit(0);
