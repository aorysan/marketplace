/* themes/modern.js — Aperture Cinematic Minimalist slide renderers.
   Exactly 7 archetypes (cover, problem, product, features, usp, pricing,
   closing) + `renderCinematicSlide` dispatcher, consumed by build-deck.js via
   `renderModernSlide`. Shared parsers come from ../build-deck.
   Zero-hallucination rule: render only parsed cards (cards.slice(0,4) as-is);
   never invent default services/cards/metrics. Empty grid + console.warn on
   zero cards. Chrome copy (kickers/rail labels) defaults to Bahasa Indonesia
   to match the generated deck (`<html lang="id">`); every default is overridable
   from the slide object.
*/
const {
  inline,
  parseEditorialCards,
  extractBigNumberMetric,
  sanitizeSlideContent,
  sanitizeContactDetails,
  resolveSlideSlot,
  resolveSlideImageUrl,
  METRIC_TOKEN_RE
} = require('../build-deck');

// Aperture Cinematic archetype set (SSOT): exactly these 9 names.
// The first 6 are a 1:1 port of the Figma "Product Presentation Slide" export
// (assets/figma-presentation/); `metrics` and `ecosystem` are native Aperture
// extensions (Figma has no equivalent page) that replace the old behaviour of
// letting traction/architecture slides fall through to the `product` layout.
// renderCinematicSlide consumes the same names; manifest.json + the writer /
// reviewer slot vocabulary are locked to this list by
// scripts/test-cinematic-classifier.js.
const CINEMATIC_ARCHETYPES = ['cover', 'problem', 'product', 'features', 'usp', 'pricing', 'metrics', 'ecosystem', 'closing'];

// Cinematic archetype -> default asset slot (imageFetcher SLOT_MAP keys).
// Every value MUST resolve in imageFetcher.SLOT_MAP to a category + fallback —
// never undefined (asserted by test-cinematic-classifier.js).
const CINEMATIC_SLOT_MAP = {
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

// NOTE: METRIC_TOKEN_RE (the whole-token figure test that keeps
// `**Biaya tak terprediksi**` a title instead of a metric) lives in
// ../build-deck as the single definition, imported above.

// Contact-shaped bullet labels for the closing slide: only these become contact
// rows; everything else is a note (never a fabricated "contact").
const CONTACT_LABEL_RE = /whatsapp|\bwa\b|telepon|telp|phone|email|mail|surat|alamat|kantor|website|\bweb\b|situs|kontak|contact|hubungi|instagram|linkedin|sosial/i;

// Contact / CTA vocabulary → `closing` archetype. Kept out of the pricing offer
// vocabulary so a contact slide renders the contact layout instead of falling
// through the zero-tier pricing guard into a features list.
const CLOSING_RE = /hubungi|kontak|contact|\bcta\b|call to action|langkah berikutnya|terima kasih|mulai sekarang/;
const PRICING_RE = /paket|harga|penawaran|pricing|investasi|kerjasama|\bplan\b/;
const USP_RE = /mengapa|kenapa|\bwhy\b|why us|nilai tambah|alasan|pembeda|keunggulan kompetitif|differentiator/;
// Title-only archetypes: a metrics/architecture slide is opted into by its title.
// They are deliberately NOT in the body layer — a stray "integrasi" in another
// slide's prose must not steal that slide into the ecosystem layout.
const METRICS_RE = /pencapaian|bukti\b|metrik|metrics|traction|pertumbuhan|statistik|kinerja|angka kunci/;
const ECOSYSTEM_RE = /ekosistem|arsitektur|infrastruktur|integrasi\b|pipeline|alur kerja|workflow|\bstack\b/;
const PROBLEM_RE = /masalah|tantangan|pain|problem/;
// `\bproduk\b` (not bare `produk`) so the noun "produksi" no longer matches —
// that false positive used to drag capability slides into the product layout.
const PRODUCT_RE = /\bproduk\b|overview|solusi|solution|\bvalue\b/;
const FEATURES_RE = /fitur|layanan|keunggulan|kemampuan|kapabilitas|capabilit|services|feature/;

// Accept both pipeline slide shapes: { title, content } (build-deck) and
// raw markdown objects { h1, raw, lines, bullets } (brief interface).
function cinematicText(slide) {
  const title = slide.title != null ? String(slide.title) : String(slide.h1 || '');
  const parts = [slide.content, slide.raw];
  if (Array.isArray(slide.lines)) parts.push(slide.lines.join('\n'));
  else if (slide.lines) parts.push(String(slide.lines));
  if (Array.isArray(slide.bullets)) parts.push(slide.bullets.join('\n'));
  else if (slide.bullets) parts.push(String(slide.bullets));
  const body = parts.filter(Boolean).map(String).join('\n');
  return { t: title.toLowerCase(), combined: (title + '\n' + body).toLowerCase() };
}

// Single authoritative classifier (kills BUG-1 dual-classifier divergence).
// Precedence is deliberate and locked by scripts/test-cinematic-classifier.js:
// title keywords beat body keywords; within each layer closing > pricing > usp
// > problem > product > features (most specific first, e.g. "keunggulan
// kompetitif" hits usp before the generic "keunggulan" features rule, and a
// contact slide hits closing before pricing's offer vocabulary).
function classifyCinematicArchetype(slide, index = 0, totalSlides = 1) {
  slide = slide || {};
  const { t, combined } = cinematicText(slide);

  // cover: slide 1 / title / hero
  if (index === 0) return 'cover';
  if (/profil|company profile|cover|hero/.test(t)) return 'cover';

  // Title-keyword layer
  if (CLOSING_RE.test(t)) return 'closing';
  if (PRICING_RE.test(t)) return 'pricing';
  if (USP_RE.test(t)) return 'usp';
  if (METRICS_RE.test(t)) return 'metrics';
  if (ECOSYSTEM_RE.test(t)) return 'ecosystem';
  if (PROBLEM_RE.test(t)) return 'problem';
  if (PRODUCT_RE.test(t)) return 'product';
  if (FEATURES_RE.test(t)) return 'features';

  // Body/combined fallback layer, same order (cover stays title/positional-only)
  if (CLOSING_RE.test(combined)) return 'closing';
  if (PRICING_RE.test(combined)) return 'pricing';
  if (USP_RE.test(combined)) return 'usp';
  if (PROBLEM_RE.test(combined)) return 'problem';
  if (PRODUCT_RE.test(combined)) return 'product';
  if (FEATURES_RE.test(combined)) return 'features';

  // Positional fallback (mirrors legacy index-1-problem / else-solution)
  return index === 1 ? 'problem' : 'product';
}

// Deprecated alias (Ruling-1): the single source of truth is
// classifyCinematicArchetype above. This thin wrapper keeps legacy callers
// working WITHOUT a second divergent logic copy.
function classifyModernArchetype(slide, index, totalSlides) {
  return classifyCinematicArchetype(slide, index, totalSlides);
}

// --- Aperture Cinematic 7 Archetype Renderers (Figma DOM Parity) ---

function resolveSlideParams(slide, brand, defaultIndex, defaultSlot, arg3, arg4, arg5) {
  let index = defaultIndex;
  let assetsDir = '';
  let totalSlides = 6;
  let customAssetUrl = null;

  if (typeof arg3 === 'string' && (/\.(jpg|jpeg|png|svg|webp|gif)$/i.test(arg3) || /^https?:\/\//i.test(arg3) || /^data:/i.test(arg3))) {
    customAssetUrl = arg3;
    if (typeof arg4 === 'number') totalSlides = arg4;
  } else if (typeof arg3 === 'number') {
    index = arg3;
    if (typeof arg4 === 'string') assetsDir = arg4;
    if (typeof arg5 === 'number') totalSlides = arg5;
  } else if (typeof arg3 === 'string') {
    assetsDir = arg3;
    if (typeof arg4 === 'number') totalSlides = arg4;
  } else if (typeof arg3 === 'object' && arg3 !== null) {
    customAssetUrl = arg3.url || arg3.src || arg3.path || null;
  }

  if (slide && typeof slide.index === 'number') {
    index = slide.index;
  }
  if (slide && typeof slide.total === 'number') {
    totalSlides = slide.total;
  }

  const arch = classifyCinematicArchetype(slide, index, totalSlides);
  const slot = defaultSlot || (CINEMATIC_SLOT_MAP[arch]) || 'hero';
  const targetSlot = resolveSlideSlot(slide, index, totalSlides, slot);

  if (typeof arg3 === 'object' && arg3 !== null && !customAssetUrl) {
    customAssetUrl = arg3[targetSlot] || arg3[slot] || arg3[arch] || null;
  }

  const assetMap = (slide && slide.assetMap) || (typeof arg3 === 'object' && arg3 !== null ? arg3 : null);
  const assetMapUrl = assetMap ? (assetMap[targetSlot] || assetMap[slot] || assetMap[arch]) : null;
  const imgSrc = customAssetUrl || (slide && (slide.image || slide.imageUrl)) || assetMapUrl || resolveSlideImageUrl(index + 1, targetSlot, assetsDir);

  const brandObj = brand || {};
  const brandName = brandObj.name || 'Aperture Instruments';

  return { index, assetsDir, totalSlides, imgSrc, targetSlot, brandObj, brandName };
}

// 1. Cover: Full-bleed image, dark gradient overlay, status pill, 9rem headline
function renderCover(slide, brand, indexOrAsset = 0, assetsDir = '', totalSlides = 6) {
  slide = slide || {};
  const { index, imgSrc, brandName } = resolveSlideParams(slide, brand, 0, 'hero', indexOrAsset, assetsDir, totalSlides);

  const title = slide.title != null ? String(slide.title) : String(slide.h1 || brandName || 'Aperture');
  const lines = sanitizeSlideContent(slide.content || slide.raw || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  let kicker = slide.kicker || slide.category || (brand && (brand.division || brand.category)) || '';
  let subtitle = slide.subtitle || slide.desc || '';

  for (const line of lines) {
    if (!kicker && /^kicker:\s*/i.test(line)) {
      kicker = line.replace(/^kicker:\s*/i, '').trim();
    } else if (!subtitle && !line.startsWith('#') && !/^kicker:\s*/i.test(line) && !/^[-*]\s/.test(line) && line.length > 15) {
      subtitle = line;
    }
  }

  if (!kicker) {
    const candidate = lines.find(l => /^tagline:|^series\s/i.test(l));
    if (candidate) kicker = candidate.replace(/^tagline:\s*/i, '').trim();
  }

  // Hero metrics: the writer contract mandates 2-3 key stats on slide 1. They
  // render as a glass stat strip instead of being dropped silently.
  const statLines = lines.filter(l => /^[-*]\s/.test(l));
  const statsHtml = statLines.slice(0, 3).map(st => {
    const m = extractBigNumberMetric(st);
    const label = (m.title && m.title.replace(/\.$/, '') !== m.number ? m.desc : '') || m.desc || m.title.replace(/\.$/, '');
    return `                <div class="cover-stat">
                  <span class="cover-stat-value">${inline(m.number)}</span>
                  ${label ? `<span class="cover-stat-label">${inline(label)}</span>` : ''}
                </div>`;
  }).join('\n');

  const statusText = slide.status || slide.pill || (brand && brand.status) || '';
  const titleHtml = inline(title).replace(/\n/g, '<br>');
  const activeClass = index === 0 ? ' active' : '';

  return `      <!-- Slide ${String(index + 1).padStart(2, '0')}: Cover -->
      <article class="slide-item${activeClass}" id="slide-${index}">
        <div class="slide-cover">
          <img src="${imgSrc}" alt="${inline(title)}" class="bg-img">
          <div class="overlay-t"></div>
          <div class="overlay-r"></div>
          <div class="content">
            <div class="top-meta">
              <span>${inline(brandName)}</span>
              ${statusText ? `<span class="status-pill"><span class="status-dot"></span> ${inline(statusText)}</span>` : ''}
            </div>
            <div>
              ${kicker ? `<span class="mono-kicker">${inline(kicker)}</span>` : ''}
              <h1 class="hero-title">
                ${titleHtml}
              </h1>
              ${subtitle ? `<p class="hero-sub">
                ${inline(subtitle)}
              </p>` : ''}
              ${statsHtml ? `<div class="cover-stats">
${statsHtml}
              </div>` : ''}
            </div>
          </div>
        </div>
      </article>`;
}

// 2. Problem: 12-col split, grayscale image, ghost text "NO", 3 problem rows
function renderProblem(slide, brand, indexOrAsset = 1, assetsDir = '', totalSlides = 6) {
  slide = slide || {};
  const { index, imgSrc } = resolveSlideParams(slide, brand, 1, 'problem', indexOrAsset, assetsDir, totalSlides);

  const title = slide.title != null ? String(slide.title) : String(slide.h1 || 'Great cameras are still a burden to carry.');
  const kicker = slide.kicker || 'Masalahnya';
  const caption = slide.caption || 'Cara lama';
  const ghostText = slide.ghostText || 'NO';

  let items = [];
  if (Array.isArray(slide.items)) {
    items = slide.items;
  } else {
    const content = sanitizeSlideContent(slide.content || slide.raw || '').trim();
    const { cards } = parseEditorialCards(content);
    items = cards;
  }

  if (items.length === 0) {
    console.warn(`[modern] problem slide ${index + 1} has zero items; rendering empty list`);
  }

  const itemsHtml = items.slice(0, 3).map((item, i) => {
    const num = String(i + 1).padStart(2, '0');
    const itemTitle = item.title || item.heading || item.name || '';
    const itemDesc = item.desc || item.detail || item.description || item.body || '';
    return `              <div class="problem-item">
                <span class="num">${num}</span>
                <div class="body-wrap">
                  <h3>${inline(itemTitle)}</h3>
                  <p>${inline(itemDesc)}</p>
                </div>
              </div>`;
  }).join('\n');

  const activeClass = index === 0 ? ' active' : '';

  return `      <!-- Slide ${String(index + 1).padStart(2, '0')}: Problem -->
      <article class="slide-item${activeClass}" id="slide-${index}">
        <div class="slide-problem">
          <span class="ghost-text ghost-no">${inline(ghostText)}</span>
          <div class="img-col">
            <img src="${imgSrc}" alt="${inline(title)}">
            <span class="caption">${inline(caption)}</span>
          </div>
          <div class="text-col">
            <span class="mono-kicker">${inline(kicker)}</span>
            <h2 class="headline">${inline(title)}</h2>
            <div class="problem-list">
${itemsHtml}
            </div>
          </div>
        </div>
      </article>`;
}

// Leading metric token of a "<metric> — <narration>" bullet. `20:1` must stay a
// single token (the old `[—–:-]` split chopped it into `20` + `1`).
const LEADING_METRIC_RE = /^([$€£~<>]?\s*(?:Rp\s*)?\d[\d.,]*(?:\s*(?:rb|ribu|jt|juta|k|m))?(?:[%×xX+]|[:/–—-]\s*\d[\d.,]*|[:/–—-][a-zA-Z]{2,}|[a-zA-Z]{1,3})?)(?:\s*[—–-]\s*|\s*:?\s+)([\s\S]*)$/;

function metricOrNothing(metrics) {
  for (const m of metrics) {
    if (!m) continue;
    // A bare narrative number must never become the headline metric, and the
    // legacy `100%` placeholder means "no metric found".
    if (m !== '100%' && /\d/.test(m) && METRIC_TOKEN_RE.test(String(m).trim())) {
      return String(m).trim();
    }
  }
  return '';
}

function parseMetricBullet(bulletLine) {
  if (!bulletLine) return { metric: '', label: '', title: '' };
  // Strip a bullet marker only when it is followed by whitespace. A bare
  // `/^[-*]\s*/` also ate the first `*` of a bold token, so callers that had
  // already removed the marker (`**20:1** — ...`) lost the metric entirely and
  // the raw `*` leaked into the rendered label.
  const clean = bulletLine.replace(/^[-*]\s+/, '').trim();
  const boldMatch = clean.match(/^\*\*([^*]+)\*\*\s*[:—–-]?\s*(.*)$/);
  if (boldMatch) {
    const part1 = boldMatch[1].trim();
    const part2 = boldMatch[2].trim();
    // Whole bold token is the figure (`0.9s`, `214g`, `20:1`, `3-tier`, `1×`).
    if (METRIC_TOKEN_RE.test(part1)) {
      return { metric: part1, label: part2 || part1, title: part2 };
    }
    // Bold token is the label and the figure leads the detail text.
    const leadInPart2 = part2.match(LEADING_METRIC_RE);
    const metricFromPart2 = leadInPart2 ? metricOrNothing([leadInPart2[1]]) : '';
    if (metricFromPart2) {
      return { metric: metricFromPart2, label: part1, title: part1 };
    }
    // No figure anywhere: keep the bullet clean instead of inventing a metric.
    return { metric: '', label: part2 || part1, title: part1 };
  }
  const lead = clean.match(LEADING_METRIC_RE);
  const leadMetric = lead ? metricOrNothing([lead[1]]) : '';
  if (leadMetric) {
    const label = (lead[2] || '').trim() || leadMetric;
    return { metric: leadMetric, label, title: label };
  }
  const parts = clean.split(/[—–:-]/);
  if (parts.length > 1) {
    const p0 = parts[0].trim();
    const p1 = parts.slice(1).join(' ').trim();
    const tailMetric = metricOrNothing([p1]);
    if (tailMetric) {
      return { metric: tailMetric, label: p0, title: p0 };
    }
    return { metric: '', label: p1, title: p0 };
  }
  const m = extractBigNumberMetric(bulletLine);
  const metric = metricOrNothing([m.number]);
  if (metric) {
    return { metric, label: m.desc || m.title, title: m.title };
  }
  return { metric: '', label: clean, title: clean };
}

// 3. Product: 2-col split, macro image with floating glass badge, 2x2 stat matrix
function renderProduct(slide, brand, indexOrAsset = 2, assetsDir = '', totalSlides = 6) {
  slide = slide || {};
  const { index, imgSrc } = resolveSlideParams(slide, brand, 2, 'macro', indexOrAsset, assetsDir, totalSlides);

  const title = slide.title != null ? String(slide.title) : String(slide.h1 || 'One body.\nEvery format.');
  const kicker = slide.kicker || 'Produk';
  const badge = slide.badge || slide.floatingBadge || '';

  let desc = slide.desc || slide.subtitle || '';
  let stats = [];

  if (Array.isArray(slide.stats)) {
    stats = slide.stats.map(s => ({
      metric: s.metric || s.value || s.number || '',
      label: s.label || s.desc || s.title || ''
    }));
  } else {
    const content = sanitizeSlideContent(slide.content || slide.raw || '').trim();
    const { introText, cards } = parseEditorialCards(content);
    if (!desc && introText) desc = introText;

    const lines = content.replace(/<!--[\s\S]*?-->/g, '').split('\n').map(l => l.trim()).filter(Boolean);
    const bulletLines = lines.filter(l => /^[-*]\s/.test(l));
    if (bulletLines.length > 0) {
      for (const b of bulletLines) {
        stats.push(parseMetricBullet(b));
      }
    } else if (cards.length > 0) {
      for (const c of cards) {
        stats.push(parseMetricBullet(`- **${c.title}** — ${c.desc}`));
      }
    }
  }

  // Degradation guard: bullets that carry no figure at all (e.g. a capability
  // list misclassified as `product`) must not ship a 2x2 grid of empty metric
  // holes. Render label-only cells instead, and warn either way.
  const hasMetric = stats.some(st => st.metric);
  if (stats.length === 0) {
    console.warn(`[modern] product slide ${index + 1} has zero stats; rendering empty grid`);
  } else if (!hasMetric) {
    console.warn(`[modern] product slide ${index + 1} has no numeric metric; rendering label-only stat cells`);
  }

  const statsHtml = stats.slice(0, 4).map(st => `              <div class="stat-cell${st.metric ? '' : ' no-metric'}">
                ${st.metric ? `<div class="stat-metric">${inline(st.metric)}</div>` : ''}
                <div class="stat-label">${inline(st.label)}</div>
              </div>`).join('\n');

  const titleHtml = inline(title).replace(/\n/g, '<br>');
  const activeClass = index === 0 ? ' active' : '';

  return `      <!-- Slide ${String(index + 1).padStart(2, '0')}: Product -->
      <article class="slide-item${activeClass}" id="slide-${index}">
        <div class="slide-product">
          <div class="img-col">
            <img src="${imgSrc}" alt="${inline(title)}">
            ${badge ? `<span class="badge-floating">${inline(badge)}</span>` : ''}
          </div>
          <div class="text-col">
            <span class="mono-kicker">${inline(kicker)}</span>
            <h2 class="headline">${titleHtml}</h2>
            ${desc ? `<p class="desc">
              ${inline(desc)}
            </p>` : ''}
            <div class="stats-grid">
${statsHtml}
            </div>
          </div>
        </div>
      </article>`;
}

// 4. Features: 12-col split, rail photo with vertical label, 4 numbered feature rows (01-04)
function renderFeatures(slide, brand, indexOrAsset = 3, assetsDir = '', totalSlides = 6) {
  slide = slide || {};
  const { index, imgSrc } = resolveSlideParams(slide, brand, 3, 'hands', indexOrAsset, assetsDir, totalSlides);

  const title = slide.title != null ? String(slide.title) : String(slide.h1 || 'Everything, on board.');
  const kicker = slide.kicker || 'Fitur utama';
  const railLabel = slide.railLabel || slide.rail || 'Semua yang Anda butuhkan';

  let items = [];
  if (Array.isArray(slide.items)) {
    items = slide.items;
  } else if (Array.isArray(slide.features)) {
    items = slide.features;
  } else {
    const content = sanitizeSlideContent(slide.content || slide.raw || '').trim();
    const { cards } = parseEditorialCards(content);
    items = cards;
  }

  if (items.length === 0) {
    console.warn(`[modern] features slide ${index + 1} has zero features; rendering empty list`);
  }

  const visibleItems = items.slice(0, 4);
  const subCounter = slide.subCounter || `${String(visibleItems.length).padStart(2, '0')} / features`;

  const featuresListHtml = visibleItems.map((item, i) => {
    const num = String(i + 1).padStart(2, '0');
    const name = item.name || item.title || '';
    const detail = item.detail || item.desc || '';
    return `              <li class="feature-row">
                <span class="feature-num">${num}</span>
                <h3 class="feature-name">${inline(name)}</h3>
                <p class="feature-detail">${inline(detail)}</p>
              </li>`;
  }).join('\n');

  const activeClass = index === 0 ? ' active' : '';

  return `      <!-- Slide ${String(index + 1).padStart(2, '0')}: Features -->
      <article class="slide-item${activeClass}" id="slide-${index}">
        <div class="slide-features">
          <div class="img-col">
            <img src="${imgSrc}" alt="${inline(title)}">
            <span class="rail-label">${inline(railLabel)}</span>
          </div>
          <div class="content-col">
            <div class="features-header">
              <div>
                <span class="mono-kicker">${inline(kicker)}</span>
                <h2 class="headline">${inline(title)}</h2>
              </div>
              <span class="sub-counter">${inline(subCounter)}</span>
            </div>
            <ul class="features-list">
${featuresListHtml}
            </ul>
          </div>
        </div>
      </article>`;
}

// 5. USP: Full-bleed dark background, 3 frosted glass cards with metrics
// Comparison table → 3 glass cards (kicker=aspect, title=brand value, desc=alternatives).
// Returns null when content has no usable markdown table.
function parseUspComparisonCards(content) {
  const stripped = String(content || '').replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = stripped.split('\n').map(l => l.trim()).filter(Boolean);
  const tableLines = lines.filter(l => l.startsWith('|'));
  if (tableLines.length < 3) return null;

  const rawRows = [];
  for (const tl of tableLines) {
    const cleaned = tl.replace(/^\||\|$/g, '').trim();
    if (/^(\s*:?-{2,}:?\s*\|?)+$/.test(cleaned)) continue;
    const cols = cleaned.split('|').map(c => c.replace(/\*\*/g, '').trim());
    if (cols.length >= 2) rawRows.push(cols);
  }
  if (rawRows.length < 2) return null;

  const headers = rawRows[0];
  const rows = rawRows.slice(1);
  const cards = rows.slice(0, 3).map(r => ({
    kicker: r[0] || '',
    metric: '',
    title: r[1] || headers[1] || '',
    desc: headers.slice(2)
      .map((h, i) => (r[i + 2] ? `${h}: ${r[i + 2]}` : ''))
      .filter(Boolean)
      .join(' · ')
  }));

  let honesty = '';
  let intro = '';
  for (const line of lines) {
    if (line.startsWith('|')) continue;
    if (/^\*\*intinya/i.test(line) || /^intinya[:\s]/i.test(line)) {
      honesty = line
        .replace(/^\*\*intinya[:\s]*\*\*\s*/i, '')
        .replace(/^intinya[:\s]*/i, '')
        .replace(/\*\*/g, '')
        .trim();
    } else if (!intro && !line.startsWith('#')) {
      intro = line;
    }
  }
  return { cards, honesty, intro };
}

function renderUsp(slide, brand, indexOrAsset = 4, assetsDir = '', totalSlides = 6) {
  slide = slide || {};
  const { index, imgSrc } = resolveSlideParams(slide, brand, 4, 'viewfinder', indexOrAsset, assetsDir, totalSlides);

  const title = slide.title != null ? String(slide.title) : String(slide.h1 || 'Three reasons it earns its place.');
  const kicker = slide.kicker || 'Mengapa kami';

  let cards = [];
  let honesty = '';
  if (Array.isArray(slide.items)) {
    cards = slide.items;
  } else if (Array.isArray(slide.cards)) {
    cards = slide.cards;
  } else {
    const content = sanitizeSlideContent(slide.content || slide.raw || '').trim();
    const comparison = parseUspComparisonCards(content);
    if (comparison && comparison.cards.length > 0) {
      cards = comparison.cards;
      honesty = comparison.honesty;
    } else {
      const { cards: parsedCards } = parseEditorialCards(content);
      cards = parsedCards.map(c => {
      const pm = parseMetricBullet(`- **${c.title}** — ${c.desc}`);
      let kicker = c.kicker || c.tag || '';
      let metric = c.metric || (pm.metric && /\d/.test(pm.metric) ? pm.metric : '');
      let title = c.title || pm.title || '';
      let desc = c.desc || c.detail || pm.label || '';
      if (pm.metric && c.title === pm.metric) {
        const parts = (c.desc || '').split(/[—–:]/);
        if (parts.length > 1) {
          title = parts[0].trim();
          desc = parts.slice(1).join(' ').trim();
        } else {
          title = c.desc;
          desc = '';
        }
      }
      return {
        kicker,
        metric,
        title,
        desc
      };
    });
    }
  }

  if (cards.length === 0) {
    console.warn(`[modern] usp slide ${index + 1} has zero cards; rendering empty grid`);
  }

  const uspCardsHtml = cards.slice(0, 3).map((card, i) => {
    const num = String(i + 1).padStart(2, '0');
    const cardKicker = card.kicker || card.tag || '';
    const metric = card.metric || card.number || '';
    const cardTitle = card.title || card.name || '';
    const cardDesc = card.desc || card.detail || '';
    return `              <div class="usp-card">
                <div class="usp-card-top">
                  <span class="usp-kicker">${inline(cardKicker)}</span>
                  <span class="usp-card-num">${num}</span>
                </div>
                ${metric ? `<div class="usp-metric">${inline(metric)}</div>` : ''}
                <h3 class="usp-title">${inline(cardTitle)}</h3>
                ${cardDesc ? `<p class="usp-detail">${inline(cardDesc)}</p>` : ''}
              </div>`;
  }).join('\n');

  const activeClass = index === 0 ? ' active' : '';

  return `      <!-- Slide ${String(index + 1).padStart(2, '0')}: Why It Wins (USP) -->
      <article class="slide-item${activeClass}" id="slide-${index}">
        <div class="slide-usp">
          <img src="${imgSrc}" alt="${inline(title)}" class="bg-img">
          <div class="overlay-v"></div>
          <div class="content">
            <span class="mono-kicker">${inline(kicker)}</span>
            <h2 class="headline">${inline(title)}</h2>
            ${honesty ? `<p class="usp-honesty">${inline(honesty)}</p>` : ''}
            <div class="usp-grid">
${uspCardsHtml}
            </div>
          </div>
        </div>
      </article>`;
}

// 6. Pricing: 12-col split, lens photo with a vertical rail overlay, 3 pricing tiers (featured tier inverted)
function renderPricing(slide, brand, indexOrAsset = 5, assetsDir = '', totalSlides = 6) {
  slide = slide || {};
  const { index, imgSrc } = resolveSlideParams(slide, brand, 5, 'lens', indexOrAsset, assetsDir, totalSlides);

  const title = slide.title != null ? String(slide.title) : String(slide.h1 || 'Pick a configuration.');
  const kicker = slide.kicker || 'Pilih paket';
  const railTitle = slide.railTitle || 'Siap mulai.';
  const railSub = slide.railSub || 'Pendampingan dari awal';

  let tiers = [];
  if (Array.isArray(slide.tiers)) {
    tiers = slide.tiers;
  } else if (Array.isArray(slide.items)) {
    tiers = slide.items;
  } else {
    const content = sanitizeSlideContent(slide.content || slide.raw || '').replace(/<!--[\s\S]*?-->/g, '').trim();
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const tableLines = lines.filter(l => l.startsWith('|'));
    const rawRows = [];
    for (const tl of tableLines) {
      const cleaned = tl.replace(/^\||\|$/g, '').trim();
      if (/^(\s*:?-{2,}:?\s*\|?)+$/.test(cleaned)) continue;
      const cols = cleaned.split('|').map(c => c.replace(/\*\*/g, '').trim());
      if (cols.length >= 2) rawRows.push(cols);
    }
    const rows = rawRows.slice(1);
    tiers = rows.map(cols => {
      const rawName = cols[0] || 'Tier';
      let name = rawName;
      let note = cols[3] || '';
      const noteMatch = rawName.match(/^(.*?)\s*\((.*?)\)$/);
      if (noteMatch) {
        name = noteMatch[1].trim();
        if (!note) note = noteMatch[2].trim();
      }
      return {
        name,
        note,
        price: cols[1] || '',
        features: (cols[2] || '').split(';').map(f => f.trim()).filter(Boolean)
      };
    });
  }

  if (tiers.length === 0) {
    console.warn(`[modern] pricing slide ${index + 1} has zero tiers; rendering empty grid`);
  }

  const explicitFeaturedIdx = tiers.findIndex(t => t.featured === true);
  const featuredIdx = explicitFeaturedIdx !== -1 ? explicitFeaturedIdx : (tiers.length > 1 ? Math.floor(tiers.length / 2) : -1);

  const pricingTiersHtml = tiers.slice(0, 3).map((tier, i) => {
    const isFeatured = i === featuredIdx;
    const tierName = tier.name || 'Tier';
    const tierNote = tier.note || (isFeatured ? 'Most popular' : '');
    const tierPrice = tier.price || '';
    const tierCta = tier.cta || 'Reserve →';
    const rawFeatures = Array.isArray(tier.features) ? tier.features : [];
    const featsHtml = rawFeatures.map(f => `
                  <li class="tier-feature-item"><span class="dot"></span><span>${inline(f)}</span></li>`).join('');

    return `              <div class="tier-card${isFeatured ? ' featured' : ''}">
                <div class="tier-top">
                  <h3 class="tier-name">${inline(tierName)}</h3>
                  <span class="tier-note">${inline(tierNote)}</span>
                </div>
                <div class="tier-price">${inline(tierPrice)}</div>
                <ul class="tier-features">${featsHtml}
                </ul>
                <button class="tier-btn" type="button">${inline(tierCta)}</button>
              </div>`;
  }).join('\n');

  const activeClass = index === 0 ? ' active' : '';

  return `      <!-- Slide ${String(index + 1).padStart(2, '0')}: Pricing -->
      <article class="slide-item${activeClass}" id="slide-${index}">
        <div class="slide-pricing">
          <div class="img-col">
            <img src="${imgSrc}" alt="${inline(title)}">
            <div class="overlay-gradient"></div>
            <div class="rail-content">
              <div class="rail-title">${inline(railTitle)}</div>
              <div class="rail-sub">${inline(railSub)}</div>
            </div>
          </div>
          <div class="content-col">
            <span class="mono-kicker">${inline(kicker)}</span>
            <h2 class="headline">${inline(title)}</h2>
            <div class="pricing-grid">
${pricingTiersHtml}
            </div>
          </div>
        </div>
      </article>`;
}

// 7. Metrics: "proof band" — number band left (8-col), image rail right (4-col).
// Native Aperture extension. Traction/proof content is a figure grid, not a
// product spec sheet, so it must not borrow the product layout (which pairs a
// macro product photo with the stats).
function renderMetrics(slide, brand, indexOrAsset = 6, assetsDir = '', totalSlides = 9) {
  slide = slide || {};
  const { index, imgSrc } = resolveSlideParams(slide, brand, 6, 'metrics', indexOrAsset, assetsDir, totalSlides);

  const title = slide.title != null ? String(slide.title) : String(slide.h1 || 'Pencapaian & Bukti');
  const kicker = slide.kicker || 'Validasi & metrik';
  const railLabel = slide.railLabel || slide.rail || 'Bukti';

  const content = sanitizeSlideContent(slide.content || slide.raw || '').trim();
  const lines = content.replace(/<!--[\s\S]*?-->/g, '').split('\n').map(l => l.trim()).filter(Boolean);

  let desc = slide.desc || slide.subtitle || '';
  let honesty = '';
  const metrics = [];

  if (Array.isArray(slide.stats)) {
    metrics.push(...slide.stats.map(s => ({
      metric: s.metric || s.value || s.number || '',
      label: s.label || s.desc || s.title || ''
    })));
  } else {
    for (const line of lines) {
      if (/^\*?\*?intinya[:*\s]/i.test(line)) {
        honesty = line.replace(/^\*{0,2}intinya[:*\s]*\*{0,2}\s*/i, '').replace(/\*\*/g, '').trim();
        continue;
      }
      const bullet = line.match(/^[-*]\s+(.+)$/);
      if (bullet) {
        const m = parseMetricBullet(bullet[1]);
        metrics.push({ metric: m.metric, label: m.metric ? (m.label || m.title) : (m.title || m.label) });
        continue;
      }
      if (!desc) desc = line;
    }
  }

  const usable = metrics.filter(m => m.metric || m.label);
  if (usable.length === 0) {
    console.warn(`[modern] metrics slide ${index + 1} has zero metrics; rendering empty band`);
  }
  const cellsHtml = usable.slice(0, 4).map(m => `              <div class="metric-cell${m.metric ? '' : ' no-metric'}">
                ${m.metric ? `<div class="metric-value">${inline(m.metric)}</div>` : ''}
                <div class="metric-label">${inline(m.label)}</div>
              </div>`).join('\n');

  const activeClass = index === 0 ? ' active' : '';

  return `      <!-- Slide ${String(index + 1).padStart(2, '0')}: Metrics (Traction & Proof) -->
      <article class="slide-item${activeClass}" id="slide-${index}">
        <div class="slide-metrics">
          <div class="band-col">
            <span class="mono-kicker">${inline(kicker)}</span>
            <h2 class="headline">${inline(title)}</h2>
            ${desc ? `<p class="desc">${inline(desc)}</p>` : ''}
            <div class="metrics-band">
${cellsHtml}
            </div>
            ${honesty ? `<p class="metrics-note">${inline(honesty)}</p>` : ''}
          </div>
          <div class="img-col">
            <img src="${imgSrc}" alt="${inline(title)}">
            <span class="rail-label">${inline(railLabel)}</span>
          </div>
        </div>
      </article>`;
}

// 8. Ecosystem: "system map" — image rail left (4-col) + hairline node matrix
// right (8-col). Each node is { name, role } parsed from the draft bullets;
// structural default labels are never invented (empty matrix + console.warn).
function renderEcosystem(slide, brand, indexOrAsset = 7, assetsDir = '', totalSlides = 9) {
  slide = slide || {};
  const { index, imgSrc } = resolveSlideParams(slide, brand, 7, 'ecosystem', indexOrAsset, assetsDir, totalSlides);

  const title = slide.title != null ? String(slide.title) : String(slide.h1 || 'Arsitektur & Ekosistem');
  const kicker = slide.kicker || 'Arsitektur sistem';
  const caption = slide.caption || 'Cara kerja';

  const content = sanitizeSlideContent(slide.content || slide.raw || '').trim();
  const { introText, cards } = parseEditorialCards(content);

  let nodes;
  if (Array.isArray(slide.items)) {
    nodes = slide.items.map(i => ({ name: i.name || i.title || '', role: i.role || i.desc || i.detail || '' }));
  } else if (Array.isArray(slide.nodes)) {
    nodes = slide.nodes.map(i => ({ name: i.name || i.title || '', role: i.role || i.desc || '' }));
  } else {
    nodes = cards.map(c => ({ name: c.title, role: c.desc }));
  }
  nodes = nodes.filter(n => n.name || n.role);

  if (nodes.length === 0) {
    console.warn(`[modern] ecosystem slide ${index + 1} has zero nodes; rendering empty matrix`);
  }

  const nodesHtml = nodes.slice(0, 4).map((n, i) => `              <div class="ecosystem-node">
                <span class="node-index">${String(i + 1).padStart(2, '0')}</span>
                <h3 class="node-name">${inline(n.name)}</h3>
                <p class="node-role">${inline(n.role)}</p>
              </div>`).join('\n');

  const activeClass = index === 0 ? ' active' : '';

  return `      <!-- Slide ${String(index + 1).padStart(2, '0')}: Ecosystem (System Map) -->
      <article class="slide-item${activeClass}" id="slide-${index}">
        <div class="slide-ecosystem">
          <div class="img-col">
            <img src="${imgSrc}" alt="${inline(title)}">
            <span class="caption">${inline(caption)}</span>
          </div>
          <div class="text-col">
            <span class="mono-kicker">${inline(kicker)}</span>
            <h2 class="headline">${inline(title)}</h2>
            ${introText ? `<p class="desc">${inline(introText)}</p>` : ''}
            <div class="ecosystem-grid">
${nodesHtml}
            </div>
          </div>
        </div>
      </article>`;
}

// 9. Closing: 12-col split — rail photo left, contact matrix + CTA right.
// Contact values pass through sanitizeContactDetails(), so reviewer placeholders
// ("[Nomor WhatsApp]", "[Email Resmi]", "[Alamat Kantor]") never reach the
// published deck as raw brackets and are never replaced with fabricated
// numbers either (Zero-Hallucination rule). Nothing is invented: the CTA link is
// only emitted when a real e-mail/URL was supplied in the draft.
function renderClosing(slide, brand, indexOrAsset = 6, assetsDir = '', totalSlides = 7) {
  slide = slide || {};
  const { index, imgSrc } = resolveSlideParams(slide, brand, 6, 'closing', indexOrAsset, assetsDir, totalSlides);

  const title = slide.title != null ? String(slide.title) : String(slide.h1 || 'Hubungi Kami');
  const kicker = slide.kicker || 'Hubungi kami';
  const railLabel = slide.railLabel || slide.rail || 'Langkah berikutnya';
  const ctaLabel = slide.cta || 'Mulai sekarang';

  const content = sanitizeSlideContent(sanitizeContactDetails(slide.content || slide.raw || ''));
  const lines = content.replace(/<!--[\s\S]*?-->/g, '').split('\n').map(l => l.trim()).filter(Boolean);

  let desc = slide.desc || slide.subtitle || '';
  const contacts = [];
  const notes = [];
  for (const line of lines) {
    if (line.startsWith('#')) continue;
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const body = bullet ? bullet[1].trim() : line;
    const named = body.match(/^\*\*([^*]+)\*\*\s*[:—–-]?\s*(.*)$/) || body.match(/^([^:]{2,40}?)\s*:\s*(.+)$/);
    if (named) {
      const label = named[1].replace(/[*_`]/g, '').replace(/[:—–-]\s*$/, '').trim();
      const value = (named[2] || '').replace(/[*_`]/g, '').trim();
      if (label && value) {
        // Only contact-shaped labels belong in the contact matrix; commitment /
        // benefit bullets become a plain note list instead of fake contacts.
        (CONTACT_LABEL_RE.test(label) ? contacts : notes).push({ label, value });
        continue;
      }
    }
    if (!desc) desc = body;
  }

  if (contacts.length === 0) {
    console.warn(`[modern] closing slide ${index + 1} has zero contacts; rendering CTA without the contact matrix`);
  }

  const notesHtml = notes.slice(0, 4).map(n => `              <li><span class="dot"></span><span><strong>${inline(n.label)}</strong> — ${inline(n.value)}</span></li>`).join('\n');

  const iconFor = (label) => {
    const l = String(label || '').toLowerCase();
    if (/whatsapp|telepon|phone|telp|wa\b/.test(l)) return '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>';
    if (/email|mail|surat/.test(l)) return '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>';
    if (/web|situs|url|tautan|link/.test(l)) return '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>';
    return '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>';
  };

  const contactsHtml = contacts.slice(0, 4).map(c => `              <div class="contact-row">
                <span class="contact-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconFor(c.label)}</svg></span>
                <span class="contact-meta">
                  <span class="contact-label">${inline(c.label)}</span>
                  <span class="contact-value">${inline(c.value)}</span>
                </span>
              </div>`).join('\n');

  // Real link derived from supplied data only (never fabricated).
  const linkValue = contacts.map(c => c.value).find(v => /@/.test(v) || /^https?:\/\//i.test(v) || /^[\w.-]+\.(id|com|co|net|org|io)(\/|$)/i.test(v));
  let href = null;
  if (linkValue) {
    if (/^https?:\/\//i.test(linkValue)) href = linkValue;
    else if (/@/.test(linkValue)) href = `mailto:${linkValue.split(/[\s,]/)[0]}`;
    else href = `https://${linkValue.split(/[\s,]/)[0]}`;
  }
  const ctaHtml = href
    ? `<a class="closing-cta" href="${inline(href)}">${inline(ctaLabel)}</a>`
    : `<button class="closing-cta" type="button">${inline(ctaLabel)}</button>`;

  const activeClass = index === 0 ? ' active' : '';

  return `      <!-- Slide ${String(index + 1).padStart(2, '0')}: Closing (CTA & Contact) -->
      <article class="slide-item${activeClass}" id="slide-${index}">
        <div class="slide-closing">
          <div class="img-col">
            <img src="${imgSrc}" alt="${inline(title)}">
            <span class="rail-label">${inline(railLabel)}</span>
          </div>
          <div class="content-col">
            <span class="mono-kicker">${inline(kicker)}</span>
            <h2 class="headline">${inline(title)}</h2>
            ${desc ? `<p class="closing-desc">${inline(desc)}</p>` : ''}
            ${notesHtml ? `<ul class="closing-notes">
${notesHtml}
            </ul>` : ''}
            ${contactsHtml ? `<div class="closing-contacts">
${contactsHtml}
            </div>` : ''}
            <div class="closing-actions">${ctaHtml}</div>
          </div>
        </div>
      </article>`;
}

// Cinematic dispatcher: routes to the 7 archetype renderers
function renderCinematicSlide(slide, arg2, arg3, arg4, arg5) {
  let index = 0;
  let totalSlides = 6;
  let brand = {};
  let assetsDir = '';
  let assetMap = null;

  if (typeof arg2 === 'number') {
    index = arg2;
    totalSlides = typeof arg3 === 'number' ? arg3 : 6;
    brand = typeof arg4 === 'object' && arg4 !== null ? arg4 : {};
    assetsDir = typeof arg5 === 'string' ? arg5 : '';
  } else if (typeof arg2 === 'object' && arg2 !== null) {
    brand = arg2;
    if (typeof arg3 === 'object' && arg3 !== null) {
      assetMap = arg3;
    } else if (typeof arg3 === 'string') {
      assetsDir = arg3;
    }
    index = slide && typeof slide.index === 'number' ? slide.index : 0;
    totalSlides = slide && typeof slide.total === 'number' ? slide.total : 6;
  }

  slide = slide || {};
  if (assetMap && !slide.assetMap) {
    slide = Object.assign({}, slide, { assetMap });
  }

  const arch = classifyCinematicArchetype(slide, index, totalSlides);
  switch (arch) {
    case 'cover': return renderCover(slide, brand, index, assetsDir, totalSlides);
    case 'problem': return renderProblem(slide, brand, index, assetsDir, totalSlides);
    case 'product': return renderProduct(slide, brand, index, assetsDir, totalSlides);
    case 'features': return renderFeatures(slide, brand, index, assetsDir, totalSlides);
    case 'usp': return renderUsp(slide, brand, index, assetsDir, totalSlides);
    case 'metrics': return renderMetrics(slide, brand, index, assetsDir, totalSlides);
    case 'ecosystem': return renderEcosystem(slide, brand, index, assetsDir, totalSlides);
    case 'closing': return renderClosing(slide, brand, index, assetsDir, totalSlides);
    case 'pricing': {
      // Zero-tier safety: an offer slide with no table/items would otherwise
      // ship an empty tier grid. Fall back to the features list layout.
      const content = String(slide.content || slide.raw || '').replace(/<!--[\s\S]*?-->/g, '');
      const tableRows = content.split('\n').filter(l => l.trim().startsWith('|')).length;
      const hasTiers = (Array.isArray(slide.tiers) && slide.tiers.length > 0)
        || (Array.isArray(slide.items) && slide.items.length > 0)
        || tableRows >= 3;
      if (!hasTiers) return renderFeatures(slide, brand, index, assetsDir, totalSlides);
      return renderPricing(slide, brand, index, assetsDir, totalSlides);
    }
    default: return renderProduct(slide, brand, index, assetsDir, totalSlides);
  }
}

// Entry point used by build-deck.js `renderSlide()`. The cinematic classifier
// only ever returns names in CINEMATIC_ARCHETYPES, so this is a straight
// delegation — there is no second (legacy) dispatch table to drift out of sync.
function renderModernSlide(slide, index, totalSlides, brand, assetsDir = '') {
  return renderCinematicSlide(slide, index, totalSlides, brand, assetsDir);
}

module.exports = {
  CINEMATIC_ARCHETYPES,
  CINEMATIC_SLOT_MAP,
  classifyCinematicArchetype,
  classifyModernArchetype,
  renderCinematicSlide,
  renderCover,
  renderProblem,
  renderProduct,
  renderFeatures,
  renderUsp,
  renderPricing,
  renderMetrics,
  renderEcosystem,
  renderClosing,
  renderModernSlide
};
