const { pickCatalogUrl, buildPollinationsUrl } = require('../skills/builder/scripts/image-fetcher');
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
console.log('PASS: asset pipeline pure functions behave');
process.exit(0);
