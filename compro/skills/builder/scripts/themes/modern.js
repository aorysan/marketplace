/* themes/modern.js — Modern multi-template renderers (cover, welcome/problem+solution,
   services, ecosystem, metrics, differentiator, pricing, closing, social-proof + dispatcher).
   Direct ports of congen6 build_deck.py sections 1-4, adapted to generic
   { title, content } slides with shared parsers from ../build-deck.
   Zero-hallucination rule: render only parsed cards (cards.slice(0,4) as-is);
   never invent default services/cards. Empty grid + console.warn on zero cards.
*/
const {
  parseEditorialCards,
  extractBigNumberMetric,
  sanitizeSlideContent,
  sanitizeContactDetails,
  resolveSlideSlot,
  resolveSlideImageUrl
} = require('../build-deck');

// NOTE: `inline` is duplicated here verbatim from build-deck.js (8-line helper)
// to avoid cross-module HTML-escaping drift between theme renderers.
function inline(mdtext) {
  if (!mdtext) return '';
  return mdtext
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

function slideBadge(index, totalSlides) {
  return `${String(index + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
}

// Modern archetype classifier: title-keyword map over the 10 modern archetypes
// (cover/problem/solution/services/ecosystem/metrics/differentiator/pricing/
// closing/social-proof) with positional fallback.
function classifyModernArchetype(slide, index, totalSlides) {
  const t = (slide.title || '').toLowerCase();
  if (index === 0) return 'cover';
  if (index === totalSlides - 1 || /hubungi|kontak|contact|closing|cta/.test(t)) return 'closing';
  if (/testimoni|testimonial|klien|kepercayaan/.test(t)) return 'social-proof';
  if (/paket|harga|pricing|kerjasama|plan/.test(t)) return 'pricing';
  if (/mengapa|kenapa|why|differentiator|keunggulan kompetitif/.test(t)) return 'differentiator';
  if (/arsitektur|ekosistem|ecosystem|stack/.test(t)) return 'ecosystem';
  if (/pencapaian|bukti|traction|showcase|metric|statistik|angka|kpi/.test(t)) return 'metrics';
  if (/masalah|tantangan|pain|problem/.test(t)) return 'problem';
  const bulletCount = ((slide.content || '').match(/^[-*]\s/gm) || []).length;
  // Dense services/solution slides -> feature-cards (§4-§5.3). Density signal first,
  // title keywords only as scope guard so pricing/ecosystem/metrics/differentiator
  // (matched above) keep their dedicated renderers. Generic dense titles are covered:
  // any services/solution-scope title with >=4 bullets routes here, not just RT vocabulary.
  // Placed before `solution`/`services` so dense slides don't fall through to welcome layouts.
  if (bulletCount >= 4 && /layanan|fitur|services|feature|keunggulan|solusi|solution|nilai tambah|value|warga|iuran|kependudukan|mobile|whatsapp/i.test(t)) return 'feature-cards';
  if (/solusi|solution|nilai tambah|value/.test(t)) return 'solution';
  if (/profil|profile|tentang|cover/.test(t)) return 'cover';
  // Narrative / WA AI / spotlight slides -> feature-split (§4): text + adaptive photo.
  // Opt-in by content type (narrative/spotlight/WA keywords) + low bullet count so
  // dense card slides stay on feature-cards and hero/closing keeps its dedicated renderer.
  if (bulletCount <= 4 && /whatsapp|wa ai|narrative|narasi|sorotan|spotlight|cerita|aplikasi mobile/i.test(t)) return 'feature-split';
  if (/layanan|fitur|services|feature|keunggulan/.test(t)) return 'services';
  return index === 1 ? 'problem' : 'solution';
}

// Slide 1: Hero Cover — congen6 section 1 port (hero-layout-grid).
function renderModernHero(slide, brand, index = 0, assetsDir = '', totalSlides = 9) {
  const content = sanitizeSlideContent(slide.content || '').replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  let tagline = '';
  let desc = '';
  const statLines = [];
  for (const line of lines) {
    if (/^[-*]\s/.test(line)) {
      statLines.push(line);
    } else if (!tagline && !/^💼/u.test(line) && line.length > 5) {
      tagline = line;
    } else if (/^💼/u.test(line)) {
      desc = line.replace(/^💼\s*/u, '');
    } else if (!desc && line.length > 25) {
      desc = line;
    }
  }

  const targetSlot = resolveSlideSlot(slide, index, totalSlides, 'hero');
  const imgSrc = resolveSlideImageUrl(index + 1, targetSlot, assetsDir);

  const statsHtml = statLines.slice(0, 3).map(st => {
    const m = extractBigNumberMetric(st);
    return `
      <div class="hero-stat-card">
        <span class="hero-stat-value">${inline(m.number)}</span>
        <span class="hero-stat-desc">${inline(m.title ? `${m.title} ${m.desc}` : m.desc)}</span>
      </div>`;
  }).join('\n');

  return `
    <section>
      <div class="editorial-slide-container">
        <div class="hero-layout-grid">
          <div class="hero-left-panel">
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div class="hero-header-brand-row">
                <div class="hero-logo-mark">${inline(brand.name)}</div>
                <span class="slide-kicker-badge">Company Profile &amp; Pitch Deck</span>
                <span class="slide-index-badge" style="margin-left:auto;">${slideBadge(index, totalSlides)}</span>
              </div>
              <h1 class="hero-main-title">${inline(slide.title)}</h1>
              ${tagline ? `<p class="hero-deck-description">${inline(tagline)}</p>` : ''}
              ${desc ? `<p class="hero-deck-description">${inline(desc)}</p>` : ''}
            </div>
            ${statsHtml ? `<div class="hero-metrics-strip">${statsHtml}</div>` : ''}
          </div>
          <div class="editorial-image-frame">
            <img src="${imgSrc}" alt="${inline(slide.title)}" />
            ${tagline ? `<div class="image-floating-badge"><div class="dot"></div><span>${inline(tagline)}</span></div>` : ''}
          </div>
        </div>
      </div>
    </section>`;
}

// Slides 2 & 3: Problem / Solution — congen6 sections 2-3 port (two-col-layout-grid).
function renderModernWelcome(slide, brand, index = 1, type = 'problem', assetsDir = '', totalSlides = 9) {
  const content = sanitizeSlideContent(slide.content || '').trim();
  const { introText, cards } = parseEditorialCards(content);
  const isProblem = type === 'problem' || /masalah|tantangan|pain|problem/i.test(slide.title || '');
  const badgeText = isProblem ? 'Tantangan Industri' : 'Solusi & Nilai Tambah';
  const badgeClass = isProblem ? 'slide-kicker-badge danger' : 'slide-kicker-badge';
  const targetSlot = resolveSlideSlot(slide, index, totalSlides, isProblem ? 'problem' : 'solution');
  const imgSrc = resolveSlideImageUrl(index + 1, targetSlot, assetsDir);

  if (cards.length === 0) console.warn(`[modern] welcome slide ${index + 1} has zero cards; rendering empty grid`);
  const cardsHtml = cards.slice(0, 4).map((card, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `
      <div class="editorial-story-card">
        <div>
          <div class="card-top-row">
            <span class="card-number-badge${isProblem ? ' danger' : ''}">${num}</span>
            <span class="card-pill-tag${isProblem ? ' danger' : ' solution'}">${inline(badgeText)}</span>
          </div>
          <h3 class="card-main-title">${inline(card.title)}</h3>
          <p class="card-body-text">${inline(card.desc)}</p>
        </div>
      </div>`;
  }).join('\n');

  return `
    <section>
      <div class="editorial-slide-container">
        <div class="slide-header">
          <div class="slide-header-left">
            <span class="${badgeClass}">${inline(badgeText)}</span>
            <h2 class="slide-title">${inline(slide.title)}</h2>
          </div>
          <div class="slide-header-right">
            ${introText ? `<p class="slide-subtitle">${inline(introText)}</p>` : ''}
            <span class="slide-index-badge">${slideBadge(index, totalSlides)}</span>
          </div>
        </div>
        <div class="two-col-layout-grid">
          <div class="editorial-image-frame">
            <img src="${imgSrc}" alt="${inline(slide.title)}" />
          </div>
          <div class="cards-vertical-stack">
            ${cardsHtml}
          </div>
        </div>
      </div>
    </section>`;
}

// Slide 4: Services Bento — congen6 section 4 port (services-layout-grid).
function renderModernServices(slide, brand, index = 3, assetsDir = '', totalSlides = 9) {
  const content = sanitizeSlideContent(slide.content || '').trim();
  const { introText, cards } = parseEditorialCards(content);
  const targetSlot = resolveSlideSlot(slide, index, totalSlides, 'services');
  const imgSrc = resolveSlideImageUrl(index + 1, targetSlot, assetsDir);

  if (cards.length === 0) console.warn(`[modern] services slide ${index + 1} has zero cards; rendering empty grid`);
  const cardsHtml = cards.slice(0, 4).map((card, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `
      <div class="service-card">
        <div>
          <div class="service-top-row">
            <span class="service-badge-num">${num}</span>
            <span class="service-tag-pill">Layanan</span>
          </div>
          <h3 class="service-title">${inline(card.title)}</h3>
          <p class="service-desc">${inline(card.desc)}</p>
        </div>
      </div>`;
  }).join('\n');

  return `
    <section>
      <div class="editorial-slide-container">
        <div class="slide-header">
          <div class="slide-header-left">
            <span class="slide-kicker-badge">Kemampuan Platform</span>
            <h2 class="slide-title">${inline(slide.title)}</h2>
          </div>
          <div class="slide-header-right">
            ${introText ? `<p class="slide-subtitle">${inline(introText)}</p>` : ''}
            <span class="slide-index-badge">${slideBadge(index, totalSlides)}</span>
          </div>
        </div>
        <div class="services-layout-grid">
          <div class="services-left-col">
            <div class="services-stat-summary">
              <span class="hero-trust-label">Layanan Unggulan</span>
              ${introText ? `<p class="services-metric-desc">${inline(introText)}</p>` : ''}
            </div>
            <div class="editorial-image-frame services-photo-frame">
              <img src="${imgSrc}" alt="${inline(slide.title)}" />
            </div>
          </div>
          <div class="services-2x2-grid">
            ${cardsHtml}
          </div>
        </div>
      </div>
    </section>`;
}

function renderFeatureCards(slide, brand, index = 3, assetsDir = '', totalSlides = 9) {
  const content = sanitizeSlideContent(slide.content || '').trim();
  const { introText, cards } = parseEditorialCards(content);
  // Zero-bullet guard: the paragraph fallback in parseEditorialCards can invent a
  // card from prose, so gate on raw bullet lines — zero bullets means empty grid.
  const bulletCount = (content.match(/^[-*]\s/gm) || []).length;
  if (bulletCount === 0) console.warn(`[modern] feature-cards slide ${index + 1} has zero bullets; rendering empty grid`);
  else if (cards.length === 0) console.warn(`[modern] feature-cards slide ${index + 1} has zero cards; rendering empty grid`);
  if (cards.length > 4) console.warn(`[modern] feature-cards slide ${index + 1} has ${cards.length} cards; rendering first 4, remainder needs Part split`);
  const visibleCards = bulletCount === 0 ? [] : cards;
  const cardsHtml = visibleCards.slice(0, 4).map((c) => `
    <div class="feature-card">
      <div class="card-icon-brand"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg></div>
      <h3>${inline(c.title)}</h3>
      <p>${inline(c.desc)}</p>
    </div>`).join('\n');
  return `
    <section>
      <div class="editorial-slide-container">
        <div class="slide-header">
          <div class="slide-header-left">
            <span class="slide-kicker-badge">Fitur Unggulan</span>
            <h2 class="slide-title">${inline(slide.title)}</h2>
          </div>
          <div class="slide-header-right">
            ${introText ? `<p class="slide-subtitle">${inline(introText)}</p>` : ''}
            <span class="slide-index-badge">${slideBadge(index, totalSlides)}</span>
          </div>
        </div>
        <div class="feature-cards-grid">${cardsHtml}</div>
      </div>
    </section>`;
}

function renderFeatureSplit(slide, brand, index = 4, assetsDir = '', totalSlides = 9) {
  const content = sanitizeSlideContent(slide.content || '').trim();
  const { introText, cards } = parseEditorialCards(content);
  // 'solution' default slot: hero/solution/closing/ecosystem consumption depends on
  // the image directive (known limitation — directive wins, see resolveSlideSlot).
  const targetSlot = resolveSlideSlot(slide, index, totalSlides, 'solution');
  const imgSrc = resolveSlideImageUrl(index + 1, targetSlot, assetsDir);
  if (cards.length === 0) console.warn(`[modern] feature-split slide ${index + 1} has zero cards; rendering empty grid`);
  if (cards.length > 4) console.warn(`[modern] feature-split slide ${index + 1} has ${cards.length} cards; rendering first 4, remainder needs Part split`);
  const miniHtml = cards.slice(0, 4).map((c) => `
    <div class="feature-card"><h3>${inline(c.title)}</h3><p>${inline(c.desc)}</p></div>`).join('\n');
  return `
    <section>
      <div class="editorial-slide-container">
        <div class="feature-split">
          <div>
            <span class="slide-kicker-badge">Sorotan Fitur</span>
            <h2 class="slide-title">${inline(slide.title)}</h2>
            ${introText ? `<p class="slide-subtitle">${inline(introText)}</p>` : ''}
            <div class="feature-cards-grid">${miniHtml}</div>
          </div>
          <div class="split-photo editorial-image-frame"><img src="${imgSrc}" alt="${inline(slide.title)}" /></div>
        </div>
      </div>
    </section>`;
}

module.exports = {
  classifyModernArchetype,
  renderModernHero,
  renderModernWelcome,
  renderModernServices,
  renderFeatureCards,
  renderFeatureSplit,
  renderModernEcosystem,
  renderModernMetrics,
  renderModernDifferentiator,
  renderModernPricing,
  renderModernClosing,
  renderModernSocialProof,
  renderModernSlide
};

// Slide 5: Ecosystem — congen6 section 5 port (ecosystem-grid-split).
// Orbit-SVG pattern from renderCanvaEcosystem restyled to congen6 GPU panel markup.
// Zero-hallucination: node labels from parsed cards (title -> name, desc -> role);
// structural default labels only when zero cards (with console.warn) — labels are
// structural, not factual claims.
function renderModernEcosystem(slide, brand, index = 4, assetsDir = '', totalSlides = 9) {
  const content = sanitizeSlideContent(slide.content || '').trim();
  const { introText, cards } = parseEditorialCards(content);
  const targetSlot = resolveSlideSlot(slide, index, totalSlides, 'ecosystem');
  const imgSrc = resolveSlideImageUrl(index + 1, targetSlot, assetsDir);

  let nodes;
  if (cards.length === 0) {
    console.warn(`[modern] ecosystem slide ${index + 1} has zero cards; rendering structural default orbit labels`);
    nodes = [
      { name: 'Node 1', role: 'Peran 1' },
      { name: 'Node 2', role: 'Peran 2' },
      { name: 'Node 3', role: 'Peran 3' },
      { name: 'Node 4', role: 'Peran 4' }
    ];
  } else {
    nodes = cards.slice(0, 4).map(c => ({ name: c.title, role: c.desc }));
  }

  const cx = 250, cy = 250, r = 160;
  const numNodes = nodes.length;
  const satellitesSvg = nodes.map((node, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numNodes;
    const x = Math.round(cx + r * Math.cos(angle));
    const y = Math.round(cy + r * Math.sin(angle));
    return `
        <g class="orbit-node">
          <line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${brand.primaryColor}" stroke-opacity="0.55" stroke-width="2" stroke-dasharray="6 6"/>
          <circle cx="${x}" cy="${y}" r="40" fill="#FFFFFF" stroke="${brand.primaryColor}" stroke-width="2.5"/>
          <text x="${x}" y="${y - 6}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="800" fill="#0F172A">${inline(node.name)}</text>
          <text x="${x}" y="${y + 12}" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#007A87">${inline(node.role)}</text>
        </g>`;
  }).join('\n');

  const orbitSvg = `
      <svg class="ecosystem-orbit-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${cx}" cy="${cy}" r="${r + 40}" fill="none" stroke="${brand.primaryColor}" stroke-opacity="0.12" stroke-width="2" stroke-dasharray="6 6"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${brand.primaryColor}" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="8 8"/>
        ${satellitesSvg}
        <circle cx="${cx}" cy="${cy}" r="52" fill="${brand.primaryColor}"/>
        <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="800" fill="#FFFFFF">${inline(brand.name)}</text>
        <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="rgba(255,255,255,0.85)">AI Core</text>
      </svg>`;

  const gpuItemsHtml = cards.slice(0, 4).map(c => `
            <div class="gpu-mini-item">
              <div class="gpu-mini-head">${inline(c.title)}</div>
              <p class="gpu-mini-text">${inline(c.desc)}</p>
            </div>`).join('\n');

  return `
    <section>
      <div class="editorial-slide-container">
        <div class="slide-header">
          <div class="slide-header-left">
            <span class="slide-kicker-badge">Arsitektur Sistem</span>
            <h2 class="slide-title">${inline(slide.title)}</h2>
          </div>
          <div class="slide-header-right">
            ${introText ? `<p class="slide-subtitle">${inline(introText)}</p>` : ''}
            <span class="slide-index-badge">${slideBadge(index, totalSlides)}</span>
          </div>
        </div>
        <div class="ecosystem-grid-split">
          <div class="ecosystem-left-col">
            <div class="ecosystem-svg-container">
              ${orbitSvg}
            </div>
          </div>
          <div class="ecosystem-right-col">
            <div class="editorial-image-frame ecosystem-photo-card">
              <img src="${imgSrc}" alt="${inline(slide.title)}" />
            </div>
            <div class="ecosystem-gpu-panel">
              <div>
                <span class="gpu-top-badge">Arsitektur &amp; Ekosistem</span>
                <h3 class="gpu-headline">${inline(slide.title)}</h3>
                ${introText ? `<p class="gpu-summary">${inline(introText)}</p>` : ''}
                <div class="gpu-grid-items">
                  ${gpuItemsHtml}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

// Slide 6: Metrics — congen6 section 6 port (metrics-layout-grid).
// Zero-hallucination: extractBigNumberMetric per bullet with metric-big-number class,
// renders exactly the bullets present (no defaultMetrics); empty grid + console.warn.
function renderModernMetrics(slide, brand, index = 5, assetsDir = '', totalSlides = 9) {
  const content = sanitizeSlideContent(slide.content || '').trim();
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const targetSlot = resolveSlideSlot(slide, index, totalSlides, 'metrics');
  const imgSrc = resolveSlideImageUrl(index + 1, targetSlot, assetsDir);

  const bulletLines = lines.filter(l => /^[-*]\s/.test(l));
  if (bulletLines.length === 0) console.warn(`[modern] metrics slide ${index + 1} has zero bullets; rendering empty grid`);
  const metrics = bulletLines.slice(0, 4).map(b => extractBigNumberMetric(b));

  const metricsCardsHtml = metrics.map(m => `
              <div class="metric-card">
                <div>
                  <div class="metric-big-number">${inline(m.number)}</div>
                  <h3 class="metric-label">${inline(m.title)}</h3>
                  <p class="metric-narrative">${inline(m.desc)}</p>
                </div>
              </div>`).join('\n');

  return `
    <section>
      <div class="editorial-slide-container">
        <div class="slide-header">
          <div class="slide-header-left">
            <span class="slide-kicker-badge">Validasi &amp; Metrik</span>
            <h2 class="slide-title">${inline(slide.title)}</h2>
          </div>
          <div class="slide-header-right">
            <span class="slide-index-badge">${slideBadge(index, totalSlides)}</span>
          </div>
        </div>
        <div class="metrics-layout-grid">
          <div class="metrics-left-col">
            <div class="metrics-photo-wrap">
              <img src="${imgSrc}" alt="${inline(slide.title)}" />
            </div>
          </div>
          <div class="metrics-right-stack">
            <div class="metrics-2x2-grid">
              ${metricsCardsHtml}
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

// Slide 7: Differentiator — congen6 section 7 port (diff-table).
// Same markdown-table row logic as renderCanvaDifferentiator (build-deck.js):
// separator-row skip, header from first row, brand column gets col-brand.
// **Intinya:** line -> honesty callout ("Catatan Transparansi").
// Unclosed-table impossible by construction (template literal closes all tags).
// Zero-hallucination: no invented comparison rows; empty table + console.warn.
function renderModernDifferentiator(slide, brand, index = 6, assetsDir = '', totalSlides = 9) {
  const content = sanitizeSlideContent(slide.content || '').trim();
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  let intro = '';
  let honesty = '';
  const tableLines = [];

  for (const line of lines) {
    if (line.startsWith('|')) {
      tableLines.push(line);
    } else if (/^\*\*intinya[:\s]*/i.test(line) || /^intinya[:\s]*/i.test(line)) {
      honesty = line.replace(/^\*\*intinya[:\s]*\*\*/i, '').replace(/^intinya[:\s]*/i, '').trim();
    } else if (!intro && !line.startsWith('#') && !line.startsWith('<!--')) {
      intro = line;
    }
  }

  let headers = ['Aspek', brand.name];
  let rows = [];
  if (tableLines.length > 0) {
    const rawRows = [];
    for (const tl of tableLines) {
      const cleaned = tl.replace(/^\||\|$/g, '').trim();
      if (/^(\s*:?-{2,}:?\s*\|?)+$/.test(cleaned)) continue;
      const cols = cleaned.split('|').map(c => c.replace(/\*\*/g, '').trim());
      if (cols.length >= 2) rawRows.push(cols);
    }
    if (rawRows.length > 0) {
      headers = rawRows[0].map(h => h || 'Aspek');
      rows = rawRows.slice(1);
    }
  }
  if (rows.length === 0) console.warn(`[modern] differentiator slide ${index + 1} has zero table rows; rendering empty table`);

  const brandIdx = headers.findIndex(h => new RegExp(brand.name.replace(/[^a-z0-9]/gi, '|'), 'i').test(h) || /kami|pro|venturo/i.test(h));
  const activeBrandIdx = brandIdx !== -1 ? brandIdx : 1;

  const headerHtml = headers.map((h, i) => `
                <th class="${i === activeBrandIdx ? 'col-brand' : ''}">${inline(h)}</th>`).join('\n');

  const rowsHtml = rows.map(r => `
              <tr>
                ${r.map((cell, ci) => `
                  <td class="${ci === activeBrandIdx ? 'col-brand' : ''}">${inline(cell)}</td>`).join('\n')}
              </tr>`).join('\n');

  return `
    <section>
      <div class="editorial-slide-container">
        <div class="slide-header">
          <div class="slide-header-left">
            <span class="slide-kicker-badge">Keunggulan Kompetitif</span>
            <h2 class="slide-title">${inline(slide.title)}</h2>
          </div>
          <div class="slide-header-right">
            ${intro ? `<p class="slide-subtitle">${inline(intro)}</p>` : ''}
            <span class="slide-index-badge">${slideBadge(index, totalSlides)}</span>
          </div>
        </div>
        <div class="differentiator-layout-wrap">
          <div class="diff-table-container">
            <table class="diff-table">
              <thead>
                <tr>
                  ${headerHtml}
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
          ${honesty ? `
          <div class="differentiator-callout-strip">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${brand.primaryColor}" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span><strong>Catatan Transparansi:</strong> ${inline(honesty)}</span>
          </div>` : ''}
        </div>
      </div>
    </section>`;
}

// Slide 8: Pricing — congen6 section 8 port (pricing-cards-grid).
// Parses the markdown table (tier | price | `;`-separated features); the middle
// row is elevated with a `Best Seller` ribbon. Zero-hallucination: renders only
// the rows present (fewer than 3 -> render fewer + console.warn, never
// defaultTiers); empty grid + console.warn when zero rows.
function renderModernPricing(slide, brand, index = 7, assetsDir = '', totalSlides = 9) {
  const content = sanitizeSlideContent(slide.content || '').replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  let intro = '';
  const tableLines = [];
  for (const line of lines) {
    if (line.startsWith('|')) {
      tableLines.push(line);
    } else if (!intro && !line.startsWith('#')) {
      intro = line;
    }
  }

  const rawRows = [];
  for (const tl of tableLines) {
    const cleaned = tl.replace(/^\||\|$/g, '').trim();
    if (/^(\s*:?-{2,}:?\s*\|?)+$/.test(cleaned)) continue;
    const cols = cleaned.split('|').map(c => c.replace(/\*\*/g, '').trim());
    if (cols.length >= 2) rawRows.push(cols);
  }
  const rows = rawRows.slice(1).map(cols => ({
    // Intentional structural label (not a defaultTiers invention): fills an empty tier cell.
    tier: cols[0] || 'Paket',
    price: cols[1] || '',
    features: (cols[2] || '').split(';').map(f => f.trim()).filter(Boolean)
  }));
  if (rows.length < 3) console.warn(`[modern] pricing slide ${index + 1} has ${rows.length} tier rows; rendering as-is (never inventing default tiers)`);

  const elevatedIdx = Math.floor(rows.length / 2);
  const checkSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
  const cardsHtml = rows.map((r, i) => {
    const isElevated = i === elevatedIdx;
    const btnLabel = isElevated ? 'Pilih Paket' : i === 0 ? 'Mulai' : 'Hubungi Tim';
    const btnClass = isElevated ? 'btn-primary' : 'btn-outline';
    const featsHtml = r.features.map(f => {
      const parts = f.split(/[—–:\-]/);
      const head = parts[0].trim();
      const tail = parts.slice(1).join(' ').trim();
      return `
                <div class="tier-feature-item">
                  ${checkSvg}
                  <div>
                    <strong>${inline(head)}</strong>
                    ${tail ? `<p>${inline(tail)}</p>` : ''}
                  </div>
                </div>`;
    }).join('\n');
    return `
            <div class="tier-card${isElevated ? ' elevated' : ''}">
              ${isElevated ? '<div class="tier-ribbon">Best Seller</div>' : ''}
              <div>
                <h3 class="tier-name">${inline(r.tier)}</h3>
                <div class="tier-price-row">${inline(r.price)}</div>
              </div>
              <div class="tier-features">
                ${featsHtml}
              </div>
              <div>
                <a href="#/${totalSlides - 1}" class="${btnClass}" style="justify-content:center; width:100%; box-sizing:border-box;">${btnLabel}</a>
              </div>
            </div>`;
  }).join('\n');

  return `
    <section>
      <div class="editorial-slide-container">
        <div class="slide-header">
          <div class="slide-header-left">
            <span class="slide-kicker-badge">Investasi &amp; Kolaborasi</span>
            <h2 class="slide-title">${inline(slide.title)}</h2>
          </div>
          <div class="slide-header-right">
            ${intro ? `<p class="slide-subtitle">${inline(intro)}</p>` : ''}
            <span class="slide-index-badge">${slideBadge(index, totalSlides)}</span>
          </div>
        </div>
        <div class="pricing-content-wrap">
          <div class="pricing-cards-grid">
            ${cardsHtml}
          </div>
        </div>
      </div>
    </section>`;
}

// Slide 9: Closing — congen6 section 9 port (closing-3col-grid).
// 3-column layout: architecture photo, charcoal contact card, team photo.
// Contact values rendered verbatim via sanitizeContactDetails (invent nothing).
// Zero-hallucination: empty contacts -> empty list + console.warn (the existing
// sanitizeContactDetails placeholder replacement stays).
function renderModernClosing(slide, brand, index = 8, assetsDir = '', totalSlides = 9) {
  const brandSlug = (brand && brand.name ? brand.name : 'venturo-pro').toLowerCase().replace(/\s+/g, '-');
  const sanitized = sanitizeContactDetails(slide.content || '', brandSlug);
  const content = sanitizeSlideContent(sanitized).replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  let desc = '';
  const contacts = [];
  for (const line of lines) {
    const m = line.match(/^[-*]\s*(.+?)\s*:\s*(.+)$/);
    if (m) {
      contacts.push({ label: m[1].replace(/[*_`]/g, '').trim(), value: m[2].replace(/[*_`]/g, '').trim() });
    } else if (!desc && !line.startsWith('#')) {
      desc = line;
    }
  }
  if (contacts.length === 0) console.warn(`[modern] closing slide ${index + 1} has zero contacts; rendering empty list`);

  // Unique-md5: the left panel uses the per-build branded closing-banner art
  // (generated into assets/ on every build) instead of re-embedding the hero
  // photo — reusing slide-1 bytes here violates the unique-md5 image rule.
  const imgLeft = 'assets/closing-banner.svg';
  const targetSlot = resolveSlideSlot(slide, index, totalSlides, 'closing');
  const imgRight = resolveSlideImageUrl(index + 1, targetSlot, assetsDir);

  const iconFor = (label) => {
    const l = label.toLowerCase();
    if (/whatsapp|telepon|phone|telp/.test(l)) return '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>';
    if (/email|mail|surat/.test(l)) return '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>';
    return '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>';
  };
  const contactItemsHtml = contacts.slice(0, 4).map(c => `
              <div class="closing-contact-row">
                <div class="closing-contact-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconFor(c.label)}</svg>
                </div>
                <div class="closing-contact-meta">
                  <span class="closing-contact-type">${inline(c.label)}</span>
                  <span class="closing-contact-detail">${inline(c.value)}</span>
                </div>
              </div>`).join('\n');

  return `
    <section>
      <div class="editorial-slide-container">
        <div class="closing-3col-grid">
          <div class="editorial-image-frame closing-photo-wrap">
            <img src="${imgLeft}" alt="Architecture Visual" />
          </div>
          <div class="closing-center-panel">
            <span class="closing-badge-top">Langkah Berikutnya · Hubungi Kami</span>
            <h2 class="closing-main-title">${inline(slide.title)}</h2>
            <p class="closing-main-desc">${inline(desc || '')}</p>
            <div class="closing-contact-grid">
              ${contactItemsHtml}
            </div>
            <div class="closing-action-buttons">
              <a href="#/0" class="btn-primary" style="padding:12px 26px; font-size:15px;"><span>Mulai Sekarang</span></a>
            </div>
          </div>
          <div class="editorial-image-frame closing-photo-wrap">
            <img src="${imgRight}" alt="Corporate Team Visual" />
          </div>
        </div>
      </div>
    </section>`;
}

// Social-proof: 3-column quote-card grid reusing the welcome-card structure
// with a quote SVG + attribution. Zero-hallucination: renders exactly the
// bullets present (no invented testimonials); empty grid + console.warn.
function renderModernSocialProof(slide, brand, index = 7, assetsDir = '', totalSlides = 9) {
  const content = sanitizeSlideContent(slide.content || '').trim();
  const { introText, cards } = parseEditorialCards(content);
  if (cards.length === 0) console.warn(`[modern] social-proof slide ${index + 1} has zero cards; rendering empty grid`);
  const cardsHtml = cards.map(card => `
          <div class="welcome-card quote-card">
            <svg class="quote-icon" width="28" height="28" viewBox="0 0 24 24" fill="${brand.primaryColor}" xmlns="http://www.w3.org/2000/svg"><path d="M10 8c-3 1-5 3.5-5 7v1h5v-6H7.5C8 9 9 8.5 10 8.2V8zm9 0c-3 1-5 3.5-5 7v1h5v-6h-2.5c.5-1 1.5-1.5 2.5-1.8V8z"/></svg>
            <div class="welcome-card-content">
              <p class="welcome-card-desc">${inline(card.desc)}</p>
              <h3 class="welcome-card-title">${inline(card.title)}</h3>
            </div>
          </div>`).join('\n');

  return `
    <section>
      <div class="editorial-slide-container">
        <div class="slide-header">
          <div class="slide-header-left">
            <span class="slide-kicker-badge">Testimoni &amp; Kepercayaan</span>
            <h2 class="slide-title">${inline(slide.title)}</h2>
          </div>
          <div class="slide-header-right">
            ${introText ? `<p class="slide-subtitle">${inline(introText)}</p>` : ''}
            <span class="slide-index-badge">${slideBadge(index, totalSlides)}</span>
          </div>
        </div>
        <div class="social-proof-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; align-items:stretch;">
          ${cardsHtml}
        </div>
      </div>
    </section>`;
}

// Modern dispatcher: archetype -> renderer (12 cases, default `solution`).
// feature-split routes via classifier (narrative/WA/spotlight opt-in, <=4 bullets);
// feature-cards routes via density (>=4 bullets, services/solution scope).
function renderModernSlide(slide, index, totalSlides, brand, assetsDir = '') {
  const arch = classifyModernArchetype(slide, index, totalSlides);
  switch (arch) {
    case 'cover': return renderModernHero(slide, brand, index, assetsDir, totalSlides);
    case 'problem': return renderModernWelcome(slide, brand, index, 'problem', assetsDir, totalSlides);
    case 'solution': return renderModernWelcome(slide, brand, index, 'solution', assetsDir, totalSlides);
    case 'services': return renderModernServices(slide, brand, index, assetsDir, totalSlides);
    case 'feature-cards': return renderFeatureCards(slide, brand, index, assetsDir, totalSlides);
    case 'feature-split': return renderFeatureSplit(slide, brand, index, assetsDir, totalSlides);
    case 'ecosystem': return renderModernEcosystem(slide, brand, index, assetsDir, totalSlides);
    case 'metrics': return renderModernMetrics(slide, brand, index, assetsDir, totalSlides);
    case 'differentiator': return renderModernDifferentiator(slide, brand, index, assetsDir, totalSlides);
    case 'pricing': return renderModernPricing(slide, brand, index, assetsDir, totalSlides);
    case 'closing': return renderModernClosing(slide, brand, index, assetsDir, totalSlides);
    case 'social-proof': return renderModernSocialProof(slide, brand, index, assetsDir, totalSlides);
    default: return renderModernWelcome(slide, brand, index, 'solution', assetsDir, totalSlides);
  }
}
