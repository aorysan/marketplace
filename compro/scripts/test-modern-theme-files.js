const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'skills', 'builder', 'templates', 'modern');
for (const f of ['theme.css', 'shell.html', 'manifest.json']) {
  if (!fs.existsSync(path.join(dir, f))) { console.error(`FAIL: modern/${f} missing`); process.exit(1); }
}
const shell = fs.readFileSync(path.join(dir, 'shell.html'), 'utf8');for (const token of [
  '/* CSS_INLINE_PLACEHOLDER */', '<!-- SLIDES_INLINE_PLACEHOLDER -->', '{{META}}', '{{BRAND_TITLE}}'
]) {
  if (!shell.includes(token)) { console.error(`FAIL: shell.html missing ${token}`); process.exit(1); }
}
// The shell derives dots/counter/progress from the injected DOM (not a
// hardcoded slide count), so a 9-slide deck is not clipped by the chrome.
if (!/counterTotal\.textContent\s*=\s*String\(total\)/.test(shell)) {
  console.error('FAIL: shell.html must compute #counterTotal from the injected slide count');
  process.exit(1);
}
const css = fs.readFileSync(path.join(dir, 'theme.css'), 'utf8');
for (const token of [
  '--background: #ffffff',
  '--foreground: #0a0a0a',
  '--muted-foreground: #6b6b6b',
  '--accent: var(--brand-primary, #ff3b1d)',
  '--border: #e4e4e4',
  '--ghost: #f1f1f1',
  '--hover-bg: #fafafa',
  '--font-display',
  '--font-body',
  '--font-mono',
  '.deck-container',
  '.deck-stage',
  '.slide-item',
  '.slide-cover',
  '.slide-problem',
  '.slide-product',
  '.slide-features',
  '.slide-usp',
  '.slide-pricing',
  '.slide-metrics',
  '.slide-ecosystem',
  '.slide-closing',
  '.cover-stats',
  '.metrics-band',
  '.metric-value',
  '.metric-label',
  '.ecosystem-grid',
  '.ecosystem-node',
  '.node-name',
  '.node-role',
  '.closing-contacts'
]) {
  if (!css.includes(token)) { console.error(`FAIL: theme.css missing ${token}`); process.exit(1); }
}
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
if (manifest.name !== 'modern' || manifest.renderer !== 'modern' || manifest.archetypes.length !== 9) {
  console.error(`FAIL: modern manifest must declare 9 archetypes with renderer modern, got ${manifest.archetypes.length}`);
  process.exit(1);
}
const expectedArchetypes = ['cover', 'problem', 'product', 'features', 'usp', 'pricing', 'metrics', 'ecosystem', 'closing'];
for (const arch of expectedArchetypes) {
  if (!manifest.archetypes.includes(arch)) {
    console.error(`FAIL: manifest missing archetype "${arch}"`);
    process.exit(1);
  }
}
const expectedSlots = {
  cover: 'hero',
  problem: 'problem',
  product: 'macro',
  features: 'hands',
  usp: 'viewfinder',
  pricing: 'lens',
  metrics: 'metrics',
  ecosystem: 'ecosystem',
  closing: 'closing'
};
for (const [arch, slot] of Object.entries(expectedSlots)) {
  if (manifest.slots && manifest.slots[arch] !== slot) {
    console.error(`FAIL: manifest slots[${arch}] !== "${slot}"`);
    process.exit(1);
  }
}
console.log('PASS: modern Aperture Cinematic theme files and manifest complete');
process.exit(0);
