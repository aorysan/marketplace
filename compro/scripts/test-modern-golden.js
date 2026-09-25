const fs = require('fs');
const os = require('os');
const path = require('path');
const { runMain } = require('../skills/builder/scripts/build-deck');

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'compro-golden-'));
  const slug = 'golden';
  fs.mkdirSync(path.join(tmp, 'compros', slug, 'drafts'), { recursive: true });
  fs.copyFileSync(
    path.join(__dirname, '..', 'test-fixtures', 'expected', '02-final.modern.md'),
    path.join(tmp, 'compros', slug, 'drafts', '02-final.md')
  );
  const prevCwd = process.cwd();
  process.chdir(tmp);
  // Capture the asset tier summary the builder prints. Whether real rasters
  // landed depends on the network, so the raster assertions below are gated on
  // the catalog actually answering instead of failing an airgapped run.
  const logs = [];
  const origLog = console.log;
  console.log = (...args) => { logs.push(args.join(' ')); origLog(...args); };
  let assetLog = '';
  try {
    await runMain(['--name=' + slug, '--root=' + tmp]);
  } finally {
    console.log = origLog;
    process.chdir(prevCwd);
  }
  assetLog = logs.find(l => l.includes('[ASSETS] elapsed=')) || '';
  const catalogHits = Number((assetLog.match(/catalog=(\d+)/) || [])[1] || 0);
  const html = fs.readFileSync(path.join(tmp, 'compros', slug, 'index.html'), 'utf8');
  // Assert 1: article count equals slide count in fixture
  const md = fs.readFileSync(path.join(tmp, 'compros', slug, 'drafts', '02-final.md'), 'utf8');
  const expected = (md.match(/^# /gm) || []).length;
  const articles = (html.match(/<article[\s>]/g) || []).length;
  if (articles !== expected) { console.error(`FAIL: articles ${articles} != slides ${expected}`); process.exit(1); }
  // Assert 2: zero foster-parenting (reuse structural rule: no nested article)
  let depth = 0;
  for (const m of html.matchAll(/<\/?article[\s>]/g)) {
    depth += m[0][1] === '/' ? -1 : 1;
    if (depth > 1) { console.error('FAIL: nested article found'); process.exit(1); }
  }
  // Assert 3: every img is local, >10KB... (SVG fallback exempt from size rule), unique md5 for jpgs
  const crypto = require('crypto');
  const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => m[1]);
  if (imgs.length === 0) { console.error('FAIL: no images rendered'); process.exit(1); }
  const seen = new Set();
  let rasterCount = 0;
  let svgDataUriCount = 0;
  for (const src of imgs) {
    if (/^https?:/.test(src)) { console.error('FAIL: hotlinked image ' + src); process.exit(1); }
    // Tier 3 inlines the slot fallback SVG as a base64 data URI on purpose: the
    // deck stays self-contained and never emits an `assets/*.svg` <img>. It is a
    // valid asset, so it is counted rather than treated as a missing file.
    if (/^data:image\/svg\+xml;base64,/.test(src)) { svgDataUriCount++; continue; }
    const p = path.join(tmp, 'compros', slug, src);
    if (!fs.existsSync(p)) { console.error('FAIL: missing asset ' + src); process.exit(1); }
    if (p.endsWith('.jpg') && fs.statSync(p).size <= 10240) { console.error('FAIL: tiny asset ' + src); process.exit(1); }
    if (p.endsWith('.svg') && fs.statSync(p).size === 0) { console.error('FAIL: empty SVG asset ' + src); process.exit(1); }
    if (p.endsWith('.jpg')) {
      rasterCount++;
      const md5 = crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');
      if (seen.has(md5)) { console.error('FAIL: duplicate image bytes for ' + src); process.exit(1); }
      seen.add(md5);
    }
  }
  // When the catalog answered, at least one real raster must have landed — that
  // proves tier 1b/2 actually work and the golden run did not silently degrade
  // into an all-SVG deck.
  if (catalogHits > 0 && rasterCount === 0) {
    console.error(`FAIL: catalog returned ${catalogHits} hit(s) but no raster landed (${svgDataUriCount} SVG fallbacks)`);
    process.exit(1);
  }
  if (/<img[^>]+src="assets\/[^"]*\.svg"/.test(html)) { console.error('FAIL: local SVG img reference found'); process.exit(1); }
  // Assert 4: Aperture Cinematic key classes present
  const apertureClasses = [
    'deck-container',
    'deck-header',
    'deck-stage',
    'slide-item',
    'slide-cover',
    'slide-problem',
    'slide-product',
    'slide-features',
    'slide-usp',
    'slide-pricing',
    'slide-metrics',
    'slide-ecosystem',
    'slide-closing'
  ];
  for (const cls of apertureClasses) {
    if (!html.includes(cls)) { console.error('FAIL: missing key element ' + cls); process.exit(1); }
  }
  // Assert 4b: the contact/CTA slide keeps its own archetype. Regression guard:
  // it used to fall through the zero-tier pricing guard into a features list.
  if (!/<div class="slide-closing">/.test(html)) { console.error('FAIL: closing slide did not render the slide-closing layout'); process.exit(1); }
  // Assert 4c: reviewer contact placeholders must never be published raw, and
  // must never be replaced by fabricated contact data (Zero-Hallucination).
  const rawPlaceholders = html.match(/\[(?:Nomor WhatsApp|Email Resmi|Alamat Kantor|Tautan Pendaftaran|Kontak PIC)\]/g);
  if (rawPlaceholders) { console.error('FAIL: raw contact placeholder leaked into the deck: ' + rawPlaceholders.join(', ')); process.exit(1); }
  if (/contact@[a-z0-9-]+\.pro/i.test(html)) { console.error('FAIL: fabricated contact e-mail in deck'); process.exit(1); }
  for (const fabricated of ['+62 812-9000-8899', 'Jakarta Selatan, DKI Jakarta']) {
    if (html.includes(fabricated)) { console.error('FAIL: fabricated contact data in deck: ' + fabricated); process.exit(1); }
  }
  // The fixture's contact slide has no contact data in the input docs -> the
  // explicit non-fabricated marker must be what the audience sees.
  if (!html.includes('Belum tersedia')) { console.error('FAIL: unresolved contact placeholder did not render the explicit marker'); process.exit(1); }
  // Assert 4d: no empty metric holes in the 2x2 spec matrix. A slide with no
  // figures renders `.stat-cell.no-metric` (label as primary content) instead.
  if (/<div class="stat-metric">\s*<\/div>/.test(html)) { console.error('FAIL: empty .stat-metric cell rendered'); process.exit(1); }
  if (/<div class="metric-value">\s*<\/div>/.test(html)) { console.error('FAIL: empty .metric-value cell rendered'); process.exit(1); }
  // Assert 4f: the 8th/9th archetypes render their own layout instead of
  // borrowing the product layout through the positional fallback.
  if (!/<div class="slide-metrics">/.test(html)) { console.error('FAIL: traction/proof slide did not render slide-metrics'); process.exit(1); }
  if (!/<div class="slide-ecosystem">/.test(html)) { console.error('FAIL: architecture slide did not render slide-ecosystem'); process.exit(1); }
  // Assert 4g: figure fidelity — the bold token the writer emphasised is the
  // figure that ships. Regression guard: `20:1` used to render as `3:1`.
  if (!html.includes('20:1')) { console.error('FAIL: the 20:1 figure is missing from the deck'); process.exit(1); }
  if (/<div class="metric-value">3:1<\/div>/.test(html)) { console.error('FAIL: misparsed metric — 20:1 rendered as 3:1'); process.exit(1); }
  // Assert 4e: build.log reports real content words (markers/directives excluded)
  const buildLog = fs.readFileSync(path.join(tmp, 'compros', slug, 'reports', 'build.log'), 'utf8');
  for (const m of buildLog.matchAll(/Slide \d+ \[[A-Z ]+\]: .* \((\d+) words\)/g)) {
    const n = Number(m[1]);
    if (n > 70) { console.error(`FAIL: build.log word count ${n} exceeds the 60-word slide budget (+chrome) — marker/directive inflation`); process.exit(1); }
  }
  // Assert 5: HTML density guardrails (§7). Strict 40-60 word budget is enforced
  // at markdown level (test-writer-schema.js) + splitter unit tests
  // (test-density-split.js); HTML allows chrome overhead (badges, CTAs, captions),
  // so cap is 120 words/article to catch runaway dense slides without false positives.
  const articleHtml = [...html.matchAll(/<article[\s>][\s\S]*?<\/article>/g)].map(m => m[0]);
  for (let i = 0; i < articleHtml.length; i++) {
    const aHtml = articleHtml[i];
    const liCount = (aHtml.match(/<li[\s>]/g) || []).length;
    if (liCount > 10) { console.error(`FAIL: article ${i + 1} has ${liCount} <li> (expected <=10)`); process.exit(1); }
    const textOnly = aHtml.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
    const wCount = textOnly.split(/\s+/).filter(Boolean).length;
    if (wCount > 120) { console.error(`FAIL: article ${i + 1} has ${wCount} words (expected <=120 incl. chrome; markdown budget 40-60)`); process.exit(1); }
  }
  console.log('PASS: modern golden DOM asserts hold');
  process.exit(0);
})().catch(e => { console.error('FAIL: ' + e.message); process.exit(1); });
