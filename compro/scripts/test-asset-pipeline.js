const {
  pickCatalogUrl,
  buildPollinationsUrl,
  buildWebSearchQuery,
  buildWebSearchFallbackQuery,
  buildWebSearchQueryLadder,
  buildOpenverseUrl
} = require('../skills/builder/scripts/image-fetcher');
const { parseImageDirective } = require('../skills/builder/scripts/build-deck');

const pool = ['u1', 'u2', 'u3'];
if (pickCatalogUrl(pool, 0, 0) !== 'u1' || pickCatalogUrl(pool, 3, 0) !== 'u1' || pickCatalogUrl(pool, 1, 5) === pickCatalogUrl(pool, 1, 6)) {
  console.error('FAIL: pickCatalogUrl round-robin broken');
  process.exit(1);
}
const url = buildPollinationsUrl('modern glass office', 800, 1200);
if (url !== 'https://image.pollinations.ai/prompt/modern%20glass%20office?width=800&height=1200&nologo=true') {
  console.error('FAIL: pollinations URL mismatch: ' + url);
  process.exit(1);
}
const d = parseImageDirective('Intro text\n<!-- image: solution -- query: startup team meeting; keywords: team office startup; style: photo -->\nMore');
if (!d || d.slot !== 'solution' || d.query !== 'startup team meeting' || d.keywords !== 'team office startup') {
  console.error('FAIL: parseImageDirective mismatch: ' + JSON.stringify(d));
  process.exit(1);
}
if (parseImageDirective('no directive here') !== null) {
  console.error('FAIL: parseImageDirective must return null without directive');
  process.exit(1);
}

// Web search query derivation (keywords > query > title+slot)
const q1 = buildWebSearchQuery({ keywords: 'studio, monitors, vertical video', query: 'ignored', title: 'X', slot: 'hero' });
if (q1 !== 'studio monitors vertical video') {
  console.error('FAIL: buildWebSearchQuery keywords priority: ' + JSON.stringify(q1));
  process.exit(1);
}
const q2 = buildWebSearchQuery({ query: 'modern creative studio desk', title: 'Cover', slot: 'hero' });
if (q2 !== 'modern creative studio desk') {
  console.error('FAIL: buildWebSearchQuery query fallback: ' + JSON.stringify(q2));
  process.exit(1);
}
const q3 = buildWebSearchQuery({ title: 'Mengapa Kami', slot: 'differentiator' });
if (q3 !== 'Mengapa Kami differentiator') {
  console.error('FAIL: buildWebSearchQuery title+slot: ' + JSON.stringify(q3));
  process.exit(1);
}
const shortQ = buildWebSearchFallbackQuery('studio monitors vertical video editing extra');
if (shortQ !== 'studio monitors vertical video') {
  console.error('FAIL: buildWebSearchFallbackQuery: ' + JSON.stringify(shortQ));
  process.exit(1);
}

const ladder = buildWebSearchQueryLadder({ keywords: 'workspace brand DNA editor video', slot: 'solution' });
if (ladder.length < 3 || ladder[ladder.length - 1] !== 'creative workspace laptop') {
  console.error('FAIL: buildWebSearchQueryLadder: ' + JSON.stringify(ladder));
  process.exit(1);
}

const ov = buildOpenverseUrl('team office');
if (!ov.startsWith('https://api.openverse.org/v1/images/?') || !ov.includes('q=team+office')) {
  console.error('FAIL: buildOpenverseUrl: ' + ov);
  process.exit(1);
}
if (!ov.includes('license_type=commercial%2Cmodification')) {
  console.error('FAIL: buildOpenverseUrl should keep commercial+modification: ' + ov);
  process.exit(1);
}

console.log('PASS: asset pipeline pure functions behave');
process.exit(0);
