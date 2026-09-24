// scripts/test-cinematic-classifier.js — Task 1 parity test (Aperture Cinematic migration).
// Asserts the single authoritative classifier `classifyCinematicArchetype`,
// the exact cinematic slot mapping, the deprecated alias delegation, and the
// asset-pipeline wiring (resolveSlideSlot + imageFetcher SLOT_MAP coverage).
const {
  classifyCinematicArchetype,
  CINEMATIC_ARCHETYPES,
  CINEMATIC_SLOT_MAP,
  classifyModernArchetype
} = require('../skills/builder/scripts/themes/modern');
const buildDeck = require('../skills/builder/scripts/build-deck');
const imageFetcher = require('../skills/builder/scripts/image-fetcher');

function assert(cond, msg) { if (!cond) { console.error('FAIL: ' + msg); process.exit(1); } }

assert(typeof classifyCinematicArchetype === 'function', 'classifyCinematicArchetype missing (unified classifier not implemented)');
assert(Array.isArray(CINEMATIC_ARCHETYPES) && CINEMATIC_ARCHETYPES.join(',') === 'cover,problem,product,features,usp,pricing',
  'CINEMATIC_ARCHETYPES must be exactly [cover,problem,product,features,usp,pricing], got ' + JSON.stringify(CINEMATIC_ARCHETYPES));
assert(CINEMATIC_SLOT_MAP && CINEMATIC_SLOT_MAP.cover === 'hero' && CINEMATIC_SLOT_MAP.problem === 'problem' &&
  CINEMATIC_SLOT_MAP.product === 'macro' && CINEMATIC_SLOT_MAP.features === 'hands' &&
  CINEMATIC_SLOT_MAP.usp === 'viewfinder' && CINEMATIC_SLOT_MAP.pricing === 'lens',
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
  [{ title: 'Hubungi Kami', content: 'Mulai hari ini.' }, 5, 6, 'pricing'],
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
}

console.log('PASS: cinematic classifier parity (6 archetypes) + slot mapping + alias delegation + asset wiring');
process.exit(0);
