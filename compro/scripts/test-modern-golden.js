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
  await runMain(['--name=' + slug, '--root=' + tmp]);
  process.chdir(prevCwd);
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
  for (const src of imgs) {
    if (/^https?:/.test(src)) { console.error('FAIL: hotlinked image ' + src); process.exit(1); }
    const p = path.join(tmp, 'compros', slug, src);
    if (!fs.existsSync(p)) { console.error('FAIL: missing asset ' + src); process.exit(1); }
    if (p.endsWith('.jpg') && fs.statSync(p).size <= 10240) { console.error('FAIL: tiny asset ' + src); process.exit(1); }
    if (p.endsWith('.svg') && fs.statSync(p).size === 0) { console.error('FAIL: empty SVG asset ' + src); process.exit(1); }
    if (p.endsWith('.jpg')) {
      const md5 = crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');
      if (seen.has(md5)) { console.error('FAIL: duplicate image bytes for ' + src); process.exit(1); }
      seen.add(md5);
    }
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
    'slide-pricing'
  ];
  for (const cls of apertureClasses) {
    if (!html.includes(cls)) { console.error('FAIL: missing key element ' + cls); process.exit(1); }
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
