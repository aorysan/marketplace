// scripts/test-cinematic-classifier.js — Aperture Cinematic classifier parity test.
// Asserts the single authoritative classifier `classifyCinematicArchetype`, the
// exact cinematic slot mapping, the deprecated alias delegation, the
// asset-pipeline wiring (resolveSlideSlot + imageFetcher SLOT_MAP coverage), and
// that every archetype/slot vocabulary in the repo agrees (no drift between
// themes/modern.js, templates/modern/manifest.json and imageFetcher.SLOT_MAP).
const fs = require('fs');
const path = require('path');
const {
  classifyCinematicArchetype,
  CINEMATIC_ARCHETYPES,
  CINEMATIC_SLOT_MAP,
  classifyModernArchetype
} = require('../skills/builder/scripts/themes/modern');
const buildDeck = require('../skills/builder/scripts/build-deck');
const imageFetcher = require('../skills/builder/scripts/image-fetcher');

function assert(cond, msg) { if (!cond) { console.error('FAIL: ' + msg); process.exit(1); } }

const EXPECTED_ARCHETYPES = ['cover', 'problem', 'product', 'features', 'usp', 'pricing', 'metrics', 'ecosystem', 'closing'];
const EXPECTED_SLOTS = {
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

assert(typeof classifyCinematicArchetype === 'function', 'classifyCinematicArchetype missing (unified classifier not implemented)');
assert(Array.isArray(CINEMATIC_ARCHETYPES) && CINEMATIC_ARCHETYPES.join(',') === EXPECTED_ARCHETYPES.join(','),
  'CINEMATIC_ARCHETYPES must be exactly [' + EXPECTED_ARCHETYPES.join(',') + '], got ' + JSON.stringify(CINEMATIC_ARCHETYPES));
assert(CINEMATIC_SLOT_MAP && EXPECTED_ARCHETYPES.every(a => CINEMATIC_SLOT_MAP[a] === EXPECTED_SLOTS[a]),
  'CINEMATIC_SLOT_MAP mismatch, got ' + JSON.stringify(CINEMATIC_SLOT_MAP));

// --- Parity fixtures: { title, content } slide shape (build-deck pipeline shape) ---
const fixtures = [
  [{ title: 'PT Maju Jaya — Company Profile', content: 'Solusi digital untuk administrasi modern.' }, 0, 6, 'cover'],
  [{ title: 'Profil Perusahaan', content: 'Sekilas tentang kami.' }, 2, 6, 'cover'],
  [{ title: 'Masalah yang Dihadapi Industri', content: 'Biaya naik dan brand lepas dari kendali.' }, 1, 6, 'problem'],
  [{ title: 'Kondisi Saat Ini', content: 'Banyak pelanggan mengalami pain points dalam pengelolaan administrasi.' }, 3, 6, 'problem'],
  [{ title: 'Overview Solusi Produk Kami', content: 'Platform terpadu untuk seluruh kebutuhan.' }, 2, 6, 'product'],
  [{ title: 'Fitur dan Layanan Unggulan', content: '- **A** — x\n- **B** — y' }, 3, 6, 'features'],
  [{ title: 'Keunggulan Kompetitif Kami', content: 'Intro jujur perbandingan.' }, 4, 6, 'usp'],
  [{ title: 'Mengapa Memilih Kami', content: 'Alasan utama pelanggan bertahan.' }, 4, 6, 'usp'],
  [{ title: 'Why Us', content: 'Our added value proposition.' }, 4, 6, 'usp'],
  [{ title: 'Paket Harga dan Penawaran', content: 'Pilih tier sesuai kebutuhan, hubungi tim kami.' }, 5, 6, 'pricing'],
  [{ title: 'Investasi & Kerjasama', content: 'Tiga paket untuk tiga skala kebutuhan.' }, 6, 7, 'pricing'],
  // Contact / CTA slides own the `closing` archetype (must NOT fall through to
  // pricing, which used to degrade them into a features list + leaked placeholders).
  [{ title: 'Hubungi Kami', content: 'Mulai hari ini.' }, 5, 6, 'closing'],
  [{ title: 'Hubungi Kami', content: '- **WhatsApp** : [Nomor WhatsApp]' }, 9, 10, 'closing'],
  [{ title: 'Kontak Tim Kami', content: 'Kami siap membantu.' }, 6, 7, 'closing'],
  [{ title: 'Terima Kasih', content: 'Sampai jumpa di langkah berikutnya.' }, 7, 8, 'closing'],
  // Native Aperture extensions (not in the Figma export): traction/proof owns its
  // own figure band, architecture owns its own node matrix — neither borrows the
  // product layout any more.
  [{ title: 'Pencapaian & Bukti', content: '- **~90%** — margin kotor\n- **20:1** — rasio LTV:CAC' }, 7, 9, 'metrics'],
  [{ title: 'Traction & Proof', content: 'Metrik awal pertumbuhan.' }, 7, 10, 'metrics'],
  [{ title: 'Statistik Kinerja', content: 'Angka kunci periode ini.' }, 4, 9, 'metrics'],
  [{ title: 'Arsitektur & Ekosistem', content: '- **Groq** — chat' }, 6, 9, 'ecosystem'],
  [{ title: 'Integrasi Sistem', content: 'Alur kerja antar layanan internal.' }, 6, 9, 'ecosystem'],
  // metrics/ecosystem are TITLE-only: their vocabulary in another slide's body
  // must not steal that slide's layout.
  [{ title: 'Fitur Unggulan', content: 'Integrasi dengan banyak layanan dan pipeline data.' }, 3, 9, 'features'],
  [{ title: 'Tentang Kami', content: 'Pipeline dan ekosistem internal kami.' }, 1, 9, 'problem'],
  // Positional fallback for keyword-free titles
  [{ title: 'Tentang Kami', content: 'Cerita singkat perusahaan.' }, 1, 6, 'problem'],
  [{ title: 'Galeri Kegiatan', content: 'Dokumentasi aktivitas.' }, 3, 6, 'product']
];
for (const [slide, idx, total, expected] of fixtures) {
  const got = classifyCinematicArchetype(slide, idx, total);
  assert(got === expected, `classify(${JSON.stringify(slide.title)} @${idx}) = ${got}, expected ${expected}`);
  // Deprecated alias must delegate (no divergent logic)
  const aliasGot = classifyModernArchetype(slide, idx, total);
  assert(aliasGot === got, `alias diverged on ${JSON.stringify(slide.title)}: ${aliasGot} vs ${got}`);
}

// --- Backward-compat input shape: { h1, raw } ---
const rawShape = classifyCinematicArchetype({ h1: 'Paket Harga', raw: 'Daftar harga dan penawaran.' }, 4, 6);
assert(rawShape === 'pricing', 'raw/h1 slide shape must classify, got ' + rawShape);

// --- build-deck wiring: single classifier + slot resolution ---
assert(typeof buildDeck.classifyCanvaArchetype === 'function', 'classifyCanvaArchetype export must be preserved (deprecated alias)');
for (const [slide, idx, total, expected] of fixtures) {
  const legacy = buildDeck.classifyCanvaArchetype(slide, idx, total);
  assert(legacy === expected, `build-deck alias diverged on ${JSON.stringify(slide.title)}: ${legacy} vs ${expected}`);
  const slot = buildDeck.resolveSlideSlot(slide, idx, total);
  assert(slot === CINEMATIC_SLOT_MAP[expected],
    `resolveSlideSlot(${JSON.stringify(slide.title)}) = ${slot}, expected ${CINEMATIC_SLOT_MAP[expected]}`);
}
// Explicit image directive still wins over classifier (unchanged behavior)
const directiveSlot = buildDeck.resolveSlideSlot(
  { title: 'Fitur dan Layanan Unggulan', content: '<!-- image: solution -->\n- **A** — x' }, 3, 6);
assert(directiveSlot === 'solution', 'image directive must win, got ' + directiveSlot);

// --- Every slot value must resolve in imageFetcher SLOT_MAP (never undefined) ---
for (const arch of CINEMATIC_ARCHETYPES) {
  const slot = CINEMATIC_SLOT_MAP[arch];
  const cfg = imageFetcher.SLOT_MAP && imageFetcher.SLOT_MAP[slot];
  assert(cfg && typeof cfg.category === 'string' && imageFetcher.CURATED_IMAGE_CATALOG[cfg.category],
    `slot '${slot}' (archetype '${arch}') has no usable SLOT_MAP/CATALOG entry`);
  const fallback = path.join(__dirname, '..', 'skills', 'builder', 'templates', 'assets', 'fallback', cfg.fallback);
  assert(fs.existsSync(fallback), `slot '${slot}' fallback SVG missing: ${cfg.fallback}`);
}

// --- Anti-drift: template manifest must agree with the classifier SSOT ---
const manifest = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'skills', 'builder', 'templates', 'modern', 'manifest.json'), 'utf8'));
assert(Array.isArray(manifest.archetypes) && manifest.archetypes.join(',') === EXPECTED_ARCHETYPES.join(','),
  `manifest.archetypes out of sync with CINEMATIC_ARCHETYPES: ${JSON.stringify(manifest.archetypes)}`);
for (const arch of EXPECTED_ARCHETYPES) {
  assert(manifest.slots && manifest.slots[arch] === EXPECTED_SLOTS[arch],
    `manifest.slots[${arch}] = ${manifest.slots && manifest.slots[arch]}, expected ${EXPECTED_SLOTS[arch]}`);
}

// --- Anti-drift: every documented directive slot must resolve in SLOT_MAP ---
// (writer/reviewer SKILL.md instruct the agent to emit these names.)
const DOCUMENTED_DIRECTIVE_SLOTS = [
  'hero', 'problem', 'solution', 'services', 'ecosystem', 'metrics',
  'differentiator', 'pricing', 'closing', 'macro', 'hands', 'viewfinder', 'lens'
];
for (const slot of DOCUMENTED_DIRECTIVE_SLOTS) {
  assert(imageFetcher.SLOT_MAP[slot], `documented directive slot '${slot}' is not in imageFetcher.SLOT_MAP`);
}

console.log('PASS: cinematic classifier parity (9 archetypes) + slot mapping + alias delegation + manifest/asset wiring');
process.exit(0);
