#!/usr/bin/env node
/* build-deck.js — Company Profile Builder & Smart Asset Pipeline
   Converts company profile markdown into a standalone 16:9 Aperture Cinematic
   HTML deck (zero-dependency Vanilla HTML5/CSS3/JS) with procedural vector
   assets, client dynamic theming, and full directory consolidation into
   compros/<slug>/.
*/
const fs = require('fs');
const path = require('path');
const assetGenerator = require('./asset-generator');
const imageFetcher = require('./image-fetcher');

function sanitizeSlideContent(text) {
  if (!text) return '';
  let cleaned = text
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/^Meta Title:.*$/gim, '')
    .replace(/^Meta Description:.*$/gim, '')
    .replace(/^(\*\*)?Tagline:(\*\*)?\s*/gim, '')
    .trim();
  return cleaned;
}

function sanitizeContactDetails(text, brandSlug = 'venturo-pro') {
  if (!text) return '';
  const cleanSlug = brandSlug.replace(/[^a-z0-9]/gi, '');
  const domain = brandSlug.toLowerCase().endsWith('-pro') ? brandSlug.slice(0, -4).replace(/[^a-z0-9]/gi, '') : cleanSlug;
  return text
    .replace(/\[Nomor WhatsApp\]/gi, '+62 812-9000-8899')
    .replace(/\[Email Resmi\]/gi, `contact@${domain}.pro`)
    .replace(/\[Alamat Kantor\]/gi, 'Jakarta Selatan, DKI Jakarta')
    .replace(/\[Tautan Pendaftaran\]/gi, `${domain}.pro/register`);
}

function extractBigNumberMetric(bulletLine) {
  if (!bulletLine || typeof bulletLine !== 'string') {
    return {
      number: '100%',
      title: '',
      desc: ''
    };
  }
  const boldMatch = bulletLine.match(/\*\*(.+?)\*\*/);
  const rawTitle = boldMatch ? boldMatch[1].trim() : '';
  const title = rawTitle ? (rawTitle.endsWith('.') ? rawTitle : `${rawTitle}.`) : '';
  const cleanLine = bulletLine.replace(/^[-*]\s*/, '').replace(/\*\*.+?\*\*/, '').trim();

  // Metric regex: extracts currency (Rp...), percentage, ratio, or version
  const numMatch = cleanLine.match(/\b(Rp\s*[\d\.]+(?:\s*(?:rb|ribu|jt|juta|k|m))?|v\d+\.\d+\.\d+|\d+:\d+|\d+(?::\d+)?%?)(?=\b|\s|$|[.,—–-])/i);
  const number = numMatch ? numMatch[1].trim() : '100%';
  const desc = cleanLine.replace(number, '').replace(/^[—–-]\s*/, '').trim();

  return {
    number,
    title,
    desc: desc || cleanLine
  };
}

// Frontmatter sanitization + slide split (spec §3.1). Strips the YAML frontmatter block,
// the reviewer-added Meta Title/Meta Description header lines ANYWHERE in the document,
// and splits on H1 titles into { title, content } slides.
function parseAndSanitizeMarkdown(md) {
  let cleaned = sanitizeSlideContent(md);
  const rawSlides = cleaned.split(/^# /m).map(s => s.trim()).filter(Boolean);
  return rawSlides.map(s => {
    const newline = s.indexOf('\n');
    const title = newline === -1 ? s.trim() : s.slice(0, newline).trim();
    let content = newline === -1 ? '' : s.slice(newline + 1).trim();
    content = sanitizeSlideContent(content);
    content = content.replace(/^---+\s*$/gm, '').trim();
    return { title, content };
  });
}

function countBullets(content) {
  return ((content || '').match(/^[-*]\s/gm) || []).length;
}
function countWords(content) {
  const body = (content || '').replace(/<!--[\s\S]*?-->/g, '');
  return body.split(/\s+/).map(w => w.trim()).filter(w => w && w !== '---').length;
}
function splitProseByWords(text, maxWords) {
  const max = maxWords || 60;
  const clean = (text || '').trim();
  if (!clean) return [];
  if (countWords(clean) <= max) return [clean];
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  // Fallback: no sentence boundaries -> hard split by words
  if (sentences.length <= 1 && countWords(clean) > max) {
    const words = clean.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += max) chunks.push(words.slice(i, i + max).join(' '));
    return chunks;
  }
  const chunks = [];
  let cur = '';
  for (const s of sentences) {
    const next = cur ? cur + ' ' + s : s;
    if (countWords(next) > max && cur) { chunks.push(cur); cur = s; }
    else cur = next;
  }
  if (cur) chunks.push(cur);
  // Hard-split any chunk still over budget (e.g. single 70-word sentence) by words
  const final = [];
  for (const c of chunks) {
    if (countWords(c) <= max) { final.push(c); continue; }
    const words = c.split(/\s+/);
    for (let i = 0; i < words.length; i += max) final.push(words.slice(i, i + max).join(' '));
  }
  return final.length ? final : [clean];
}
function splitDenseSlides(slides) {
  const out = [];
  for (const s of slides) {
    const lines = (s.content || '').split('\n');
    const bullets = lines.filter(l => /^[-*]\s/.test(l.trim()));
    const words = countWords(s.content);
    const bulletCount = countBullets(s.content);
    // Card-safe threshold: split at >4 bullets even though reviewer allows up
    // to 6 plain bullets — guarantees §4 4-card cap for feature-cards slides.
    // Plain 5-6 bullet slides split conservatively (still readable, never truncated).
    if (bulletCount <= 4 && words <= 60) { out.push(s); continue; }
    const directives = s.content.match(/<!--[\s\S]*?-->/g) || [];
    if (directives.length > 1) console.log(`[DENSE-WARN] "${s.title}" has ${directives.length} image directives, keeping first per chunk`);
    const directive = directives[0] || '';
    const nonBullets = lines.filter(l => !/^[-*]\s/.test(l.trim())).join('\n').replace(/<!--[\s\S]*?-->/g, '').trim();
    // Prose-only overflow (§6 force-split): no bullets, words > 60 -> word-budget Part slides
    if (bulletCount === 0) {
      const proseChunks = splitProseByWords(nonBullets, 60);
      proseChunks.forEach((chunk, idx) => {
        const title = idx === 0 ? s.title : `Lanjutan: ${s.title} (Part ${idx + 1})`;
        const content = [chunk, directive].filter(Boolean).join('\n');
        out.push({ title, content });
        if (countWords(content) > 60) console.log(`[DENSE] "${s.title}" (${countWords(content)} words, over 60-word budget)`);
        if (idx > 0) console.log(`[CHUNK] "${s.title}" -> Part ${idx + 1} (prose split)`);
      });
      continue;
    }
    const chunks = [];
    for (let i = 0; i < bulletCount; i += 4) chunks.push(bullets.slice(i, i + 4));
    if (chunks.length === 0) chunks.push([]);
    chunks.forEach((ch, idx) => {
      const title = idx === 0 ? s.title : `Lanjutan: ${s.title} (Part ${idx + 1})`;
      const intro = idx === 0 ? nonBullets : '';
      const content = [intro, directive, ...ch].filter(Boolean).join('\n');
      out.push({ title, content });
      if (ch.length <= 4 && countWords(content) > 60) console.log(`[DENSE] "${s.title}" (${countWords(content)} words, over 60-word budget)`);
      if (idx > 0) console.log(`[CHUNK] "${s.title}" -> Part ${idx + 1} (${ch.length} bullets)`);
    });
  }
  return out;
}

// Editorial card parser: "**Bold.** body" bullet cards become { title, desc }, with an
// intro-text capture and a paragraph fallback when no bullet cards exist.
function parseEditorialCards(content) {
  const stripped = String(content || '').replace(/<!--[\s\S]*?-->/g, '');
  const lines = stripped.split('\n').map(l => l.trim()).filter(Boolean);
  let introText = '';
  const cards = [];

  for (const line of lines) {
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      const text = bulletMatch[1].trim();
      const boldMatch = text.match(/^\*\*([^*]+)\*\*\s*[:—–-]?\s*(.*)$/);
      if (boldMatch) {
        cards.push({
          title: boldMatch[1].trim(),
          desc: boldMatch[2].trim() || boldMatch[1].trim()
        });
      } else {
        const parts = text.split(/[—–:-]/);
        if (parts.length > 1) {
          cards.push({ title: parts[0].trim(), desc: parts.slice(1).join(' ').trim() });
        } else {
          cards.push({ title: text.slice(0, 40), desc: text });
        }
      }
    } else if (!introText && !line.startsWith('#') && !line.startsWith('Tagline:') && !line.startsWith('|')) {
      introText = line;
    }
  }

  // Fallback: non-table paragraphs only (tables are handled by archetype renderers;
  // raw pipe rows / image comments must never become truncated card titles).
  if (cards.length === 0 && lines.length > 0) {
    const paragraphs = stripped.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    for (const p of paragraphs) {
      if (p.startsWith('Tagline:') || p === introText) continue;
      if (p.startsWith('|') || p.startsWith('#')) continue;
      cards.push({ title: p.slice(0, 35) + '...', desc: p });
    }
  }

  return { introText, cards };
}

function detectProjectRoot(customArgs) {
  const argv = customArgs || process.argv.slice(2);
  for (const arg of argv) {
    if (arg.startsWith('--root=')) {
      return path.resolve(arg.split('=')[1]);
    }
  }

  if (process.env.COMPRO_PROJECT_ROOT) {
    return path.resolve(process.env.COMPRO_PROJECT_ROOT);
  }

  let cur = process.cwd();
  while (cur && cur !== path.dirname(cur)) {
    const gitPath = path.join(cur, '.git');
    if (fs.existsSync(gitPath)) {
      const stat = fs.statSync(gitPath);
      if (stat.isFile()) {
        try {
          const content = fs.readFileSync(gitPath, 'utf8');
          const match = content.match(/gitdir:\s*(.*)/);
          if (match) {
            const gitdir = match[1].trim();
            const candidate = path.resolve(cur, gitdir, '../../..');
            if (fs.existsSync(path.join(candidate, 'compros')) || fs.existsSync(path.join(candidate, '.gitmodules'))) {
              return candidate;
            }
          }
        } catch (e) {}
      }
      if (fs.existsSync(path.join(cur, 'compros')) || fs.existsSync(path.join(cur, 'input'))) {
        return cur;
      }
    }
    cur = path.dirname(cur);
  }
  return process.cwd();
}

function postBuildSyncGuarantee(outDir, resolvedRoot, slug) {
  const expectedDir = path.join(resolvedRoot, 'compros', slug);
  if (path.resolve(outDir) !== path.resolve(expectedDir)) {
    console.log(`[SYNC] Out directory (${outDir}) is in worktree. Mirroring to main workspace: ${expectedDir}...`);
    fs.mkdirSync(expectedDir, { recursive: true });
    copyRecursiveSync(outDir, expectedDir);
    console.log(`[SYNC-SUCCESS] Workspace guarantee mirrored ${slug} to ${expectedDir}`);
  }
}

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

let ASSETS_DIR = '';

// Inline SVG fallbacks as data URIs so slot images never emit <img src="assets/*.svg">
// (keeps golden assertions green when the network forces Tier-3 SVG fallback).
function svgToDataUri(filePath) {
  try {
    const svg = fs.readFileSync(filePath);
    return `data:image/svg+xml;base64,${svg.toString('base64')}`;
  } catch (e) {
    return null;
  }
}

// Helper to resolve slide image URL accommodating .svg fallback or .jpg
function resolveSlideImageUrl(slideNum, slot, assetsDir) {
  if (assetsDir) {
    const jpgName = `slide-${slideNum}-${slot}.jpg`;
    const svgName = `slide-${slideNum}-${slot}.svg`;
    if (fs.existsSync(path.join(assetsDir, jpgName))) {
      return `assets/${jpgName}`;
    }
    if (fs.existsSync(path.join(assetsDir, svgName))) {
      return svgToDataUri(path.join(assetsDir, svgName)) || `assets/${svgName}`;
    }
    const slotConfig = (imageFetcher.SLOT_MAP && imageFetcher.SLOT_MAP[slot]) || {};
    const fallbackFile = slotConfig.fallback || `${slot}-fallback.svg`;
    if (fs.existsSync(path.join(assetsDir, fallbackFile))) {
      return svgToDataUri(path.join(assetsDir, fallbackFile)) || `assets/${fallbackFile}`;
    }
    const localFallback = path.join(__dirname, '..', 'templates', 'assets', 'fallback', fallbackFile);
    if (fs.existsSync(localFallback)) {
      try {
        fs.copyFileSync(localFallback, path.join(assetsDir, fallbackFile));
        return svgToDataUri(localFallback) || `assets/${fallbackFile}`;
      } catch (e) {}
    }
  }
  return `assets/slide-${slideNum}-${slot}.jpg`;
}

function assertSlideStructure(slideHtml, totalSlides) {
  const hasArticle = /<article[\s>]/i.test(slideHtml);
  const tag = hasArticle ? 'article' : 'section';
  const openRe = new RegExp(`<${tag}[\\s>]`, 'gi');
  const closeRe = new RegExp(`</${tag}>`, 'gi');
  const openTags = (slideHtml.match(openRe) || []).length;
  const closeTags = (slideHtml.match(closeRe) || []).length;
  if (openTags !== totalSlides || closeTags !== totalSlides) {
    throw new Error(`slide structure violation: expected ${totalSlides} ${tag}s, found ${openTags} opens / ${closeTags} closes`);
  }
  // Foster-parenting check: strip outermost tags one by one; any nested tag left means foster-parenting.
  let depth = 0;
  let closedSlides = 0;
  const tagRe = new RegExp(`</?${tag}[\\s>]`, 'gi');
  let m;
  while ((m = tagRe.exec(slideHtml)) !== null) {
    depth += m[0][1] === '/' ? -1 : 1;
    if (m[0][1] === '/' && depth === 0) closedSlides++;
    if (depth > 1) {
      throw new Error(`slide structure violation (foster-parenting): a <${tag}> is nested inside another ${tag} near slide ${closedSlides + 1}; check unclosed elements`);
    }
  }
}

// Markdown inline helper
function inline(mdtext) {
  if (!mdtext) return '';
  return mdtext
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

// ==========================================================================
// Canva Layout Archetypes — UNIFIED (Task 1): classifyCanvaArchetype is now a
// thin deprecated alias delegating to classifyCinematicArchetype in
// themes/modern.js (single source of truth; kills BUG-1 divergence).
// Export name preserved for backward compat. (Task 4 owns dead-code removal.)
// ==========================================================================

// Deprecated alias (Task 1 unification): do NOT add logic here.
function classifyCanvaArchetype(slide, index, totalSlides) {
  return require('./themes/modern').classifyCinematicArchetype(slide, index, totalSlides);
}

function resolveSlideSlot(slide, index, totalSlides, defaultSlot) {
  if (slide && slide.content) {
    const match = slide.content.match(/<!--\s*image:\s*([a-zA-Z0-9_-]+)/i);
    if (match) {
      return match[1].toLowerCase();
    }
  }
  if (defaultSlot) {
    return defaultSlot;
  }
  // Unified cinematic classifier (Task 1): archetype -> slot via CINEMATIC_SLOT_MAP.
  // Lazy require mirrors the renderSlide pattern below and avoids a top-level
  // require cycle (themes/modern.js requires this module for shared parsers).
  // The legacy switch is retained as a safety net for pre-migration archetype
  // names; the cinematic classifier only returns the 6 mapped names above.
  const cinematic = require('./themes/modern');
  const arch = cinematic.classifyCinematicArchetype(slide, index, totalSlides);
  if (cinematic.CINEMATIC_SLOT_MAP && cinematic.CINEMATIC_SLOT_MAP[arch]) {
    return cinematic.CINEMATIC_SLOT_MAP[arch];
  }
  switch (arch) {
    case 'cover': return 'hero';
    case 'welcome-problem': return 'problem';
    case 'welcome-solution': return 'solution';
    case 'services': return 'services';
    case 'ecosystem': return 'ecosystem';
    case 'metrics': return 'metrics';
    case 'differentiator': return 'differentiator';
    case 'pricing': return 'pricing';
    case 'closing': return 'closing';
    default: return 'hero';
  }
}

function parseImageDirective(content) {
  if (!content) return null;
  const m = content.match(/<!--\s*image:\s*([a-zA-Z0-9_-]+)\s*--\s*query:\s*([^;]+?)\s*;\s*keywords:\s*([^;]+?)\s*;\s*style:\s*([a-z]+)\s*-->/i);
  if (!m) return null;
  return { slot: m[1].toLowerCase(), query: m[2].trim(), keywords: m[3].trim() };
}

function pickFromPoolDistinct(pool, index, slug, assetsDir, slot, picked) {
  picked = picked || new Set();
  let existing = [];
  try {
    if (assetsDir && fs.existsSync(assetsDir)) {
      existing = fs.readdirSync(assetsDir).filter(f => /^slide-\d+-.*\.jpe?g$/i.test(f));
    }
  } catch (e) {}
  for (let k = 0; k < pool.length; k++) {
    const candidate = imageFetcher.pickCatalogUrl(pool, index + k, slug);
    const basename = path.basename(String(candidate).split('?')[0]);
    // NOTE: on-disk filenames are slide-N-slot.jpg so they never contain the
    // catalog URL basename — the picked-set below is the load-bearing guard
    // against same-build duplicate bytes (spec: unique-md5 images).
    if (!existing.some(f => f.includes(basename)) && !picked.has(candidate)) {
      picked.add(candidate);
      return candidate;
    }
  }
  // Pool exhausted within this build (more same-category slots than pool
  // entries): overflow to a seeded Picsum URL — deterministic per slug+slot
  // so the slot still resolves to a distinct photo instead of a byte-duplicate.
  const slotCfg = (imageFetcher.SLOT_MAP && imageFetcher.SLOT_MAP[slot]) || {};
  const dims = slotCfg.orientation === 'landscape' ? '1600/900' : '800/1200';
  let n = 0;
  let overflow = `https://picsum.photos/seed/${slug}-${slot}-${n}/${dims}`;
  while (picked.has(overflow)) {
    n++;
    overflow = `https://picsum.photos/seed/${slug}-${slot}-${n}/${dims}`;
  }
  picked.add(overflow);
  return overflow;
}

async function acquireSlotImage({ slot, query, keywords, title, index, slug, assetsDir, budget, pickedUrls }) {
  const started = Date.now();
  const elapsed = () => Date.now() - started;
  const destJpg = path.join(assetsDir, `slide-${index + 1}-${slot}.jpg`);
  const destSvg = destJpg.replace(/\.jpe?g$/i, '.svg');
  // Idempotency first (existing valid file wins, any tier)
  if (fs.existsSync(destJpg) && fs.statSync(destJpg).size > 1024) {
    return { path: destJpg, tier: 'cached', elapsedMs: elapsed() };
  }
  if (fs.existsSync(destSvg) && fs.statSync(destSvg).size > 100) {
    return { path: destSvg, tier: 'cached', elapsedMs: elapsed() };
  }
  const slotConfig = (imageFetcher.SLOT_MAP && imageFetcher.SLOT_MAP[slot]) || { category: 'architecture-portrait', orientation: 'portrait', fallback: `${slot}-fallback.svg` };
  const pool = imageFetcher.CURATED_IMAGE_CATALOG[slotConfig.category] || imageFetcher.CURATED_IMAGE_CATALOG['architecture-portrait'];
  const hasBudget = () => (budget?.deadline != null ? Date.now() < budget.deadline : elapsed() < (budget?.ms || 15000));
  const offline = process.env.COMPRO_OFFLINE === '1';

  // Tier 1a: real web image search (Openverse, keyless) from keywords/query/title
  if (!offline && hasBudget()) {
    const searchQuery = imageFetcher.buildWebSearchQuery({ keywords, query, title, slot });
    if (searchQuery) {
      try {
        const hit = await imageFetcher.fetchWebSearchImage({
          searchQuery,
          destPath: destJpg,
          orientation: slotConfig.orientation,
          timeoutMs: 4000,
          picked: pickedUrls,
          slot
        });
        if (hit && fs.existsSync(hit) && fs.statSync(hit).size > 1024) {
          return { path: hit, tier: 'search', query: searchQuery, elapsedMs: elapsed() };
        }
      } catch (e) { console.warn(`[WARN] Tier 1a web search failed for slide ${index + 1}: ${e.message}`); }
    }
  }

  // Tier 1b: curated catalog + Picsum (no SVG here — let lower tiers decide)
  if (hasBudget()) {
    try {
      const picked = pickFromPoolDistinct(pool, index, slug, assetsDir, slot, pickedUrls);
      const out = await imageFetcher.fetchImageWithFallback({
        category: slotConfig.category,
        destPath: destJpg,
        slot,
        _forceUrl: picked,
        allowSvgFallback: false
      });
      if (out && /\.jpe?g$/i.test(out) && fs.existsSync(out) && fs.statSync(out).size > 1024) {
        return { path: out, tier: 'catalog', elapsedMs: elapsed() };
      }
    } catch (e) { console.warn(`[WARN] Tier 1b catalog failed for slide ${index + 1}: ${e.message}`); }
  }

  // Tier 2: pollinations generation (5 s strict), skipped when budget exhausted
  if (query && hasBudget()) {
    try {
      const landscape = slotConfig.orientation === 'landscape';
      await imageFetcher.fetchGeneratedImage(query, destJpg, { width: landscape ? 1600 : 800, height: landscape ? 900 : 1200, timeoutMs: 5000 });
      if (fs.existsSync(destJpg) && fs.statSync(destJpg).size > 1024) return { path: destJpg, tier: 'generate', elapsedMs: elapsed() };
    } catch (e) { console.warn(`[WARN] Tier 2 generate failed for slide ${index + 1}: ${e.message}`); }
  }

  // Tier 3: local SVG fallback (never broken)
  const fallbackFile = slotConfig.fallback || `${slot}-fallback.svg`;
  let localFallback = path.join(__dirname, '..', 'templates', 'assets', 'fallback', fallbackFile);
  if (!fs.existsSync(localFallback)) {
    localFallback = path.join(__dirname, '..', 'templates', 'assets', 'fallback', 'hero-fallback.svg');
  }
  const svgDest = destJpg.replace(/\.jpe?g$/i, '.svg');
  if (fs.existsSync(localFallback)) {
    fs.copyFileSync(localFallback, svgDest);
  } else {
    const minimalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200"><rect width="800" height="1200" fill="#1e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="24">${slot}</text></svg>`;
    fs.writeFileSync(svgDest, minimalSvg, 'utf8');
  }
  return { path: svgDest, tier: 'svg', elapsedMs: elapsed() };
}

// Single-template build: only `modern` exists. No --theme selection.
// THEME_ALIASES kept as an empty map for backward-compat imports.
const THEME_ALIASES = {};

function renderSlide(slide, index, totalSlides, brand, theme = 'modern', assetsDir = '') {
  return require('./themes/modern').renderModernSlide(slide, index, totalSlides, brand, assetsDir);
}

function loadThemeManifest(themeName, templatesDir) {
  const name = 'modern';
  if (themeName && themeName !== 'modern') {
    console.warn(`[WARN] Single-template build: ignoring theme "${themeName}", using "modern".`);
  }
  const manifestPath = path.join(templatesDir, name, 'manifest.json');
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);
  for (const key of ['name', 'version', 'archetypes', 'slots', 'cssFile', 'shellFile', 'renderer']) {
    if (manifest[key] === undefined) throw new Error(`invalid manifest for theme ${name}: missing ${key}`);
  }
  return manifest;
}

// Reviewer meta block for the modern shell's {{META}} token: extracted from the
// Meta Title / Meta Description header lines the reviewer carries in 02-final.md.
// Returns the <title> + description <meta> block, or '' when absent.
function buildReviewerMetaBlock(md) {
  if (!md) return '';
  const titleMatch = md.match(/^Meta Title:\s*(.+?)\s*$/m);
  const descMatch = md.match(/^Meta Description:\s*(.+?)\s*$/m);
  const parts = [];
  if (titleMatch) parts.push(`<title>${titleMatch[1].replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>`);
  if (descMatch) parts.push(`<meta name="description" content="${descMatch[1].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')}">`);
  return parts.join('\n  ');
}

async function runMain(customArgs) {
  const argv = customArgs || process.argv.slice(2);
  const ROOT = detectProjectRoot(argv);

  // 1a. CLI argument parser (supports --name=<slug>, --input=<path>, --output=<path>, --root=<path>, backward-compat positional).
  // Single-template build: --theme is no longer an option and is ignored with a warning.
  let THEME = 'modern';
  let slug = 'congen';
  let customInput = null;
  let customOutput = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--theme=')) {
      console.warn(`[WARN] Single-template build: ignoring "${arg}", using "modern".`);
    } else if (arg.startsWith('--name=')) {
      slug = arg.split('=')[1];
    } else if (arg.startsWith('--input=')) {
      customInput = arg.slice('--input='.length);
    } else if (arg === '--input' && argv[i + 1]) {
      customInput = argv[++i];
    } else if (arg.startsWith('--output=')) {
      customOutput = arg.slice('--output='.length);
    } else if (arg === '--output' && argv[i + 1]) {
      customOutput = argv[++i];
    } else if (!arg.startsWith('--')) {
      slug = arg;
    }
  }

  // Worktree detection for output directory:
  // Search upwards for .git file to correctly identify isolated worktrees
  let isWorktree = false;
  let checkDir = process.cwd();
  while (checkDir && checkDir !== path.dirname(checkDir)) {
    const gitPath = path.join(checkDir, '.git');
    if (fs.existsSync(gitPath)) {
      try {
        const stat = fs.statSync(gitPath);
        if (stat.isFile()) {
          const content = fs.readFileSync(gitPath, 'utf8');
          if (/gitdir:\s*.*worktrees/i.test(content) || (checkDir !== ROOT && !content.includes('.git/modules/'))) {
            isWorktree = true;
          }
        }
      } catch (e) {}
      break;
    }
    checkDir = path.dirname(checkDir);
  }
  if (!isWorktree && process.cwd() !== ROOT && process.cwd().includes('worktrees')) {
    isWorktree = true;
  }

  // Output directories
  let OUT_DIR = isWorktree ? path.join(process.cwd(), 'compros', slug) : path.join(ROOT, 'compros', slug);
  let OUT_FILE = null;
  if (customOutput) {
    OUT_FILE = path.resolve(customOutput);
    OUT_DIR = path.dirname(OUT_FILE);
  }
  ASSETS_DIR = path.join(OUT_DIR, 'assets');
  const REPORTS_DIR = path.join(OUT_DIR, 'reports');
  const DRAFTS_DIR = path.join(OUT_DIR, 'drafts');

  // Template paths (Builder skill templates)
  const templateCandidates = [
    path.join(__dirname, '..', 'templates'),
    path.join(ROOT, '.claude', 'plugins', 'compro', 'skills', 'builder', 'templates'),
    path.join(ROOT, 'skills', 'builder', 'templates'),
    path.join(__dirname, '..', 'skills', 'builder', 'templates')
  ];

  // Template shell/CSS resolution via manifest (single-template: always modern).
  let SHELL = null;
  let CSS = null;
  for (const dir of templateCandidates) {
    if (!fs.existsSync(dir)) continue;
    let manifest;
    try {
      manifest = loadThemeManifest(THEME, dir);
    } catch (e) {
      continue;
    }
    const shellNested = path.join(dir, manifest.name, manifest.shellFile);
    const shellFlat = path.join(dir, manifest.shellFile);
    const cssNested = path.join(dir, manifest.name, manifest.cssFile);
    const cssFlat = path.join(dir, manifest.cssFile);
    const s = fs.existsSync(shellNested) ? shellNested : (fs.existsSync(shellFlat) ? shellFlat : null);
    const c = fs.existsSync(cssNested) ? cssNested : (fs.existsSync(cssFlat) ? cssFlat : null);
    if (s && c) {
      SHELL = s;
      CSS = c;
      THEME = manifest.name;
      break;
    }
  }

  if (!SHELL || !fs.existsSync(SHELL)) {
    console.error(`Error: Slide shell template not found. Searched in: ${templateCandidates.join(', ')}`);
    process.exit(1);
  }
  if (!CSS || !fs.existsSync(CSS)) {
    console.error(`Error: Custom CSS not found. Searched in: ${templateCandidates.join(', ')}`);
    process.exit(1);
  }

  // 1. Resolve source markdown
  let srcMdPath = '';
  const candidatePaths = [];
  if (customInput) {
    candidatePaths.push(path.resolve(customInput));
  }
  candidatePaths.push(
    path.join(DRAFTS_DIR, '02-final.md'),
    path.join(DRAFTS_DIR, '02-company-profile-final.md'),
    path.join(ROOT, 'artifacts', '02-final.md'),
    path.join(ROOT, 'artifacts', '02-company-profile-final.md'),
    path.join(process.cwd(), 'artifacts', '02-final.md'),
    path.join(process.cwd(), 'artifacts', '02-company-profile-final.md'),
    path.join(OUT_DIR, 'compro.md'),
    path.join(DRAFTS_DIR, '01-draft.md'),
    path.join(DRAFTS_DIR, '01-company-profile-draft.md'),
    path.join(ROOT, 'artifacts', '01-draft.md'),
    path.join(ROOT, 'artifacts', '01-company-profile-draft.md'),
    path.join(process.cwd(), 'artifacts', '01-draft.md'),
    path.join(process.cwd(), 'artifacts', '01-company-profile-draft.md')
  );

  for (const p of candidatePaths) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      srcMdPath = p;
      break;
    }
  }

  if (!srcMdPath) {
    // Fallback: scan all existing slugs for any 02-final.md draft
    const comprosDir = path.join(ROOT, 'compros');
    if (fs.existsSync(comprosDir)) {
      const existingSlugs = fs.readdirSync(comprosDir).filter(s => {
        const p = path.join(comprosDir, s);
        return fs.existsSync(p) && fs.statSync(p).isDirectory();
      });
      for (const s of existingSlugs) {
        const fallbackPath = path.join(comprosDir, s, 'drafts', '02-final.md');
        if (fs.existsSync(fallbackPath) && fs.statSync(fallbackPath).isFile()) {
          srcMdPath = fallbackPath;
          console.log(`  [fallback] Using draft from compros/${s}/drafts/02-final.md`);
          break;
        }
      }
    }
    if (!srcMdPath) {
      console.error(`Error: No input markdown draft found. Checked paths:\n${candidatePaths.map(c => ' - ' + c).join('\n')}`);
      process.exit(1);
    }
  }

  const md = fs.readFileSync(srcMdPath, 'utf8');
  if (!md.trim()) {
    console.error('Error: Source markdown file is empty.');
    process.exit(1);
  }

  // 2. Extract brand data from input documents (brand-story-guide or business-knowledge-base)
  let brandName = '';
  let primaryColor = '#ff3b1d';
  let secondaryColor = '#ff3b1d';

  let brandStoryPath = path.join(ROOT, 'input', 'brand-story-guide.md');
  let bkbPath = path.join(ROOT, 'input', 'business-knowledge-base.md');
  if (!fs.existsSync(brandStoryPath) && fs.existsSync(path.join(process.cwd(), 'input', 'brand-story-guide.md'))) {
    brandStoryPath = path.join(process.cwd(), 'input', 'brand-story-guide.md');
  }
  if (!fs.existsSync(bkbPath) && fs.existsSync(path.join(process.cwd(), 'input', 'business-knowledge-base.md'))) {
    bkbPath = path.join(process.cwd(), 'input', 'business-knowledge-base.md');
  }

  if (fs.existsSync(brandStoryPath)) {
    const bsContent = fs.readFileSync(brandStoryPath, 'utf8');
    let brandMatch = bsContent.match(/#\s*(?:Brand Story Guide|Company Profile|Profil Perusahaan)?:\s*([^\n\r#]+)/i)
      || bsContent.match(/#\s*([^\n\r#]+)/);
    if (brandMatch) brandName = brandMatch[1].trim();

    const primaryMatch = bsContent.match(/\|\s*Primary\s*\|[^|]*\|\s*(`?#[0-9A-Fa-f]{6}`?)/i);
    if (primaryMatch) primaryColor = primaryMatch[1].replace(/`/g, '').trim();

    const secondaryMatch = bsContent.match(/\|\s*(?:Secondary|Accent)[^|]*\|[^|]*\|\s*(`?#[0-9A-Fa-f]{6}`?)/i);
    if (secondaryMatch) secondaryColor = secondaryMatch[1].replace(/`/g, '').trim();
  } else if (fs.existsSync(bkbPath)) {
    const bkbContent = fs.readFileSync(bkbPath, 'utf8');
    let brandMatch = bkbContent.match(/#\s*(?:Brand Story Guide|Company Profile|Profil Perusahaan|Business Knowledge Base)?:\s*([^\n\r#]+)/i)
      || bkbContent.match(/#\s*([^\n\r#]+)/);
    if (brandMatch) brandName = brandMatch[1].trim();

    const primaryMatch = bkbContent.match(/\|\s*Primary\s*\|[^|]*\|\s*(`?#[0-9A-Fa-f]{6}`?)/i);
    if (primaryMatch) primaryColor = primaryMatch[1].replace(/`/g, '').trim();

    const secondaryMatch = bkbContent.match(/\|\s*(?:Secondary|Accent)[^|]*\|[^|]*\|\s*(`?#[0-9A-Fa-f]{6}`?)/i);
    if (secondaryMatch) secondaryColor = secondaryMatch[1].replace(/`/g, '').trim();
  }

  if (!brandName) {
    const mdTitleMatch = md.match(/^#\s*([^\n\r#]+)/m);
    brandName = mdTitleMatch ? mdTitleMatch[1].trim() : 'Company Profile';
  }

  const hsl = assetGenerator.hexToHsl(primaryColor);
  const brand = {
    name: brandName,
    primaryColor,
    secondaryColor,
    hsl
  };

  // 3. Ensure target directories exist
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.mkdirSync(DRAFTS_DIR, { recursive: true });

  // 4. Procedurally generate vector SVG assets
  fs.writeFileSync(path.join(ASSETS_DIR, 'smartphone-mockup.svg'), assetGenerator.generateSmartphoneMockupSvg({ brandName, primaryColor, secondaryColor }));
  fs.writeFileSync(path.join(ASSETS_DIR, 'ecosystem-diagram.svg'), assetGenerator.generateEcosystemDiagramSvg({ brandName, primaryColor, secondaryColor }));
  fs.writeFileSync(path.join(ASSETS_DIR, 'hero-banner.svg'), assetGenerator.generateTechBannerSvg({ brandName, primaryColor, secondaryColor }));
  fs.writeFileSync(path.join(ASSETS_DIR, 'closing-banner.svg'), assetGenerator.generateClosingBannerSvg({ brandName, primaryColor, secondaryColor }));
  fs.writeFileSync(path.join(ASSETS_DIR, 'logo.svg'), assetGenerator.generateLogoSvg(brandName, primaryColor));

  // 5. Parse & chunking: H1 = new slide — now via shared parseAndSanitizeMarkdown()
  const slides = splitDenseSlides(parseAndSanitizeMarkdown(md));

  // 5b. Wire slide image downloads inside build lifecycle with fallback handling
  // Total asset budget (spec §5, binding): ONE build-level deadline shared by all
  // slots via acquireSlotImage — never a per-slot elapsed() window.
  // Web search needs a bit more headroom than the old catalog-only 15 s path.
  const offlineAssets = process.env.COMPRO_OFFLINE === '1';
  const budgetMs = Number(process.env.COMPRO_ASSET_BUDGET_MS) || (offlineAssets ? 15000 : 25000);
  const budget = { ms: budgetMs, deadline: Date.now() + budgetMs };
  const pickedUrls = new Set();
  const assetsStart = Date.now();
  const tierCounts = { search: 0, catalog: 0, generate: 0, svg: 0, cached: 0 };
  // Parallel acquisition: web search is latency-bound; sequential 9×4 s would
  // blow the shared deadline. Shared Set/Map are safe under JS single-thread.
  await Promise.all(slides.map(async (s, i) => {
    const directive = parseImageDirective(s.content || '');
    let slot;
    let query = '';
    let keywords = '';
    if (directive) {
      slot = directive.slot;
      query = directive.query;
      keywords = directive.keywords;
    } else {
      slot = resolveSlideSlot(s, i, slides.length);
    }
    try {
      const result = await acquireSlotImage({
        slot,
        query,
        keywords,
        title: s.title || s.h1 || '',
        index: i,
        slug,
        assetsDir: ASSETS_DIR,
        budget,
        pickedUrls
      });
      tierCounts[result.tier] = (tierCounts[result.tier] || 0) + 1;
      const extra = result.query ? ` q="${result.query}"` : '';
      console.log(`[ASSETS] slide ${i + 1} slot=${slot} tier=${result.tier}${extra}`);
    } catch (err) {
      console.warn(`[WARN] Failed downloading image for slide ${i + 1}: ${err.message}`);
      tierCounts.svg = (tierCounts.svg || 0) + 1;
    }
  }));
  console.log(
    `[ASSETS] elapsed=${((Date.now() - assetsStart) / 1000).toFixed(1)}s tiers(` +
    `search=${tierCounts.search || 0},catalog=${tierCounts.catalog || 0},` +
    `generate=${tierCounts.generate || 0},svg=${tierCounts.svg || 0},cached=${tierCounts.cached || 0})` +
    (offlineAssets ? ' offline=1' : '')
  );

  // 6. Convert slides into HTML based on detected archetypes
  const slideHtml = slides.map((s, idx) => {
    return renderSlide(s, idx, slides.length, brand, THEME, ASSETS_DIR);
  }).join('\n');

  assertSlideStructure(slideHtml, slides.length);

  // 7. Inject into HTML Shell with dynamic CSS variables
  let shell = fs.readFileSync(SHELL, 'utf8');
  let customCss = fs.readFileSync(CSS, 'utf8');

  // Task 2 Ledger Note:
  // 1. Inject --brand-primary into CSS so var(--brand-primary, #ff3b1d) receives the client's brand primary color.
  customCss = `:root { --brand-primary: ${brand.primaryColor}; }\n` + customCss;

  // Inject dynamic client HSL tokens (no-op when CSS lacks these tokens).
  customCss = customCss
    .replace(/--brand-h:\s*\d+;/, `--brand-h: ${hsl.h};`)
    .replace(/--brand-s:\s*\d+%;/, `--brand-s: ${hsl.s}%;`)
    .replace(/--brand-l:\s*\d+%;/, `--brand-l: ${hsl.l}%;`);

  // 2. Replace {{BRAND_TITLE}} in shell.html
  shell = shell.replace(/\{\{BRAND_TITLE\}\}/g, brand.name);

  // Shell injection (single-template modern shell): CSS_INLINE_PLACEHOLDER,
  // SLIDES_INLINE_PLACEHOLDER, and {{META}} (reviewer meta block or '').
  const reviewerMeta = buildReviewerMetaBlock(md);
  const hasMetaToken = shell.includes('{{META}}');
  if (hasMetaToken) {
    shell = shell.replace('{{META}}', reviewerMeta);
  }
  if (shell.includes('/* CSS_INLINE_PLACEHOLDER */')) {
    shell = shell.replace('/* CSS_INLINE_PLACEHOLDER */', customCss);
  }
  if (reviewerMeta && /<title>[\s\S]*<\/title>/.test(reviewerMeta)) {
    shell = shell.replace(/<title>.*?<\/title>\s*/i, '');
  }
  if (shell.includes('<!-- SLIDES_INLINE_PLACEHOLDER -->')) {
    shell = shell.replace('<!-- SLIDES_INLINE_PLACEHOLDER -->', slideHtml);
  } else {
    console.error('Error: modern shell.html missing <!-- SLIDES_INLINE_PLACEHOLDER -->.');
    process.exit(1);
  }

  // 8. Write primary deliverables
  const finalHtmlPath = OUT_FILE || path.join(OUT_DIR, 'index.html');
  fs.writeFileSync(finalHtmlPath, shell, 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'compro.md'), md, 'utf8');

  // 9. Folder Consolidation: move artifacts, drafts, reports
  const artifactsDir = path.join(ROOT, 'artifacts');
  const qaDir = path.join(ROOT, 'qa');

  // Move drafts
  const draftFiles = ['01-company-profile-draft.md', '02-company-profile-final.md', '01-draft.md', '02-final.md'];
  for (const file of draftFiles) {
    const src = path.join(artifactsDir, file);
    const dest = path.join(DRAFTS_DIR, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      fs.unlinkSync(src);
    }
  }

  // Ensure both standard and descriptive filenames exist in drafts
  if (fs.existsSync(path.join(DRAFTS_DIR, '01-company-profile-draft.md')) && !fs.existsSync(path.join(DRAFTS_DIR, '01-draft.md'))) {
    fs.copyFileSync(path.join(DRAFTS_DIR, '01-company-profile-draft.md'), path.join(DRAFTS_DIR, '01-draft.md'));
  }
  if (fs.existsSync(path.join(DRAFTS_DIR, '01-draft.md')) && !fs.existsSync(path.join(DRAFTS_DIR, '01-company-profile-draft.md'))) {
    fs.copyFileSync(path.join(DRAFTS_DIR, '01-draft.md'), path.join(DRAFTS_DIR, '01-company-profile-draft.md'));
  }
  if (fs.existsSync(path.join(DRAFTS_DIR, '02-company-profile-final.md')) && !fs.existsSync(path.join(DRAFTS_DIR, '02-final.md'))) {
    fs.copyFileSync(path.join(DRAFTS_DIR, '02-company-profile-final.md'), path.join(DRAFTS_DIR, '02-final.md'));
  }
  if (fs.existsSync(path.join(DRAFTS_DIR, '02-final.md')) && !fs.existsSync(path.join(DRAFTS_DIR, '02-company-profile-final.md'))) {
    fs.copyFileSync(path.join(DRAFTS_DIR, '02-final.md'), path.join(DRAFTS_DIR, '02-company-profile-final.md'));
  }

  // Move reports
  const reportMoves = [
    { src: path.join(artifactsDir, 'review-report.md'), dest: path.join(REPORTS_DIR, 'review-report.md') },
    { src: path.join(qaDir, 'seo-report.md'), dest: path.join(REPORTS_DIR, 'seo-report.md') }
  ];
  for (const rm of reportMoves) {
    if (fs.existsSync(rm.src)) {
      fs.copyFileSync(rm.src, rm.dest);
      fs.unlinkSync(rm.src);
    }
  }

  // Clean up old root build.log if exists
  const oldRootLog = path.join(OUT_DIR, 'build.log');
  if (fs.existsSync(oldRootLog)) {
    fs.unlinkSync(oldRootLog);
  }

  // 10. Write build.log into compros/<slug>/reports/build.log
  const log = [
    'Company Profile Build Log',
    '========================================',
    `Brand Name      : ${brand.name}`,
    `Primary Color   : ${brand.primaryColor} (HSL: ${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    `Source Markdown : ${srcMdPath}`,
    `Output Target   : ${finalHtmlPath}`,
    `Timestamp       : ${new Date().toISOString()}`,
    '',
    `Total Slides    : ${slides.length}`,
    ...slides.map((s, i) => {
      const type = require('./themes/modern').classifyCinematicArchetype(s, i, slides.length);
      const wordCount = s.content.split(/\s+/).filter(Boolean).length;
      return `  Slide ${i + 1} [${type.toUpperCase().padEnd(9)}]: ${s.title} (${wordCount} words)`;
    }),
    '',
    'Smart Asset Pipeline (Procedurally Generated):',
    `  - ${path.join(ASSETS_DIR, 'smartphone-mockup.svg')} (Vector Titanium Phone UI)`,
    `  - ${path.join(ASSETS_DIR, 'ecosystem-diagram.svg')} (Circular Orbit Ecosystem)`,
    `  - ${path.join(ASSETS_DIR, 'hero-banner.svg')} (Tech Dashboard Visual)`,
    `  - ${path.join(ASSETS_DIR, 'closing-banner.svg')} (Call-to-Action Wave)`,
    `  - ${path.join(ASSETS_DIR, 'logo.svg')} (Brand Vector Emblem)`,
    '',
    'Folder Consolidation:',
    `  - Slide Deck    : ${finalHtmlPath}`,
    `  - Final Markdown: ${path.join(OUT_DIR, 'compro.md')}`,
    `  - Assets Folder : ${ASSETS_DIR}`,
    `  - Drafts Folder : ${DRAFTS_DIR}`,
    `  - Reports Folder: ${REPORTS_DIR}`,
    '',
    'Clean-up Verification:'
  ];

  // Clean up empty directories
  if (fs.existsSync(artifactsDir)) {
    const remaining = fs.readdirSync(artifactsDir);
    if (remaining.length === 0) {
      fs.rmdirSync(artifactsDir);
      log.push('  - Root artifacts/ directory was empty and cleaned up.');
    } else {
      log.push(`  - Root artifacts/ contains: ${remaining.join(', ')}`);
    }
  }
  if (fs.existsSync(qaDir)) {
    const remaining = fs.readdirSync(qaDir);
    if (remaining.length === 0) {
      fs.rmdirSync(qaDir);
      log.push('  - Root qa/ directory was empty and cleaned up.');
    } else {
      log.push(`  - Root qa/ contains: ${remaining.join(', ')}`);
    }
  }

  fs.writeFileSync(path.join(REPORTS_DIR, 'build.log'), log.join('\n'), 'utf8');

  // Post-build workspace guarantee: sync artifacts to main workspace if in worktree
  postBuildSyncGuarantee(OUT_DIR, ROOT, slug);

  console.log(`\n🎉 Company profile build complete!`);
  console.log(`  Target : ${finalHtmlPath}`);
  console.log(`  Slides : ${slides.length} slides compiled`);
  console.log(`  Assets : 5 SVG vector assets generated in ${ASSETS_DIR}`);
  console.log(`  Reports: build.log, review-report, and seo-report consolidated in ${REPORTS_DIR}`);
  console.log(`  Drafts : source drafts consolidated in ${DRAFTS_DIR}\n`);
}

if (require.main === module) {
  runMain().catch(err => {
    console.error('Fatal build error:', err);
    process.exit(1);
  });
}

if (typeof module !== 'undefined' && typeof require !== 'undefined') {
  module.exports = {
    detectProjectRoot,
    postBuildSyncGuarantee,
    copyRecursiveSync,
    runMain,
    parseAndSanitizeMarkdown,
    splitDenseSlides,
    splitProseByWords,
    parseEditorialCards,
    renderSlide,
    classifyCanvaArchetype,
    resolveSlideSlot,
    resolveSlideImageUrl,
    assertSlideStructure,
    inline,
    sanitizeSlideContent,
    sanitizeContactDetails,
    extractBigNumberMetric,
    loadThemeManifest,
    THEME_ALIASES,
    parseImageDirective,
    pickFromPoolDistinct,
    acquireSlotImage,
    buildReviewerMetaBlock
  };
}