const fs = require('fs');
const path = require('path');

const shellPath = path.join(__dirname, '..', 'skills', 'company-profile-builder', 'templates', 'profile-shell.html');
const cssPath = path.join(__dirname, '..', 'skills', 'company-profile-builder', 'templates', 'custom.css');

if (!fs.existsSync(shellPath) || !fs.existsSync(cssPath)) {
  console.error('FAIL: template files missing');
  process.exit(1);
}

const shellContent = fs.readFileSync(shellPath, 'utf-8');

// The shell must contain the CSS injection token <!-- {{CUSTOM_CSS}} --> or <style>{{CUSTOM_CSS}}</style>
// and must NOT have external <link rel="stylesheet" href="custom.css">
if (shellContent.includes('<link rel="stylesheet" href="custom.css">')) {
  console.error('FAIL: profile-shell.html still has external <link rel="stylesheet" href="custom.css">');
  process.exit(1);
}

if (!shellContent.includes('/* {{CUSTOM_CSS}} */') && !shellContent.includes('{{CUSTOM_CSS}}')) {
  console.error('FAIL: profile-shell.html missing CSS injection placeholder {{CUSTOM_CSS}}');
  process.exit(1);
}

console.log('PASS: profile-shell.html is configured for self-contained CSS inlining');
process.exit(0);
