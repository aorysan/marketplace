// E2E: dense markdown through runMain must emit Part 1/2/3 sections (spec §§4-6).
// Dense slide sits in the middle (cover first, closing last) so archetype
// renderers (hero slice 3, closing) don't truncate the 4-bullet chunks.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runMain } = require('../skills/builder/scripts/build-deck');

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'compro-density-e2e-'));
  const slug = 'dense';
  fs.mkdirSync(path.join(tmp, 'compros', slug, 'drafts'), { recursive: true });
  const bullets = Array.from({ length: 11 }, (_, i) => `- **Fitur ${i + 1}** — deskripsi singkat delapan kata pas`).join('\n');
  const md = [
    '# Venturo Pro Cover',
    '<!-- image: hero -- query: Modern office hero photo ; keywords: office, modern, team ; style: photo -->',
    'Intro cover singkat satu kalimat.',
    '',
    '# Layanan Unggulan',
    '<!-- image: services -- query: Modern community service photo ; keywords: community, service, modern ; style: photo -->',
    'Intro layanan singkat.',
    bullets,
    '',
    '# Hubungi Kami',
    '<!-- image: closing -- query: Friendly business handshake photo ; keywords: handshake, business, contact ; style: photo -->',
    'Kontak singkat untuk penutup.',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(tmp, 'compros', slug, 'drafts', '02-final.md'), md);
  const prevCwd = process.cwd();
  process.chdir(tmp);
  await runMain(['--name=' + slug, '--root=' + tmp]);
  process.chdir(prevCwd);
  const html = fs.readFileSync(path.join(tmp, 'compros', slug, 'index.html'), 'utf8');
  const slides = [...html.matchAll(/<article[\s>][\s\S]*?<\/article>/g)].map(m => m[0]);
  // 1 cover + 3 split services parts + 1 closing = 5
  if (slides.length !== 5) { console.error(`FAIL: dense build -> ${slides.length} slides, expected 5 (1 cover + 3 parts + 1 closing)`); process.exit(1); }
  const text = slides.map(s => s.replace(/<[^>]+>/g, ' ')).join('\n---\n');
  if (!text.includes('Part 2') || !text.includes('Part 3')) { console.error('FAIL: Part 2/3 continuation titles missing in HTML'); process.exit(1); }
  // No silent truncation: all 11 feature titles must appear somewhere
  for (let i = 1; i <= 11; i++) {
    if (!html.includes(`Fitur ${i}`)) { console.error(`FAIL: Fitur ${i} missing from output (truncated?)`); process.exit(1); }
  }
  console.log('PASS: density e2e 11 bullets -> 5 slides (cover + 3 parts + closing), no truncation');
  process.exit(0);
})().catch(e => { console.error('FAIL: ' + (e && e.message || e)); process.exit(1); });
