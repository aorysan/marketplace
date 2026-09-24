const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const USER_AGENT = 'compro-builder/2.8 (+https://github.com/aorysan/compro)';
const OPENVERSE_API = 'https://api.openverse.org/v1/images/';

const CURATED_IMAGE_CATALOG = {
  'architecture-portrait': [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&h=1200&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&h=1200&q=80'
  ],
  'architecture-modern': [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&h=900&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1600&h=900&q=80'
  ],
  'creative-meeting': [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&h=1200&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&h=1200&q=80'
  ],
  'tech-workspace': [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&h=1200&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&h=1200&q=80'
  ],
  'corporate-team': [
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&h=900&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&h=1200&q=80'
  ]
};

const SLOT_MAP = {
  'hero': { category: 'architecture-portrait', orientation: 'portrait', fallback: 'hero-fallback.svg' },
  'problem': { category: 'architecture-portrait', orientation: 'portrait', fallback: 'problem-fallback.svg' },
  'solution': { category: 'creative-meeting', orientation: 'portrait', fallback: 'solution-fallback.svg' },
  'features': { category: 'tech-workspace', orientation: 'portrait', fallback: 'services-fallback.svg' },
  'services': { category: 'tech-workspace', orientation: 'portrait', fallback: 'services-fallback.svg' },
  'ecosystem': { category: 'tech-workspace', orientation: 'landscape', fallback: 'services-fallback.svg' },
  'traction': { category: 'architecture-portrait', orientation: 'portrait', fallback: 'metrics-fallback.svg' },
  'metrics': { category: 'architecture-portrait', orientation: 'portrait', fallback: 'metrics-fallback.svg' },
  'differentiator': { category: 'architecture-portrait', orientation: 'portrait', fallback: 'problem-fallback.svg' },
  'pricing': { category: 'tech-workspace', orientation: 'portrait', fallback: 'services-fallback.svg' },
  'closing': { category: 'corporate-team', orientation: 'portrait', fallback: 'closing-fallback.svg' },
  // Aperture Cinematic slots (Task 1): every CINEMATIC_SLOT_MAP value must
  // resolve here so acquireSlotImage never falls through to an undefined
  // category/fallback. Categories reuse the existing curated catalog;
  // fallbacks reuse existing on-disk SVGs (no new fallback art added).
  'macro': { category: 'tech-workspace', orientation: 'landscape', fallback: 'solution-fallback.svg' },
  'hands': { category: 'creative-meeting', orientation: 'portrait', fallback: 'services-fallback.svg' },
  'viewfinder': { category: 'architecture-modern', orientation: 'landscape', fallback: 'problem-fallback.svg' },
  'lens': { category: 'tech-workspace', orientation: 'portrait', fallback: 'services-fallback.svg' }
};

function mapCommentToSlot(commentStr) {
  if (!commentStr) return { slot: 'hero', ...SLOT_MAP['hero'] };
  const match = commentStr.match(/<!--\s*image:\s*([a-zA-Z0-9_-]+)/i);
  const slot = match ? match[1].toLowerCase() : 'hero';
  const mapped = SLOT_MAP[slot] || SLOT_MAP['hero'];
  return { slot, ...mapped };
}

function downloadFile(url, destPath, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        timeout: timeoutMs,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'image/*,*/*;q=0.8'
        }
      },
      response => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          response.resume();
          const redirectUrl = new URL(response.headers.location, url).toString();
          return downloadFile(redirectUrl, destPath, timeoutMs).then(resolve).catch(reject);
        }
        if (response.statusCode !== 200) {
          response.resume();
          return reject(new Error(`HTTP Status ${response.statusCode}`));
        }
        const file = fs.createWriteStream(destPath);
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(destPath));
        });
        file.on('error', err => {
          file.close();
          fs.unlink(destPath, () => {});
          reject(err);
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      fs.unlink(destPath, () => {});
      reject(new Error('Request timeout'));
    });

    req.on('error', err => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function fetchJson(url, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        timeout: timeoutMs,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json'
        }
      },
      response => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          response.resume();
          return fetchJson(new URL(response.headers.location, url).toString(), timeoutMs)
            .then(resolve)
            .catch(reject);
        }
        if (response.statusCode !== 200) {
          response.resume();
          return reject(new Error(`HTTP Status ${response.statusCode}`));
        }
        const chunks = [];
        response.on('data', c => chunks.push(c));
        response.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.on('error', reject);
  });
}

/** Pure: build a short web-image search query from directive + slide context. */
function buildWebSearchQuery({ keywords, query, title, slot } = {}) {
  const clean = v => String(v || '')
    .replace(/[,;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const kw = clean(keywords);
  if (kw) return kw.slice(0, 120);
  const q = clean(query);
  if (q) return q.slice(0, 120);
  const t = clean(title);
  const s = clean(slot).replace(/-/g, ' ');
  if (t && s) return `${t} ${s}`.slice(0, 120);
  if (t) return t.slice(0, 120);
  if (s) return `${s} photo`.slice(0, 120);
  return '';
}

/** Pure: alternate shorter query when the primary Openverse query is empty/noisy. */
function buildWebSearchFallbackQuery(searchQuery) {
  const words = String(searchQuery || '')
    .replace(/[,;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  if (words.length <= 4) return '';
  return words.slice(0, 4).join(' ');
}

/** Pure: Openverse image search URL (keyless). */
function buildOpenverseUrl(query, opts = {}) {
  const pageSize = opts.pageSize || 12;
  const params = new URLSearchParams({
    q: String(query || '').trim(),
    page_size: String(pageSize),
    mature: 'false'
  });
  // license_type=commercial alone is too strict (drops most Flickr CC-BY hits).
  // commercial+modification still keeps commercially usable free licenses.
  if (opts.licenseType !== false) {
    params.set('license_type', opts.licenseType || 'commercial,modification');
  }
  if (opts.extension) params.set('extension', opts.extension);
  return `${OPENVERSE_API}?${params.toString()}`;
}

/** Pure: progressive query ladder — full → drop last words → slot generic. */
function buildWebSearchQueryLadder({ keywords, query, title, slot } = {}) {
  const primary = buildWebSearchQuery({ keywords, query, title, slot });
  const ladder = [];
  const push = q => {
    const t = String(q || '').trim();
    if (t && !ladder.includes(t)) ladder.push(t);
  };
  push(primary);
  const shorter = buildWebSearchFallbackQuery(primary);
  push(shorter);
  const words = String(primary || '').split(' ').filter(Boolean);
  if (words.length > 2) push(words.slice(0, Math.max(2, Math.floor(words.length / 2))).join(' '));
  if (words.length > 2) push(words.slice(0, 2).join(' '));
  const slotKey = String(slot || '').toLowerCase();
  const slotGeneric = {
    hero: 'modern office architecture',
    problem: 'office paperwork desk',
    solution: 'creative workspace laptop',
    features: 'technology workspace screens',
    services: 'business team technology',
    ecosystem: 'network technology abstract',
    metrics: 'architecture concrete minimal',
    traction: 'architecture concrete minimal',
    differentiator: 'notebook desk comparison',
    pricing: 'office desk business',
    closing: 'team collaboration office',
    macro: 'product macro detail',
    hands: 'hands using laptop',
    viewfinder: 'camera viewfinder dark',
    lens: 'camera lens closeup'
  }[slotKey];
  push(slotGeneric);
  return ladder;
}

function scoreWebImageResult(result, orientation) {
  const w = Number(result && result.width) || 0;
  const h = Number(result && result.height) || 0;
  let score = 0;
  if (w > 0 && h > 0) {
    if (orientation === 'landscape' && w >= h) score += 3;
    if (orientation === 'landscape' && w < h) score -= 2;
    if (orientation === 'portrait' && h >= w) score += 3;
    if (orientation === 'portrait' && h < w) score -= 2;
    score += Math.min(Math.max(w, 0), 1600) / 800;
  } else {
    score -= 1;
  }
  const url = String((result && result.url) || '');
  if (/\.jpe?g(\?|$)/i.test(url)) score += 1;
  if (/unsplash|wikimedia|staticflickr|flickr/i.test(url)) score += 0.5;
  return score;
}

/**
 * Search the open web for slide images (Openverse, no API key).
 * Returns [{ url, width, height, title }] sorted best-first. Empty on failure.
 */
async function searchWebImages(searchQuery, opts = {}) {
  const q = buildWebSearchQuery({ keywords: searchQuery });
  if (!q) return [];
  const orientation = opts.orientation || '';
  const timeoutMs = opts.timeoutMs || 4000;
  try {
    const data = await fetchJson(buildOpenverseUrl(q, { pageSize: opts.pageSize || 12 }), timeoutMs);
    const results = Array.isArray(data && data.results) ? data.results : [];
    return results
      .filter(r => r && typeof r.url === 'string' && /^https?:/i.test(r.url))
      .map(r => ({
        url: r.url,
        width: Number(r.width) || 0,
        height: Number(r.height) || 0,
        title: r.title || '',
        score: scoreWebImageResult(r, orientation)
      }))
      .sort((a, b) => b.score - a.score);
  } catch (err) {
    console.warn(`[WARN] Openverse search failed for "${q}": ${err.message || err.code || 'unknown error'}`);
    return [];
  }
}

/**
 * Web-search then download first usable image. Returns destPath or null.
 * Walks a query ladder (full keywords → shorter → slot generic) so niche
 * marketing phrases still resolve to something topical.
 * Does not apply local SVG fallback (caller cascades tiers).
 */
async function fetchWebSearchImage(opts = {}) {
  const { searchQuery, destPath, orientation = 'portrait', timeoutMs = 4000, picked, slot } = opts;
  if (!searchQuery || !destPath) return null;
  if (process.env.COMPRO_OFFLINE === '1') return null;
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  const ladder = buildWebSearchQueryLadder({
    keywords: searchQuery,
    slot
  });

  for (const q of ladder) {
    const candidates = await searchWebImages(q, { orientation, timeoutMs });
    const ranked = candidates.filter(c => !(picked && picked.has(c.url)));
    if (ranked.length === 0) continue;
    // Prefer preferred orientation, but still accept any usable photo.
    const preferred = ranked.filter(c => {
      if (orientation === 'landscape') return c.width >= c.height;
      if (orientation === 'portrait') return c.height >= c.width;
      return true;
    });
    const queue = preferred.length > 0 ? preferred : ranked;
    for (const cand of queue.slice(0, 5)) {
      try {
        await downloadFile(cand.url, destPath, 4000);
        if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1024) {
          if (picked) picked.add(cand.url);
          return destPath;
        }
      } catch (e) {
        try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (_) {}
      }
    }
  }
  return null;
}

async function fetchImageWithFallback(options = {}) {
  const { category, destPath, slot = 'hero', forceFallback = false, _forceUrl, allowSvgFallback = true } = options;
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  const fallbackFile = (SLOT_MAP[slot] && SLOT_MAP[slot].fallback) || 'hero-fallback.svg';
  const localFallbackPath = path.join(__dirname, '..', 'templates', 'assets', 'fallback', fallbackFile);

  const applyFallback = () => {
    if (fs.existsSync(localFallbackPath)) {
      // Ensure SVG fallback retains .svg extension; do not save SVG XML into a .jpg file
      const svgDestPath = destPath.replace(/\.jpe?g$/i, '.svg');
      fs.copyFileSync(localFallbackPath, svgDestPath);
      if (fs.existsSync(destPath) && destPath !== svgDestPath) {
        try { fs.unlinkSync(destPath); } catch (e) {}
      }
      return svgDestPath;
    }
    throw new Error(`Fallback SVG not found at ${localFallbackPath}`);
  };

  const svgDestPath = destPath.replace(/\.jpe?g$/i, '.svg');

  // Idempotency: skip if already valid (> 1024 bytes for jpg, > 100 bytes for svg)
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1024) {
    return destPath;
  }
  if (fs.existsSync(svgDestPath) && fs.statSync(svgDestPath).size > 100) {
    return svgDestPath;
  }

  if (forceFallback) {
    return applyFallback();
  }

  const urls = CURATED_IMAGE_CATALOG[category] || CURATED_IMAGE_CATALOG['architecture-portrait'];
  const targetUrl = _forceUrl || urls[0];

  try {
    await downloadFile(targetUrl, destPath, 5000);
    return destPath;
  } catch (err) {
    console.warn(`[WARN] Primary CDN download failed for ${slot}: ${err.message}. Trying Picsum fallback...`);
    try {
      const picsumUrl = (SLOT_MAP[slot] && SLOT_MAP[slot].orientation === 'landscape')
        ? 'https://picsum.photos/1600/900'
        : 'https://picsum.photos/800/1200';
      await downloadFile(picsumUrl, destPath, 4000);
      return destPath;
    } catch (picsumErr) {
      if (!allowSvgFallback) {
        throw picsumErr;
      }
      console.warn(`[WARN] Picsum fallback failed: ${picsumErr.message}. Applying local SVG fallback.`);
      return applyFallback();
    }
  }
}

function pickCatalogUrl(poolUrls, slotIndex, slugHash) {
  if (!poolUrls || poolUrls.length === 0) throw new Error('empty image pool');
  let h = 0;
  const s = String(slugHash);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return poolUrls[(slotIndex + h) % poolUrls.length];
}

function buildPollinationsUrl(query, width, height) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=${width}&height=${height}&nologo=true`;
}

function fetchGeneratedImage(query, destPath, opts = {}) {
  const width = opts.width || 800;
  const height = opts.height || 1200;
  const timeoutMs = opts.timeoutMs || 5000;
  return downloadFile(buildPollinationsUrl(query, width, height), destPath, timeoutMs);
}

module.exports = {
  CURATED_IMAGE_CATALOG,
  SLOT_MAP,
  mapCommentToSlot,
  fetchImageWithFallback,
  pickCatalogUrl,
  buildPollinationsUrl,
  fetchGeneratedImage,
  buildWebSearchQuery,
  buildWebSearchFallbackQuery,
  buildWebSearchQueryLadder,
  buildOpenverseUrl,
  searchWebImages,
  fetchWebSearchImage
};
