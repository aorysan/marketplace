// scripts/test-modern-render.js — Tests for 6 Figma Cinematic Archetype Renderers + Dispatcher
const modern = require('../skills/builder/scripts/themes/modern');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL: ' + msg);
    process.exit(1);
  }
}

const brand = { name: 'Aperture Instruments', primaryColor: '#ff3b1d' };

// Verify exports exist
const expectedExports = [
  'renderCover',
  'renderProblem',
  'renderProduct',
  'renderFeatures',
  'renderUsp',
  'renderPricing',
  'renderMetrics',
  'renderEcosystem',
  'renderClosing',
  'renderCinematicSlide',
  'renderModernSlide'
];
// Legacy multi-theme renderers were removed with the template consolidation:
// keeping them around while their CSS is gone silently produced unstyled slides.
for (const deadName of [
  'renderModernHero', 'renderModernWelcome', 'renderModernServices', 'renderFeatureCards',
  'renderFeatureSplit', 'renderModernEcosystem', 'renderModernMetrics',
  'renderModernDifferentiator', 'renderModernPricing', 'renderModernClosing',
  'renderModernSocialProof'
]) {
  assert(modern[deadName] === undefined, `Legacy renderer ${deadName} must not be exported (dead code)`);
}
for (const fnName of expectedExports) {
  assert(typeof modern[fnName] === 'function', `Export ${fnName} must be a function`);
}

// 1. Test renderCover
{
  const slide = {
    title: 'Cinema, pocket-sized.',
    kicker: 'Model 01 / Vermilion',
    status: 'Now shipping',
    subtitle: 'A full-frame cinema sensor in a body you forget you are carrying. Shoot 6K RAW anywhere.'
  };
  const html = modern.renderCover(slide, brand, 0, '', 6);
  assert(html.includes('<article class="slide-item active" id="slide-0">'), 'renderCover: article container with active class and id slide-0');
  assert(html.includes('<div class="slide-cover">'), 'renderCover: slide-cover wrapper');
  assert(html.includes('class="bg-img"'), 'renderCover: bg-img class');
  assert(html.includes('<div class="overlay-t"></div>'), 'renderCover: overlay-t');
  assert(html.includes('<div class="overlay-r"></div>'), 'renderCover: overlay-r');
  assert(html.includes('<div class="content">'), 'renderCover: content wrapper');
  assert(html.includes('<div class="top-meta">'), 'renderCover: top-meta wrapper');
  assert(html.includes('Aperture Instruments'), 'renderCover: brand name');
  assert(html.includes('status-pill'), 'renderCover: status-pill');
  assert(html.includes('status-dot'), 'renderCover: status-dot');
  assert(html.includes('mono-kicker'), 'renderCover: mono-kicker');
  assert(html.includes('Model 01 / Vermilion'), 'renderCover: kicker content');
  assert(html.includes('hero-title'), 'renderCover: hero-title class');
  assert(html.includes('Cinema, pocket-sized.'), 'renderCover: title content');
  assert(html.includes('hero-sub'), 'renderCover: hero-sub class');
  assert(html.includes('A full-frame cinema sensor'), 'renderCover: subtitle content');

  // Test flexible assetUrl signature
  const customAssetHtml = modern.renderCover(slide, brand, 'https://example.com/cover.jpg');
  assert(customAssetHtml.includes('src="https://example.com/cover.jpg"'), 'renderCover: accepts assetUrl as 3rd arg');

  // Test object map signature (Minor finding 1)
  const mapAssetHtml = modern.renderCover(slide, brand, { cover: 'https://example.com/map-cover.jpg' });
  assert(mapAssetHtml.includes('src="https://example.com/map-cover.jpg"'), 'renderCover: accepts object map { cover: url } as 3rd arg');
  const heroMapAssetHtml = modern.renderCover(slide, brand, { hero: 'https://example.com/map-hero.jpg' });
  assert(heroMapAssetHtml.includes('src="https://example.com/map-hero.jpg"'), 'renderCover: accepts object map { hero: url } as 3rd arg');
}

// 2. Test renderProblem
{
  const slide = {
    title: 'Great cameras are still a burden to carry.',
    kicker: 'The problem',
    caption: 'The old way',
    content: '- **Too heavy to travel** — Pro bodies with lenses cross 2kg.\n- **A rig for everything** — Recorders, cages and cables.\n- **Slow to the moment** — Boot times and buffering.'
  };
  const html = modern.renderProblem(slide, brand, 1, '', 6);
  assert(html.includes('<article class="slide-item" id="slide-1">'), 'renderProblem: article container');
  assert(html.includes('<div class="slide-problem">'), 'renderProblem: slide-problem class');
  assert(html.includes('ghost-text ghost-no'), 'renderProblem: ghost-text ghost-no');
  assert(html.includes('NO'), 'renderProblem: NO watermark');
  assert(html.includes('<div class="img-col">'), 'renderProblem: img-col');
  assert(html.includes('The old way'), 'renderProblem: caption');
  assert(html.includes('<div class="text-col">'), 'renderProblem: text-col');
  assert(html.includes('The problem'), 'renderProblem: kicker');
  assert(html.includes('headline'), 'renderProblem: headline');
  assert(html.includes('Great cameras are still a burden'), 'renderProblem: title');
  assert(html.includes('problem-list'), 'renderProblem: problem-list');
  assert(html.includes('problem-item'), 'renderProblem: problem-item');
  assert(html.includes('num'), 'renderProblem: num');
  assert(html.includes('01'), 'renderProblem: item 01');
  assert(html.includes('02'), 'renderProblem: item 02');
  assert(html.includes('03'), 'renderProblem: item 03');
  assert(html.includes('Too heavy to travel'), 'renderProblem: card title');
  assert(html.includes('Pro bodies with lenses cross 2kg'), 'renderProblem: card desc');

  // Test flexible assetUrl signature
  const customAssetHtml = modern.renderProblem(slide, brand, 'https://example.com/problem.jpg');
  assert(customAssetHtml.includes('src="https://example.com/problem.jpg"'), 'renderProblem: accepts assetUrl as 3rd arg');
}

// 3. Test renderProduct
{
  const slide = {
    title: 'One body. Every format.',
    kicker: 'The product',
    badge: 'Machined aluminium · IP54',
    content: 'Records true full-frame 6K RAW internally.\n\n- **0.9s** — Cold start\n- **14** — Stops DR\n- **214g** — Body weight\n- **140m** — 6K runtime'
  };
  const html = modern.renderProduct(slide, brand, 2, '', 6);
  assert(html.includes('<article class="slide-item" id="slide-2">'), 'renderProduct: article container');
  assert(html.includes('<div class="slide-product">'), 'renderProduct: slide-product class');
  assert(html.includes('<div class="img-col">'), 'renderProduct: img-col');
  assert(html.includes('badge-floating'), 'renderProduct: badge-floating class');
  assert(html.includes('Machined aluminium · IP54'), 'renderProduct: floating badge text');
  assert(html.includes('<div class="text-col">'), 'renderProduct: text-col');
  assert(html.includes('The product'), 'renderProduct: kicker');
  assert(html.includes('headline'), 'renderProduct: headline');
  assert(html.includes('One body. Every format.'), 'renderProduct: title');
  assert(html.includes('desc'), 'renderProduct: desc class');
  assert(html.includes('Records true full-frame 6K RAW internally.'), 'renderProduct: desc content');
  assert(html.includes('stats-grid'), 'renderProduct: stats-grid');
  assert(html.includes('stat-cell'), 'renderProduct: stat-cell');
  assert(html.includes('stat-metric'), 'renderProduct: stat-metric');
  assert(html.includes('stat-label'), 'renderProduct: stat-label');
  assert(html.includes('0.9s'), 'renderProduct: stat metric 0.9s');
  assert(html.includes('Cold start'), 'renderProduct: stat label Cold start');
  assert(html.includes('14'), 'renderProduct: stat metric 14');
  assert(html.includes('214g'), 'renderProduct: stat metric 214g');
  assert(html.includes('140m'), 'renderProduct: stat metric 140m');

  // Test flexible assetUrl signature
  const customAssetHtml = modern.renderProduct(slide, brand, 'https://example.com/product.jpg');
  assert(customAssetHtml.includes('src="https://example.com/product.jpg"'), 'renderProduct: accepts assetUrl as 3rd arg');
}

// 4. Test renderFeatures
{
  const slide = {
    title: 'Everything, on board.',
    kicker: 'Key features',
    railLabel: 'On board — everything you need',
    content: '- **Full-frame 6K sensor** — 24.6MP · 6K/60 · 12-bit RAW · 14 stops of latitude.\n- **Pocketable body** — Machined aluminium · 214g.\n- **All-day power** — 140 min of 6K per cell.\n- **Native ProRes** — Record ProRes 422 HQ straight to CFexpress.'
  };
  const html = modern.renderFeatures(slide, brand, 3, '', 6);
  assert(html.includes('<article class="slide-item" id="slide-3">'), 'renderFeatures: article container');
  assert(html.includes('<div class="slide-features">'), 'renderFeatures: slide-features class');
  assert(html.includes('<div class="img-col">'), 'renderFeatures: img-col');
  assert(html.includes('rail-label'), 'renderFeatures: rail-label');
  assert(html.includes('On board — everything you need'), 'renderFeatures: rail label text');
  assert(html.includes('<div class="content-col">'), 'renderFeatures: content-col');
  assert(html.includes('features-header'), 'renderFeatures: features-header');
  assert(html.includes('sub-counter'), 'renderFeatures: sub-counter');
  assert(html.includes('features-list'), 'renderFeatures: features-list');
  assert(html.includes('feature-row'), 'renderFeatures: feature-row');
  assert(html.includes('feature-num'), 'renderFeatures: feature-num');
  assert(html.includes('01'), 'renderFeatures: feature num 01');
  assert(html.includes('feature-name'), 'renderFeatures: feature-name');
  assert(html.includes('Full-frame 6K sensor'), 'renderFeatures: feature name');
  assert(html.includes('feature-detail'), 'renderFeatures: feature-detail');
  assert(html.includes('24.6MP · 6K/60'), 'renderFeatures: feature detail');

  // Test flexible assetUrl signature
  const customAssetHtml = modern.renderFeatures(slide, brand, 'https://example.com/features.jpg');
  assert(customAssetHtml.includes('src="https://example.com/features.jpg"'), 'renderFeatures: accepts assetUrl as 3rd arg');
}

// 5. Test renderUsp
{
  const slide = {
    title: 'Three reasons it earns its place.',
    kicker: 'Why it wins',
    items: [
      { kicker: 'Speed', metric: '0.9s', title: 'Ready before the moment is gone', desc: 'The fastest wake time of any cinema body.' },
      { kicker: 'Range', metric: '14', title: 'Grade with room to spare', desc: 'Latitude no rival in this class can match.' },
      { kicker: 'Weight', metric: '214g', title: 'A camera you forget', desc: 'Lives on a gimbal, a drone, or in a pocket.' }
    ]
  };
  const html = modern.renderUsp(slide, brand, 4, '', 6);
  assert(html.includes('<article class="slide-item" id="slide-4">'), 'renderUsp: article container');
  assert(html.includes('<div class="slide-usp">'), 'renderUsp: slide-usp class');
  assert(html.includes('class="bg-img"'), 'renderUsp: bg-img class');
  assert(html.includes('<div class="overlay-v"></div>'), 'renderUsp: overlay-v');
  assert(html.includes('<div class="content">'), 'renderUsp: content wrapper');
  assert(html.includes('Why it wins'), 'renderUsp: kicker');
  assert(html.includes('Three reasons it earns its place.'), 'renderUsp: headline');
  assert(html.includes('usp-grid'), 'renderUsp: usp-grid');
  assert(html.includes('usp-card'), 'renderUsp: usp-card');
  assert(html.includes('usp-card-top'), 'renderUsp: usp-card-top');
  assert(html.includes('usp-kicker'), 'renderUsp: usp-kicker');
  assert(html.includes('Speed'), 'renderUsp: kicker Speed');
  assert(html.includes('usp-card-num'), 'renderUsp: usp-card-num');
  assert(html.includes('01'), 'renderUsp: card num 01');
  assert(html.includes('usp-metric'), 'renderUsp: usp-metric');
  assert(html.includes('0.9s'), 'renderUsp: metric 0.9s');
  assert(html.includes('usp-title'), 'renderUsp: usp-title');
  assert(html.includes('Ready before the moment is gone'), 'renderUsp: title text');
  assert(html.includes('usp-detail'), 'renderUsp: usp-detail');
  assert(html.includes('The fastest wake time of any cinema body.'), 'renderUsp: detail text');

  // Test flexible assetUrl signature
  const customAssetHtml = modern.renderUsp(slide, brand, 'https://example.com/usp.jpg');
  assert(customAssetHtml.includes('src="https://example.com/usp.jpg"'), 'renderUsp: accepts assetUrl as 3rd arg');

  // Test markdown bullet parsing in USP
  const mdUspSlide = {
    title: 'Why It Wins',
    content: '- **0.9s** — Ready before the moment is gone: The fastest wake time.\n- **14** — Grade with room to spare: Latitude no rival can match.\n- **214g** — A camera you forget: Lives on a gimbal.'
  };
  const mdUspHtml = modern.renderUsp(mdUspSlide, brand, 4, '', 6);
  assert(mdUspHtml.includes('0.9s'), 'renderUsp: markdown bullet metric 0.9s');
  assert(mdUspHtml.includes('14'), 'renderUsp: markdown bullet metric 14');
  assert(mdUspHtml.includes('214g'), 'renderUsp: markdown bullet metric 214g');
  assert(mdUspHtml.includes('Ready before the moment is gone'), 'renderUsp: markdown bullet title');
}

// 6. Test renderPricing
{
  const slide = {
    title: 'Pick a configuration.',
    kicker: 'Get yours',
    content: '| Tier | Harga | Fitur |\n|---|---|---|\n| ONE Body | $1,899 | 6K/60 RAW; 1x cell; 256GB CFexpress; 1-yr warranty |\n| ONE Rig | $2,449 | Everything in Body; 3x cells; Cage + handle; 512GB CFexpress |\n| ONE Studio | $3,299 | Everything in Rig; Charger dock; ND filter set; Priority support |'
  };
  const html = modern.renderPricing(slide, brand, 5, '', 6);
  assert(html.includes('<article class="slide-item" id="slide-5">'), 'renderPricing: article container');
  assert(html.includes('<div class="slide-pricing">'), 'renderPricing: slide-pricing class');
  assert(html.includes('<div class="img-col">'), 'renderPricing: img-col');
  assert(html.includes('overlay-gradient'), 'renderPricing: overlay-gradient');
  assert(html.includes('rail-content'), 'renderPricing: rail-content');
  assert(html.includes('rail-title'), 'renderPricing: rail-title');
  assert(html.includes('Siap mulai.'), 'renderPricing: default rail title is Indonesian');
  assert(html.includes('rail-sub'), 'renderPricing: rail-sub');
  assert(html.includes('Pendampingan dari awal'), 'renderPricing: default rail sub is Indonesian');
  assert(html.includes('<div class="content-col">'), 'renderPricing: content-col');
  assert(html.includes('Get yours'), 'renderPricing: kicker');
  assert(html.includes('Pick a configuration.'), 'renderPricing: headline');
  assert(html.includes('pricing-grid'), 'renderPricing: pricing-grid');
  assert(html.includes('tier-card'), 'renderPricing: tier-card');
  assert(html.includes('tier-card featured'), 'renderPricing: middle tier has featured class');
  assert(html.includes('tier-top'), 'renderPricing: tier-top');
  assert(html.includes('tier-name'), 'renderPricing: tier-name');
  assert(html.includes('ONE Body'), 'renderPricing: tier 1 name');
  assert(html.includes('ONE Rig'), 'renderPricing: tier 2 name');
  assert(html.includes('ONE Studio'), 'renderPricing: tier 3 name');
  assert(html.includes('tier-price'), 'renderPricing: tier-price');
  assert(html.includes('$1,899'), 'renderPricing: price 1');
  assert(html.includes('$2,449'), 'renderPricing: price 2');
  assert(html.includes('tier-features'), 'renderPricing: tier-features');
  assert(html.includes('tier-feature-item'), 'renderPricing: tier-feature-item');
  assert(html.includes('tier-btn'), 'renderPricing: tier-btn');

  // Test flexible assetUrl signature
  const customAssetHtml = modern.renderPricing(slide, brand, 'https://example.com/pricing.jpg');
  assert(customAssetHtml.includes('src="https://example.com/pricing.jpg"'), 'renderPricing: accepts assetUrl as 3rd arg');
}

// 7. Test renderClosing (7th archetype: CTA & contact)
{
  const slide = {
    title: 'Hubungi Kami',
    content: 'Dari template generik menuju produksi ber-brand konsisten.\n\n- **WhatsApp** : [Nomor WhatsApp]\n- **Email & Alamat** : [Email Resmi], [Alamat Kantor]'
  };
  const html = modern.renderClosing(slide, brand, 6, '', 7);
  assert(html.includes('<article class="slide-item" id="slide-6">'), 'renderClosing: article container');
  assert(html.includes('<div class="slide-closing">'), 'renderClosing: slide-closing class');
  assert(html.includes('<div class="img-col">'), 'renderClosing: img-col');
  assert(html.includes('rail-label'), 'renderClosing: rail-label');
  assert(html.includes('Langkah berikutnya'), 'renderClosing: Indonesian default rail label');
  assert(html.includes('mono-kicker'), 'renderClosing: kicker');
  assert(html.includes('Hubungi kami'), 'renderClosing: Indonesian default kicker');
  assert(html.includes('headline'), 'renderClosing: headline');
  assert(html.includes('closing-desc'), 'renderClosing: desc');
  assert(html.includes('closing-contacts'), 'renderClosing: contacts grid');
  assert(html.includes('contact-row'), 'renderClosing: contact-row');
  assert(html.includes('contact-label'), 'renderClosing: contact-label');
  assert(html.includes('contact-value'), 'renderClosing: contact-value');
  assert(html.includes('WhatsApp'), 'renderClosing: contact label WhatsApp');
  // Contract: reviewer placeholders must never leak as raw brackets AND must
  // never be replaced with fabricated phone numbers/e-mails (Zero-Hallucination).
  assert(!/\[Nomor WhatsApp\]/.test(html), 'renderClosing: raw [Nomor WhatsApp] placeholder must not leak');
  assert(!/\[Email Resmi\]|\[Alamat Kantor\]/.test(html), 'renderClosing: raw contact placeholders must not leak');
  assert(!/\+62 812-9000-8899/.test(html), 'renderClosing: must not fabricate a phone number');
  assert(!/contact@/.test(html), 'renderClosing: must not fabricate an e-mail address');
  assert(html.includes('Belum tersedia'), 'renderClosing: unresolved contact renders the explicit marker');
  assert(html.includes('closing-cta'), 'renderClosing: CTA present');
  assert(!/<a class="closing-cta" href/.test(html), 'renderClosing: no fabricated href when no real contact was supplied');

  // Real contact data in -> real link out (mailto), never invented
  const linkedHtml = modern.renderClosing(
    { title: 'Hubungi Kami', content: '- **Email** : halo@maju.co.id' }, brand, 6, '', 7);
  assert(linkedHtml.includes('href="mailto:halo@maju.co.id"'), 'renderClosing: derives a mailto link from supplied data');

  // Flexible assetUrl signature
  const customAssetHtml = modern.renderClosing(slide, brand, 'https://example.com/closing.jpg');
  assert(customAssetHtml.includes('src="https://example.com/closing.jpg"'), 'renderClosing: accepts assetUrl as 3rd arg');
}

// 8. Test renderMetrics (8th archetype: traction & proof band)
// Native Aperture extension — the Figma export only shipped 6 pages, so this
// layout was designed to match DESIGN_SYSTEM.md instead of being ported.
{
  const slide = {
    title: 'Pencapaian & Bukti',
    content: 'Unit economics yang sehat sudah tercapai di volume saat ini.\n\n- **~90%** — margin kotor per user\n- **20:1** — rasio LTV:CAC\n- **3-tier** — Free, Pro, Brand/Team\n\n**Intinya:** butuh GPU 8 GB awal.'
  };
  const html = modern.renderMetrics(slide, brand, 7, '', 9);
  assert(html.includes('<article class="slide-item" id="slide-7">'), 'renderMetrics: article container');
  assert(html.includes('<div class="slide-metrics">'), 'renderMetrics: slide-metrics class');
  assert(html.includes('band-col'), 'renderMetrics: band-col');
  assert(html.includes('metrics-band'), 'renderMetrics: metrics-band');
  assert(html.includes('metric-cell'), 'renderMetrics: metric-cell');
  assert(html.includes('metric-value'), 'renderMetrics: metric-value');
  assert(html.includes('metric-label'), 'renderMetrics: metric-label');
  assert(html.includes('~90%'), 'renderMetrics: renders the ~90% figure');
  assert(html.includes('20:1'), 'renderMetrics: renders the 20:1 figure');
  assert(html.includes('3-tier'), 'renderMetrics: renders the 3-tier token intact');
  assert(!html.includes('>3:1<'), 'renderMetrics: must NOT misread 20:1 as the 3:1 narrative figure');
  assert(html.includes('Validasi &amp; metrik'), 'renderMetrics: Indonesian default kicker (HTML-escaped)');
  assert(html.includes('rail-label'), 'renderMetrics: rail-label over the figure band');
  assert(html.includes('metrics-note'), 'renderMetrics: honesty note from the **Intinya:** line');
  assert(html.includes('butuh GPU 8 GB awal.'), 'renderMetrics: honesty note keeps its text');

  const customAssetHtml = modern.renderMetrics(slide, brand, 'https://example.com/metrics.jpg');
  assert(customAssetHtml.includes('src="https://example.com/metrics.jpg"'), 'renderMetrics: accepts assetUrl as 3rd arg');

  // Zero metrics -> empty band + warn, never an invented figure.
  const emptyHtml = modern.renderMetrics({ title: 'Pencapaian', content: 'Tanpa bullet.' }, brand, 7, '', 9);
  assert(!emptyHtml.includes('metric-value'), 'renderMetrics: zero metrics must NOT render an invented figure');
}

// 9. Test renderEcosystem (9th archetype: system map)
// Nodes are { name, role } pairs; the layout must never invent structural
// defaults when the draft carries no bullets.
{
  const slide = {
    title: 'Arsitektur & Ekosistem',
    content: 'Orkestrasi pipeline multi-AI; satu state menjaga konteks tetap utuh.\n\n- **Groq (chat)** — Percakapan copilot pengguna.\n- **Gemini (director)** — Struktur dan arahan produksi.\n- **Cloudflare (gambar)** — Opening still tiap video.\n- **ComfyUI (GPU lokal)** — Render video di komputermu.'
  };
  const html = modern.renderEcosystem(slide, brand, 6, '', 9);
  assert(html.includes('<article class="slide-item" id="slide-6">'), 'renderEcosystem: article container');
  assert(html.includes('<div class="slide-ecosystem">'), 'renderEcosystem: slide-ecosystem class');
  assert(html.includes('<div class="img-col">'), 'renderEcosystem: img-col');
  assert(html.includes('class="caption"'), 'renderEcosystem: caption');
  assert(html.includes('Arsitektur sistem'), 'renderEcosystem: Indonesian default kicker');
  assert(html.includes('ecosystem-grid'), 'renderEcosystem: ecosystem-grid');
  assert(html.includes('ecosystem-node'), 'renderEcosystem: ecosystem-node');
  assert(html.includes('node-index'), 'renderEcosystem: node-index');
  assert(html.includes('node-name'), 'renderEcosystem: node-name');
  assert(html.includes('node-role'), 'renderEcosystem: node-role');
  assert(html.includes('Groq (chat)'), 'renderEcosystem: first node name');
  assert(html.includes('Percakapan copilot pengguna.'), 'renderEcosystem: first node role');
  assert(html.includes('ComfyUI (GPU lokal)'), 'renderEcosystem: fourth node rendered');
  assert(html.includes('Orkestrasi pipeline multi-AI'), 'renderEcosystem: intro text becomes the desc');
  assert(!html.includes('Node 1'), 'renderEcosystem: must NOT invent "Node 1" placeholder labels');

  const customAssetHtml = modern.renderEcosystem(slide, brand, 'https://example.com/ecosystem.jpg');
  assert(customAssetHtml.includes('src="https://example.com/ecosystem.jpg"'), 'renderEcosystem: accepts assetUrl as 3rd arg');

  // Zero nodes -> empty matrix + warn, never an invented node list.
  const emptyHtml = modern.renderEcosystem({ title: 'Ekosistem', content: 'Tanpa bullet.' }, brand, 6, '', 9);
  assert(!emptyHtml.includes('ecosystem-node'), 'renderEcosystem: zero nodes must NOT render invented nodes');
}

// 10. Test dispatcher renderCinematicSlide across all 9 archetypes
{
  const slides = [
    { title: 'Aperture Cinema', content: 'Hero cover slide', expectedClass: 'slide-cover' },
    { title: 'Masalah Kamera Tradisional', content: 'Pain points', expectedClass: 'slide-problem' },
    { title: 'Overview Produk Sensor', content: 'Product overview', expectedClass: 'slide-product' },
    { title: 'Fitur dan Kapabilitas', content: '- **A** — x', expectedClass: 'slide-features' },
    { title: 'Mengapa Kami Berbeda', content: 'Keunggulan kompetitif', expectedClass: 'slide-usp' },
    { title: 'Paket dan Harga', content: '| Tier | Harga | Fitur |\n|---|---|---|\n| A | $10 | F1 |', expectedClass: 'slide-pricing' },
    { title: 'Pencapaian & Bukti', content: '- **~90%** — margin kotor', expectedClass: 'slide-metrics' },
    { title: 'Arsitektur & Ekosistem', content: '- **Groq** — chat', expectedClass: 'slide-ecosystem' },
    { title: 'Hubungi Kami', content: '- **Email** : halo@maju.co.id', expectedClass: 'slide-closing' }
  ];

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    // Signature A: (slide, index, totalSlides, brand, assetsDir)
    const outA = modern.renderCinematicSlide(s, i, 9, brand, '');
    assert(outA.includes(s.expectedClass), `renderCinematicSlide (sig A) @${i} contains ${s.expectedClass}`);

    // Signature B: (slide, brand, assetMap)
    const outB = modern.renderCinematicSlide(s, brand, {});
    // When called with just slide, brand, assetMap, classification uses slide.index (if present) or falls back
    assert(typeof outB === 'string' && outB.length > 0, `renderCinematicSlide (sig B) returns HTML string`);

    // Verify renderModernSlide delegates to renderCinematicSlide
    const outModern = modern.renderModernSlide(s, i, 6, brand, '');
    assert(outModern === outA, `renderModernSlide delegates to renderCinematicSlide for archetype @${i}`);
    assert(i === 0 || !outA.includes('slide-item active'), `non-cover slide @${i} must not carry the active class`);
  }
}

// 11. Test generic company profile (No hallucinated camera demo defaults)
{
  const genericBrand = { name: 'PT Maju Digital' };

  // Cover: no kicker, no status provided -> no "Model 01", no "Vermilion", no status-pill
  const genericCoverSlide = {
    title: 'Transformasi Bisnis Modern',
    content: 'Solusi enterprise cloud dan integrasi sistem terpadu untuk efisiensi bisnis Anda.'
  };
  const genericCover = modern.renderCover(genericCoverSlide, genericBrand, 0, '', 6);
  assert(!genericCover.includes('Model 01'), 'generic cover must NOT contain "Model 01"');
  assert(!genericCover.includes('Vermilion'), 'generic cover must NOT contain "Vermilion"');
  assert(!genericCover.includes('status-pill'), 'generic cover without status must NOT have status-pill');

  // Product: no badge provided -> no "Machined aluminium", no badge-floating
  const genericProductSlide = {
    title: 'Platform Enterprise',
    content: 'Solusi modular untuk seluruh unit kerja.\n\n- **99.9%** — Uptime SLA\n- **500+** — Mitra aktif'
  };
  const genericProduct = modern.renderProduct(genericProductSlide, genericBrand, 2, '', 6);
  assert(!genericProduct.includes('Machined aluminium'), 'generic product must NOT contain "Machined aluminium"');
  assert(!genericProduct.includes('badge-floating'), 'generic product without badge must NOT have badge-floating');

  // USP: non-numeric bullets -> metric MUST be empty, title must NOT be duplicated into metric
  const genericUspSlide = {
    title: 'Keunggulan Kami',
    content: '- **Keandalan Tinggi** — Sistem terjamin dengan proteksi multi-region.\n- **Dukungan Penuh** — Pendampingan implementasi dari awal hingga tuntas.'
  };
  const genericUsp = modern.renderUsp(genericUspSlide, genericBrand, 4, '', 6);
  assert(!genericUsp.includes('class="usp-metric">Keandalan'), 'non-numeric USP bullet must NOT duplicate title in metric');
  assert(!genericUsp.includes('100%'), 'non-numeric USP bullet must NOT invent 100%');
  assert(genericUsp.includes('Keandalan Tinggi'), 'generic USP contains card title');
  assert(genericUsp.includes('Sistem terjamin dengan proteksi multi-region.'), 'generic USP contains card description');
}

console.log('PASS: all 9 cinematic archetypes + dispatcher + closing contract + alias tests passed');
process.exit(0);
