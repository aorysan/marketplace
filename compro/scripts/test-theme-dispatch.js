const fs = require('fs');
const path = require('path');
const { loadThemeManifest } = require('../skills/builder/scripts/build-deck');

const templatesDir = path.join(__dirname, '..', 'skills', 'builder', 'templates');

const editorial = loadThemeManifest('editorial', templatesDir);
if (editorial.cssFile !== 'editorial.css' || editorial.shellFile !== 'editorial-shell.html') {
  console.error('FAIL: editorial manifest points at wrong files');
  process.exit(1);
}
// NOTE (Task 1): 9 entries, not 8 — `welcome-problem` and `welcome-solution`
// are two archetypes sharing one layout family; the 8-layout count in the
// spec refers to layout families. The brief's manifest lists 9 keys.
if (!Array.isArray(editorial.archetypes) || editorial.archetypes.length !== 9) {
  console.error('FAIL: editorial manifest must declare exactly 9 archetypes');
  process.exit(1);
}
// Unknown theme must fall back, never throw
const fallback = loadThemeManifest('does-not-exist', templatesDir);
if (fallback.name !== 'editorial') {
  console.error('FAIL: unknown theme did not fall back to editorial');
  process.exit(1);
}
console.log('PASS: theme manifests load and unknown themes fall back');
process.exit(0);
