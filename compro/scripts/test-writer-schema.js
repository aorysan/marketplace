const fs = require('fs');
const path = require('path');

const skillPath = path.join(__dirname, '..', 'skills', 'writer', 'SKILL.md');
if (!fs.existsSync(skillPath)) {
  console.error('FAIL: skills/writer/SKILL.md does not exist');
  process.exit(1);
}

const content = fs.readFileSync(skillPath, 'utf-8');
const checks = [
  'business-knowledge-base.md',
  'business-audit-report.md',
  'brand-story-guide.md',
  'compros/<slug>/drafts/01-draft.md',
  'Hero Slide',
  'Problem Slide',
  'Solution',
  'Contact'
];

for (const check of checks) {
  if (!content.includes(check)) {
    console.error(`FAIL: SKILL.md missing reference to "${check}"`);
    process.exit(1);
  }
}

console.log('PASS: writer skill definition contains all required inputs, outputs, and slide types');

// --- v2.7 selling points research and embedded skills asserts ---
const v27Checks = [
  'compros/<slug>/reports/selling-points-research.md',
  'Phase 0.5: Competitive Selling Point Research',
  'Zero Competitor Leak',
  'Internal Synthesis',
  'fallback'
];

for (const check of v27Checks) {
  if (!content.includes(check)) {
    console.error(`FAIL: writer SKILL.md missing v2.7.0 reference "${check}"`);
    process.exit(1);
  }
}

const embeddedSkills = [
  path.join(__dirname, '..', 'skills', 'builder', 'skills', 'ui-ux-pro-max', 'SKILL.md'),
  path.join(__dirname, '..', 'skills', 'builder', 'skills', 'impeccable', 'SKILL.md')
];

for (const skill of embeddedSkills) {
  if (!fs.existsSync(skill)) {
    console.error(`FAIL: embedded design skill missing: ${skill}`);
    process.exit(1);
  }
}

console.log('PASS: writer skill contains v2.7.0 Phase 0.5 research, Zero Competitor Leak, fallback, and embedded design skills exist');

// --- v2.6 modern consumability asserts (Task 6) ---
const modernPath = path.join(__dirname, '..', 'test-fixtures', 'expected', '02-final.modern.md');
if (!fs.existsSync(modernPath)) {
  console.error('FAIL: test-fixtures/expected/02-final.modern.md does not exist');
  process.exit(1);
}

const md = fs.readFileSync(modernPath, 'utf-8');
const chunks = md.split(/^# /m);
const slides = chunks.slice(1);
if (slides.length === 0) {
  console.error('FAIL: 02-final.modern.md contains no "# " slides');
  process.exit(1);
}

const directiveRe = /<!--\s*image:\s*[a-z-]+\s*--\s*query:\s*[^;]+;\s*keywords:\s*[^;]+;\s*style:\s*photo\s*-->/;

function countBodyWords(slideChunk) {
  const nl = slideChunk.indexOf('\n');
  let body = nl === -1 ? '' : slideChunk.slice(nl + 1);
  body = body.replace(/<!--[\s\S]*?-->/g, '');
  return body.split(/\s+/).map(w => w.trim()).filter(w => w && w !== '---').length;
}

for (const slide of slides) {
  const title = slide.slice(0, slide.indexOf('\n')).trim();
  if (!directiveRe.test(slide)) {
    console.error(`FAIL: slide "${title}" missing v2.6 image directive (<!-- image: <slot> -- query: ...; keywords: ...; style: photo -->)`);
    process.exit(1);
  }
  const words = countBodyWords(slide);
  if (words < 40 || words > 60) {
    console.error(`FAIL: slide "${title}" body is ${words} words (expected 40-60)`);
    process.exit(1);
  }
}

const pricingSlide = slides.find(s => /paket|harga|pricing|kerjasama/i.test(s.slice(0, s.indexOf('\n'))));
if (!pricingSlide) {
  console.error('FAIL: no pricing slide (paket/harga/pricing/kerjasama) found in 02-final.modern.md');
  process.exit(1);
}
const pipeLines = pricingSlide.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
const isSeparator = l => /^(\s*:?-{2,}:?\s*\|?)+$/.test(l.replace(/^\||\|$/g, '').trim());
const dataRows = pipeLines.filter(l => !isSeparator(l));
if (dataRows.length - 1 !== 3) {
  console.error(`FAIL: pricing slide table has ${dataRows.length - 1} data rows (expected 3)`);
  process.exit(1);
}

const writerSkill = fs.readFileSync(skillPath, 'utf-8');
if (!writerSkill.includes('40-60 kata') || !writerSkill.includes('**Judul**')) {
  console.error('FAIL: writer SKILL.md missing 40-60 condensed-bullet contract');
  process.exit(1);
}
console.log('PASS: writer density contract present');

console.log('PASS: modern fixture has per-slide image directives, 40-60 words/slide, and a 3-row pricing table');
process.exit(0);
