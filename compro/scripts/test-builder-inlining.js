const fs = require('fs');
const path = require('path');

// Single-template build: the modern shell must be self-contained —
// inlined CSS via placeholder, slides via placeholder, no external stylesheet link.
const shellPath = path.join(__dirname, '..', 'skills', 'builder', 'templates', 'modern', 'shell.html');
const cssPath = path.join(__dirname, '..', 'skills', 'builder', 'templates', 'modern', 'theme.css');

if (!fs.existsSync(shellPath) || !fs.existsSync(cssPath)) {
  console.error('FAIL: modern template files missing');
  process.exit(1);
}

const shellContent = fs.readFileSync(shellPath, 'utf-8');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

if (/href=["'](custom|theme)\.css["']/.test(shellContent)) {
  console.error('FAIL: modern shell.html still has external project stylesheet link');
  process.exit(1);
}

if (!shellContent.includes('/* CSS_INLINE_PLACEHOLDER */')) {
  console.error('FAIL: modern shell.html missing CSS injection placeholder /* CSS_INLINE_PLACEHOLDER */');
  process.exit(1);
}

if (!shellContent.includes('<!-- SLIDES_INLINE_PLACEHOLDER -->')) {
  console.error('FAIL: modern shell.html missing <!-- SLIDES_INLINE_PLACEHOLDER -->');
  process.exit(1);
}

// Verify CSS placeholder replacement
const inlined = shellContent.replace('/* CSS_INLINE_PLACEHOLDER */', cssContent);
if (!inlined.includes('--background') || inlined.includes('/* CSS_INLINE_PLACEHOLDER */')) {
  console.error('FAIL: CSS placeholder replacement verification failed');
  process.exit(1);
}

console.log('PASS: modern shell.html is configured for self-contained CSS inlining');
process.exit(0);
