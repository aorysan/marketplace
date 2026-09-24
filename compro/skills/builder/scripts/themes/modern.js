/* themes/modern.js — Modern multi-template renderers (cover, welcome/problem+solution,
   services, ecosystem, metrics, differentiator, pricing, closing, social-proof + dispatcher).
   Direct ports of congen6 build_deck.py sections 1-4, adapted to generic
   { title, content } slides with shared parsers from ../build-deck.
   Zero-hallucination rule: render only parsed cards (cards.slice(0,4) as-is);
   never invent default services/cards. Empty grid + console.warn on zero cards.
*/
const {
  inline,
  parseEditorialCards,
  extractBigNumberMetric,
  sanitizeSlideContent,
  sanitizeContactDetails,
  resolveSlideSlot,
  resolveSlideImageUrl
} = require('../build-deck');

function slideBadge(index, totalSlides) {
  return `${String(index + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
}

// Aperture Cinematic archetype set (migration SSOT): exactly these 6 names.
// Task 3's renderCinematicSlide dispatcher consumes the same 6 names.
const CINEMATIC_ARCHETYPES = ['cover', 'problem', 'product', 'features', 'usp', 'pricing'];

// Cinematic archetype -> legacy asset slot (imageFetcher SLOT_MAP keys).
// Slot values verified against imageFetcher SLOT_MAP / resolveSlideSlot in
// build-deck.js: macro/hands/viewfinder/lens entries were added there so
// every value resolves to a category + fallback — never undefined.
const CINEMATIC_SLOT_MAP = {
  cover: 'hero',
  problem: 'problem',
  product: 'macro',
  features: 'hands',
  usp: 'viewfinder',
  pricing: 'lens'
};

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
// title keywords beat body keywords; within each layer pricing > usp >
// problem > product > features (most specific first, e.g. "keunggulan
// kompetitif" hits usp before the generic "keunggulan" features rule).
function classifyCinematicArchetype(slide, index = 0, totalSlides = 1) {
  slide = slide || {};
  const { t, combined } = cinematicText(slide);

  // cover: slide 1 / title / hero
  if (index === 0) return 'cover';
  if (/profil|company profile|cover|hero/.test(t)) return 'cover';

  // Title-keyword layer
  if (/paket|harga|penawaran|pricing|investasi|kerjasama|\bplan\b|kontak|hubungi|contact/.test(t)) return 'pricing';
  if (/mengapa|kenapa|\bwhy\b|why us|nilai tambah|alasan|pembeda|keunggulan kompetitif|differentiator/.test(t)) return 'usp';
  if (/masalah|tantangan|pain|problem/.test(t)) return 'problem';
  if (/produk|overview|solusi|solution|\bvalue\b/.test(t)) return 'product';
  if (/fitur|layanan|keunggulan|capabilit|services|feature/.test(t)) return 'features';

  // Body/combined fallback layer, same order (cover stays title/positional-only)
  if (/paket|harga|penawaran|pricing|investasi|kerjasama|\bplan\b|kontak|hubungi|contact/.test(combined)) return 'pricing';
  if (/mengapa|kenapa|\bwhy\b|why us|nilai tambah|alasan|pembeda|keunggulan kompetitif|differentiator/.test(combined)) return 'usp';
  if (/masalah|tantangan|pain|problem/.test(combined)) return 'problem';
  if (/produk|overview|solusi|solution|\bvalue\b/.test(combined)) return 'product';
  if (/fitur|layanan|keunggulan|capabilit|services|feature/.test(combined)) return 'features';

  // Positional fallback (mirrors legacy index-1-problem / else-solution)
  return index === 1 ? 'problem' : 'product';
}

// Deprecated alias (Ruling-1): the single source of truth is
// classifyCinematicArchetype above. This thin wrapper keeps legacy callers
// working WITHOUT a second divergent logic copy.
function classifyModernArchetype(slide, index, totalSlides) {
  return classifyCinematicArchetype(slide, index, totalSlides);
}

// --- Aperture Cinematic 6 Archetype Renderers (Figma DOM Parity) ---

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
  const kicker = slide.kicker || 'The problem';
  const caption = slide.caption || 'The old way';
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

function parseMetricBullet(bulletLine) {
  if (!bulletLine) return { metric: '', label: '', title: '' };
  const clean = bulletLine.replace(/^[-*]\s*/, '').trim();
  const boldMatch = clean.match(/^\*\*([^*]+)\*\*\s*[:—–-]?\s*(.*)$/);
  if (boldMatch) {
    const part1 = boldMatch[1].trim();
    const part2 = boldMatch[2].trim();
    const isPart1Metric = /\d/.test(part1) && /^[$€£Rp~><]?\s*[\d.,]+[a-zA-Z%xX/]*$/i.test(part1);
    if (isPart1Metric) {
      return { metric: part1, label: part2 || part1, title: part2 };
    }
    const numInPart2 = part2.match(/^([$€£Rp~><]?\s*[\d.,]+[a-zA-Z%xX/]*)\b/i);
    if (numInPart2 && /\d/.test(numInPart2[1])) {
      return { metric: numInPart2[1].trim(), label: part1, title: part1 };
    }
    const m = extractBigNumberMetric(bulletLine);
    if (m.number && m.number !== '100%' && /\d/.test(m.number)) {
      return { metric: m.number, label: part1, title: part1 };
    }
    return { metric: '', label: part2, title: part1 };
  }
  const parts = clean.split(/[—–:-]/);
  if (parts.length > 1) {
    const p0 = parts[0].trim();
    const p1 = parts.slice(1).join(' ').trim();
    if (/\d/.test(p0) && /^[$€£Rp~><]?\s*[\d.,]+[a-zA-Z%xX/]*$/i.test(p0)) {
      return { metric: p0, label: p1, title: p1 };
    }
    if (/\d/.test(p1) && /^[$€£Rp~><]?\s*[\d.,]+[a-zA-Z%xX/]*$/i.test(p1)) {
      return { metric: p1, label: p0, title: p0 };
    }
    return { metric: '', label: p1, title: p0 };
  }
  const m = extractBigNumberMetric(bulletLine);
  if (m.number && m.number !== '100%' && /\d/.test(m.number)) {
    return { metric: m.number, label: m.desc || m.title, title: m.title };
  }
  return { metric: '', label: clean, title: clean };
}

// 3. Product: 2-col split, macro image with floating glass badge, 2x2 stat matrix
function renderProduct(slide, brand, indexOrAsset = 2, assetsDir = '', totalSlides = 6) {
  slide = slide || {};
  const { index, imgSrc } = resolveSlideParams(slide, brand, 2, 'macro', indexOrAsset, assetsDir, totalSlides);

  const title = slide.title != null ? String(slide.title) : String(slide.h1 || 'One body.\nEvery format.');
  const kicker = slide.kicker || 'The product';
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

  if (stats.length === 0) {
    console.warn(`[modern] product slide ${index + 1} has zero stats; rendering empty grid`);
  }

  const statsHtml = stats.slice(0, 4).map(st => `              <div class="stat-cell">
                <div class="stat-metric">${inline(st.metric)}</div>
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
  const kicker = slide.kicker || 'Key features';
  const railLabel = slide.railLabel || slide.rail || 'On board — everything you need';

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
  const kicker = slide.kicker || 'Why it wins';

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

// 6. Pricing: 12-col split, lens photo with "Ship it." watermark, 3 pricing tiers (featured tier inverted)
function renderPricing(slide, brand, indexOrAsset = 5, assetsDir = '', totalSlides = 6) {
  slide = slide || {};
  const { index, imgSrc } = resolveSlideParams(slide, brand, 5, 'lens', indexOrAsset, assetsDir, totalSlides);

  const title = slide.title != null ? String(slide.title) : String(slide.h1 || 'Pick a configuration.');
  const kicker = slide.kicker || 'Get yours';
  const railTitle = slide.railTitle || 'Ship it.';
  const railSub = slide.railSub || 'Free delivery worldwide';

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

// Cinematic dispatcher: routes to the 6 archetype renderers
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
    case 'pricing': {
      // Zero-tier safety: contact/CTA slides misclassified as pricing would
      // otherwise ship an empty tier grid. Fall back to features list layout.
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

// Modern dispatcher: archetype -> renderer.
// Task-1 compatibility shim: the unified classifyCinematicArchetype returns the
// 6 cinematic names, mapped here onto the closest existing modern renderer so
// no slide silently falls into `default`. Legacy 10-name outputs are still
// honored (alias-era callers). Superseded by Task 3's renderCinematicSlide.
function renderModernSlide(slide, index, totalSlides, brand, assetsDir = '') {
  const arch = classifyModernArchetype(slide, index, totalSlides);
  if (CINEMATIC_ARCHETYPES.includes(arch)) {
    return renderCinematicSlide(slide, index, totalSlides, brand, assetsDir);
  }
  switch (arch) {
    case 'solution': return renderModernWelcome(slide, brand, index, 'solution', assetsDir, totalSlides);
    case 'services': return renderModernServices(slide, brand, index, assetsDir, totalSlides);
    case 'feature-cards': return renderFeatureCards(slide, brand, index, assetsDir, totalSlides);
    case 'feature-split': return renderFeatureSplit(slide, brand, index, assetsDir, totalSlides);
    case 'ecosystem': return renderModernEcosystem(slide, brand, index, assetsDir, totalSlides);
    case 'metrics': return renderModernMetrics(slide, brand, index, assetsDir, totalSlides);
    case 'differentiator': return renderModernDifferentiator(slide, brand, index, assetsDir, totalSlides);
    case 'closing': return renderModernClosing(slide, brand, index, assetsDir, totalSlides);
    case 'social-proof': return renderModernSocialProof(slide, brand, index, assetsDir, totalSlides);
    default: return renderCinematicSlide(slide, index, totalSlides, brand, assetsDir);
  }
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
