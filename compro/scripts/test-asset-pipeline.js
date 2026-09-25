const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const {
  pickCatalogUrl,
  buildPollinationsUrl,
  buildWebSearchQuery,
  buildWebSearchFallbackQuery,
  buildWebSearchQueryLadder,
  buildOpenverseUrl,
  sniffImageFormat,
  validateImageFile,
  downloadFile
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
// Every documented directive form must be understood. The free-text and partial
// forms used to return null, which silently discarded the content words and made
// the search tier query "<slide title> <slot>" instead.
const freeText = parseImageDirective('<!-- image: hero modern command center with cloud dashboards -->');
if (!freeText || freeText.slot !== 'hero' || freeText.query !== 'modern command center with cloud dashboards') {
  console.error('FAIL: parseImageDirective free-text form: ' + JSON.stringify(freeText));
  process.exit(1);
}
const partialNoStyle = parseImageDirective('<!-- image: hero -- query: modern studio ; keywords: studio, monitors -->');
if (!partialNoStyle || partialNoStyle.query !== 'modern studio' || partialNoStyle.keywords !== 'studio, monitors') {
  console.error('FAIL: parseImageDirective partial (no style) form: ' + JSON.stringify(partialNoStyle));
  process.exit(1);
}
const partialNoKeywords = parseImageDirective('<!-- image: hero -- query: modern studio ; style: photo -->');
if (!partialNoKeywords || partialNoKeywords.query !== 'modern studio' || partialNoKeywords.style !== 'photo') {
  console.error('FAIL: parseImageDirective partial (no keywords) form: ' + JSON.stringify(partialNoKeywords));
  process.exit(1);
}
const slotOnly = parseImageDirective('<!-- image: metrics -->');
if (!slotOnly || slotOnly.slot !== 'metrics' || slotOnly.query !== '') {
  console.error('FAIL: parseImageDirective slot-only form: ' + JSON.stringify(slotOnly));
  process.exit(1);
}

// Byte-level response validation: a 200 response that is not an image must never
// be kept in an image slot.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'compro-asset-'));
const htmlPath = path.join(tmp, 'error-page.jpg');
fs.writeFileSync(htmlPath, '<!DOCTYPE html><html><head><title>Access denied</title></head><body>' + 'x'.repeat(2048) + '</body></html>');
if (!validateImageFile(htmlPath, 'text/html')) {
  console.error('FAIL: an HTML error page must be rejected as an image');
  process.exit(1);
}
const jsonPath = path.join(tmp, 'rate-limit.jpg');
fs.writeFileSync(jsonPath, JSON.stringify({ error: 'rate limited', detail: 'y'.repeat(2048) }));
if (!validateImageFile(jsonPath, 'application/json')) {
  console.error('FAIL: a JSON error body must be rejected as an image');
  process.exit(1);
}
const jpegPath = path.join(tmp, 'real.jpg');
fs.writeFileSync(jpegPath, Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]), Buffer.alloc(1024)]));
if (validateImageFile(jpegPath, 'image/jpeg') !== '') {
  console.error('FAIL: a real JPEG must be accepted');
  process.exit(1);
}
if (sniffImageFormat(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])) !== 'png') {
  console.error('FAIL: sniffImageFormat must detect PNG magic bytes');
  process.exit(1);
}
if (sniffImageFormat(Buffer.from('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"></svg>')) !== 'svg') {
  console.error('FAIL: sniffImageFormat must detect SVG');
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

// Download path against a hermetic local server: proves downloadFile actually
// consults validateImageFile instead of trusting the HTTP status code.
(async () => {
  const jpegBytes = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(2048)]);
  const server = http.createServer((req, res) => {
    if (req.url === '/image') {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      return res.end(jpegBytes);
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<!DOCTYPE html><html><body>' + 'x'.repeat(4096) + '</body></html>');
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;

  const okPath = path.join(tmp, 'ok.jpg');
  await downloadFile(`${base}/image`, okPath, 4000);
  if (!fs.existsSync(okPath) || fs.statSync(okPath).size < 1024) {
    console.error('FAIL: downloadFile must keep a real image response');
    process.exit(1);
  }

  const badPath = path.join(tmp, 'bad.jpg');
  let rejected = false;
  try {
    await downloadFile(`${base}/error-page`, badPath, 4000);
  } catch (e) {
    rejected = true;
  }
  if (!rejected) {
    console.error('FAIL: downloadFile must reject a 200 text/html response instead of saving it as an image');
    process.exit(1);
  }
  if (fs.existsSync(badPath)) {
    console.error('FAIL: the rejected non-image file must be deleted from the asset dir');
    process.exit(1);
  }
  // Source reporting: a curated URL that fails must be labelled picsum, not
  // catalog, so build.log does not hide a content-blind photo behind the
  // curated-catalog tier.
  const { fetchImageWithFallback, SLOT_MAP } = require('../skills/builder/scripts/image-fetcher');
  if (!SLOT_MAP.viewfinder || SLOT_MAP.viewfinder.category !== 'architecture-modern') {
    console.error('FAIL: viewfinder must stay on the architecture-modern landscape pool');
    process.exit(1);
  }
  const cdnReport = {};
  const cdnOut = await fetchImageWithFallback({
    category: 'architecture-modern',
    destPath: path.join(tmp, 'cdn.jpg'),
    slot: 'viewfinder',
    _forceUrl: `${base}/image`,
    allowSvgFallback: false,
    report: cdnReport
  });
  if (cdnReport.source !== 'cdn' || !fs.existsSync(cdnOut)) {
    console.error('FAIL: a curated CDN hit must report source=cdn, got ' + cdnReport.source);
    process.exit(1);
  }
  const picsumReport = {};
  const picsumOut = await fetchImageWithFallback({
    category: 'architecture-modern',
    destPath: path.join(tmp, 'picsum.jpg'),
    slot: 'viewfinder',
    _forceUrl: `${base}/error-page`,
    _picsumUrl: `${base}/image`,
    allowSvgFallback: false,
    report: picsumReport
  });
  if (picsumReport.source !== 'picsum' || !fs.existsSync(picsumOut)) {
    console.error('FAIL: a failed curated URL that Picsum rescued must report source=picsum, got ' + picsumReport.source);
    process.exit(1);
  }

  server.close();
  console.log('PASS: asset pipeline pure functions behave');
  process.exit(0);
})();
