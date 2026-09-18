const fs = require('fs');
const path = require('path');
const { loadThemeManifest } = require('../skills/builder/scripts/build-deck');

const templatesDir = path.join(__dirname, '..', 'skills', 'builder', 'templates');

// 1. minimal-editorial
const minimal = loadThemeManifest('minimal-editorial', templatesDir);
if (minimal.name !== 'minimal-editorial' || minimal.cssFile !== 'theme.css' || minimal.shellFile !== 'shell.html') {
  console.error('FAIL: minimal-editorial manifest resolution error');
  process.exit(1);
}

// 2. editorial backward-compat alias
const editorial = loadThemeManifest('editorial', templatesDir);
if (editorial.name !== 'minimal-editorial') {
  console.error('FAIL: editorial alias did not resolve to minimal-editorial');
  process.exit(1);
}

// 3. electric-modern
const electric = loadThemeManifest('electric-modern', templatesDir);
if (electric.name !== 'electric-modern' || electric.cssFile !== 'theme.css' || electric.shellFile !== 'shell.html') {
  console.error('FAIL: electric-modern manifest resolution error');
  process.exit(1);
}

// 4. Unknown theme fallback
const fallback = loadThemeManifest('does-not-exist', templatesDir);
if (fallback.name !== 'minimal-editorial') {
  console.error('FAIL: unknown theme did not fall back to minimal-editorial');
  process.exit(1);
}

console.log('PASS: theme manifests load and aliases resolve correctly');
process.exit(0);
