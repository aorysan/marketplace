const path = require('path');
const { loadThemeManifest, renderSlide } = require('../skills/builder/scripts/build-deck');

const templatesDir = path.join(__dirname, '..', 'skills', 'builder', 'templates');

// Single-template build: only `modern` exists, no --theme selection.
// 1. modern resolves
const modern = loadThemeManifest('modern', templatesDir);
if (modern.name !== 'modern' || modern.cssFile !== 'theme.css' || modern.shellFile !== 'shell.html') {
  console.error('FAIL: modern manifest resolution error');
  process.exit(1);
}

// 2. any other theme name is ignored with a warning and still resolves to modern
const legacy = loadThemeManifest('editorial', templatesDir);
if (legacy.name !== 'modern') {
  console.error('FAIL: legacy theme name did not resolve to modern');
  process.exit(1);
}

// 3. renderSlide dispatches to the modern renderer (no theme branching)
const brand = { name: 'Venturo Pro', primaryColor: '#009BAD', secondaryColor: '#006D79' };
const html = renderSlide({ title: 'Layanan Unggulan', content: 'Intro\n\n- **Brand DNA** — kunci identitas' }, 3, 9, brand, 'modern', '');
if (!html.includes('<article') && !html.includes('<section')) {
  console.error('FAIL: renderSlide did not produce a modern slide container');
  process.exit(1);
}

console.log('PASS: single-template (modern) manifests load and render correctly');
process.exit(0);
