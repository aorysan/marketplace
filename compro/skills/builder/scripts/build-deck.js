#!/usr/bin/env node
/* build-deck.js — Company Profile Builder & Smart Asset Pipeline
   Converts company profile markdown into an ultra-modern 16:9 Reveal.js HTML
   deck with procedural vector assets, client dynamic theming, and full
   directory consolidation into compros/<slug>/.
*/
const fs = require('fs');
const path = require('path');
const assetGenerator = require('./asset-generator');

// Frontmatter sanitization + slide split (spec §3.1). Strips the YAML frontmatter block,
// the reviewer-added Meta Title/Meta Description header lines ANYWHERE in the document,
// and splits on H1 titles into { title, content } slides.
function parseAndSanitizeMarkdown(md) {
  let cleaned = md.replace(/^---[\s\S]*?---\s*/m, '');
  cleaned = cleaned.replace(/^Meta Title:.*$/gim, '').replace(/^Meta Description:.*$/gim, '');
  cleaned = cleaned.trim();
  const rawSlides = cleaned.split(/^# /m).map(s => s.trim()).filter(Boolean);
  return rawSlides.map(s => {
    const newline = s.indexOf('\n');
    const title = newline === -1 ? s.trim() : s.slice(0, newline).trim();
    let content = newline === -1 ? '' : s.slice(newline + 1).trim();
    content = content.replace(/^---+\s*$/gm, '').trim();
    return { title, content };
  });
}

// Editorial card parser: "**Bold.** body" bullet cards become { title, desc }, with an
// intro-text capture and a paragraph fallback when no bullet cards exist.
function parseEditorialCards(content) {
  const lines = content.replace(/<!--[\s\S]*?-->/g, '').split('\n').map(l => l.trim()).filter(Boolean);
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
    } else if (!introText && !line.startsWith('#') && !line.startsWith('Tagline:')) {
      introText = line;
    }
  }

  // Fallback: if no bullet cards found, treat non-empty paragraphs as cards
  if (cards.length === 0 && lines.length > 0) {
    const paragraphs = content.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    for (const p of paragraphs) {
      if (!p.startsWith('Tagline:') && p !== introText) {
        cards.push({ title: p.slice(0, 35) + '...', desc: p });
      }
    }
  }

  return { introText, cards };
}

function findRoot() {
  let cur = process.cwd();
  while (cur && cur !== path.dirname(cur)) {
    if (fs.existsSync(path.join(cur, 'compros')) || fs.existsSync(path.join(cur, 'input')) || fs.existsSync(path.join(cur, '.git'))) {
      return cur;
    }
    cur = path.dirname(cur);
  }
  return process.cwd();
}

const ROOT = findRoot();

// 1a. CLI argument parser (supports --theme=<theme> and --name=<slug>, backward-compat positional)
let THEME = 'editorial';
let slug = 'congen';
const args = process.argv.slice(2);
for (const arg of args) {
  if (arg.startsWith('--theme=')) {
    THEME = arg.split('=')[1];
  } else if (arg.startsWith('--name=')) {
    slug = arg.split('=')[1];
  } else if (!arg.startsWith('--')) {
    slug = arg;
  }
}

// Output directories
const OUT_DIR = path.join(ROOT, 'compros', slug);
const ASSETS_DIR = path.join(OUT_DIR, 'assets');
const REPORTS_DIR = path.join(OUT_DIR, 'reports');
const DRAFTS_DIR = path.join(OUT_DIR, 'drafts');

// Template paths (Builder skill templates)
const templateCandidates = [
  path.join(__dirname, '..', 'templates'),
  path.join(ROOT, '.claude', 'plugins', 'compro', 'skills', 'builder', 'templates'),
  path.join(ROOT, 'skills', 'builder', 'templates'),
  path.join(__dirname, '..', 'skills', 'builder', 'templates')
];

let SHELL = null;
let CSS = null;
if (THEME === 'editorial') {
  for (const dir of templateCandidates) {
    const s = path.join(dir, 'editorial-shell.html');
    const c = path.join(dir, 'editorial.css');
    if (fs.existsSync(s) && fs.existsSync(c)) {
      SHELL = s;
      CSS = c;
      break;
    }
  }
} else {
  for (const dir of templateCandidates) {
    const s = path.join(dir, 'profile-shell.html');
    const c = path.join(dir, 'custom.css');
    if (fs.existsSync(s) && fs.existsSync(c)) {
      SHELL = s;
      CSS = c;
      break;
    }
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
const candidatePaths = [
  path.join(DRAFTS_DIR, '02-final.md'),
  path.join(DRAFTS_DIR, '02-company-profile-final.md'),
  path.join(ROOT, 'artifacts', '02-final.md'),
  path.join(ROOT, 'artifacts', '02-company-profile-final.md'),
  path.join(OUT_DIR, 'compro.md'),
  path.join(DRAFTS_DIR, '01-draft.md'),
  path.join(DRAFTS_DIR, '01-company-profile-draft.md'),
  path.join(ROOT, 'artifacts', '01-draft.md'),
  path.join(ROOT, 'artifacts', '01-company-profile-draft.md')
];

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
        console.log(`  [editorial fallback] Using draft from compros/${s}/drafts/02-final.md`);
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
let brandName = 'Venturo Pro';
let primaryColor = '#009BAD';
let secondaryColor = '#006D79';

const brandStoryPath = path.join(ROOT, 'input', 'brand-story-guide.md');
const bkbPath = path.join(ROOT, 'input', 'business-knowledge-base.md');

if (fs.existsSync(brandStoryPath)) {
  const bsContent = fs.readFileSync(brandStoryPath, 'utf8');
  const nameMatch = bsContent.match(/#\s*Brand Story Guide:\s*([^#\n\r]+?)(?:\s+AI|\s+Content|\s+Generator|$)/i);
  if (nameMatch) brandName = nameMatch[1].trim();

  const primaryMatch = bsContent.match(/\|\s*Primary\s*\|[^|]*\|\s*(`?#[0-9A-Fa-f]{6}`?)/i);
  if (primaryMatch) primaryColor = primaryMatch[1].replace(/`/g, '').trim();

  const secondaryMatch = bsContent.match(/\|\s*(?:Secondary|Accent)[^|]*\|[^|]*\|\s*(`?#[0-9A-Fa-f]{6}`?)/i);
  if (secondaryMatch) secondaryColor = secondaryMatch[1].replace(/`/g, '').trim();
} else if (fs.existsSync(bkbPath)) {
  const bkbContent = fs.readFileSync(bkbPath, 'utf8');
  const nameMatch = bkbContent.match(/#\s*(?:Business Knowledge Base:\s*)?([^\n\r—\-]+)/i);
  if (nameMatch) brandName = nameMatch[1].trim();
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
const slides = parseAndSanitizeMarkdown(md);

// Markdown inline helper
function inline(mdtext) {
  if (!mdtext) return '';
  return mdtext
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

// Slide type detection
function detectSlideType(slide, index, totalSlides) {
  const t = (slide.title || '').toLowerCase();
  if (index === 0 || t.includes('profile') || t.includes('profil') || t.includes('tentang')) return 'hero';
  if (t.includes('masalah') || t.includes('problem') || t.includes('tantangan') || t.includes('pain')) return 'problem';
  if (t.includes('solusi') || t.includes('solution') || t.includes('nilai tambah') || t.includes('value')) return 'solution';
  // "Layanan Unggulan" / "Fitur" => features grid (BUKAN ecosystem). Arsitektur/Ekosistem => diagram.
  if (t.includes('arsitektur') || t.includes('ekosistem') || t.includes('ecosystem') || t.includes('stack') || t.includes('arhitecture')) return 'ecosystem';
  if (t.includes('layanan') || t.includes('fitur') || t.includes('feature') || t.includes('keunggulan')) return 'features';
  if (t.includes('pencapaian') || t.includes('bukti') || t.includes('traction') || t.includes('showcase') || t.includes('portfolio') || t.includes('studi kasus')) return 'showcase';
  // "Mengapa Kami" / "Keunggulan Kompetitif" => differentiator comparison table.
  if (t.includes('mengapa') || t.includes('kenapa') || t.includes('why') || t.includes('differentiator') || t.includes('keunggulan kompetitif')) return 'differentiator';
  if (t.includes('paket') || t.includes('harga') || t.includes('pricing') || t.includes('biaya') || t.includes('kerjasama') || t.includes('plan')) return 'pricing';
  if (t.includes('penawaran') || t.includes('offer') || t.includes('garansi') || t.includes('fasilitas') || t.includes('bonus') || t.includes('promo')) return 'offer';
  if (index === totalSlides - 1 || t.includes('hubungi') || t.includes('kontak') || t.includes('contact') || t.includes('closing') || t.includes('cta')) return 'closing';
  return 'general';
}

// Slide Renderers

function renderHeroSlide(slide, brand) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  let tagline = '';
  let desc = '';
  const stats = [];

  for (const line of lines) {
    if (/^[-*]\s*\*\*([^*\n]+)\*\*/.test(line)) {
      // Hero metrics: "- **0** descriptive phrase — detail"
      const m = line.match(/^[-*]\s*\*\*([^*\n]+)\*\*\s*[—-]?\s*(.*)$/);
      stats.push({ label: m[1].trim(), sub: m[2].replace(/\*\*/g, '').trim() });
    } else if (!tagline && !/^💼/u.test(line) && !line.startsWith('Kami')) {
      tagline = line;
    } else if (/^💼/u.test(line)) {
      desc = line.replace(/^💼\s*/u, '');
    } else if (!desc && line.length > 50 && !line.startsWith('Kami')) {
      desc = line;
    }
  }

  const statsHtml = stats.slice(0, 3).map((st, i) => {
    let statNum = st.label;                     // "0", "5–20", "Rp99 rb"
    let statLabel = st.sub;                     // "biaya API per video", "video/bulan", ...
    // Extract a pithy highlight number when sub is long prose.
    const numMatch = st.sub.match(/^(.*?)(?=\s*[—-]|$)/);
    if (statLabel.length > 40 && numMatch) statLabel = numMatch[1].trim();
    return `
      <div class="stat-item">
        <div class="stat-number">${inline(statNum)}</div>
        <div class="stat-label">${inline(statLabel)}</div>
        <div style="font-size:12px; color:var(--brand-text-muted);">${i === 0 ? 'tanpa tagihan per-render' : i === 1 ? 'volume creator rutin' : 'struktur indikatif'}</div>
      </div>`;
  }).join('\n');

  const cleanLabel = (t) => {
    return (t || '').replace(/^\*\*Tagline:\*\*\s*/i, '').replace(/^\*\*Deskripsi:\*\*\s*/i, '').trim();
  };

  return `
    <section class="hero-slide">
      <div class="slide-content">
        <div class="hero-grid">
          <div class="hero-content">
            <div class="badge-eyebrow">${brand.name} Profile</div>
            <h1 class="hero-title"><span class="hero-title-gradient">${inline(slide.title)}</span></h1>
            ${tagline ? `<p class="hero-tagline">${inline(cleanLabel(tagline))}</p>` : ''}
            ${desc ? `<p class="hero-desc">${inline(cleanLabel(desc))}</p>` : ''}
            ${statsHtml ? `<div class="hero-stats">${statsHtml}</div>` : ''}
          </div>
          <div class="hero-visual">
            <!-- Inline SVG per Inline SVG Enforcement Rule (never <img src="assets/*.svg">) -->
            ${(() => {
              const svgPath = path.join(ASSETS_DIR, 'hero-banner.svg');
              if (fs.existsSync(svgPath)) {
                return fs.readFileSync(svgPath, 'utf8')
                  .replace(/<svg/, `<svg style="width:100%; max-width:620px; border-radius:20px; filter:drop-shadow(0 20px 40px rgba(0,0,0,0.5));"`)
                  .replace(/class=""/, '');
              }
              return assetGenerator.generateTechBannerSvg({ brandName: brand.name, primaryColor: brand.primaryColor });
            })()}
          </div>
        </div>
      </div>
    </section>`;
}

function renderProblemSlide(slide, brand) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n');

  let subtitle = '';
  let summary = '';
  const cards = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (/^[\-\*]\s+\*\*(.+?)\*\*(.*)/.test(line)) {
      const match = line.match(/^[\-\*]\s+\*\*(.+?)\*\*(.*)/);
      const title = match[1].replace(/[.:]$/, '').trim();
      let body = match[2].replace(/^[\s—\-.:]+/, '').trim();
      while (i + 1 < lines.length && !/^[\-\*]/.test(lines[i + 1].trim()) && lines[i + 1].trim()) {
        body += ' ' + lines[i + 1].trim();
        i++;
      }
      cards.push({ title, body });
    } else if (line.toLowerCase().startsWith('**intinya:**') || line.toLowerCase().startsWith('intinya:')) {
      summary = line;
    } else if (!subtitle && !line.startsWith('#')) {
      subtitle = line;
    }
  }

  const pills = ['Dampak Biaya Tinggi', 'Identitas Rusak', 'Waktu Terbuang', 'Skalabilitas Macet'];

  // Problem Card Icon Variation Rule — semantically distinct icon per pain card.
  const problemIcon = (title) => {
    const t = title.toLowerCase();
    if (/(biaya|harga|mahal|tagihan|uang|finansial)/.test(t)) return 'dollar';
    if (/(konsistensi|brand|identitas|warna|kualitas|palette)/.test(t)) return 'palette';
    if (/(workflow|fragmentasi|terpisah|tool|aplikasi|bolak)/.test(t)) return 'layers';
    if (/(waktu|frekuensi|lambat|momentum|cepat|terlambat|tekanan)/.test(t)) return 'clock';
    return 'warning';
  };

  const cardsHtml = cards.map((c, idx) => `
    <div class="problem-card">
      <div class="card-icon-warning">
        ${assetGenerator.getIconSvg(problemIcon(c.title), { size: 24, color: 'var(--color-problem)' })}
      </div>
      <h3>${inline(c.title)}</h3>
      <p>${inline(c.body)}</p>
      <div class="impact-pill">${pills[idx % pills.length]}</div>
    </div>
  `).join('\n');

  return `
    <section class="slide-problem">
      <div class="slide-content">
        <div class="slide-header">
          <div class="badge-eyebrow badge-danger">Tantangan Industri</div>
          <h2>${inline(slide.title)}</h2>
          ${subtitle ? `<p class="slide-subtitle">${inline(subtitle)}</p>` : ''}
        </div>
        <div class="cards-grid cards-grid-3">
          ${cardsHtml}
        </div>
        ${summary ? `<div style="margin-top:24px; padding:14px 24px; border-radius:12px; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.2); font-size:15px; color:var(--brand-text-secondary);">${inline(summary)}</div>` : ''}
      </div>
    </section>`;
}

function renderSolutionSlide(slide, brand) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n');

  let banner = '';
  let footer = '';
  const cards = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (/^[\-\*]\s*(?:💸|⏱|🎨|📋|[^\s]+)?\s*\*\*(.+?)\*\*(.*)/.test(line)) {
      const match = line.match(/^[\-\*]\s*(?:💸|⏱|🎨|📋|[^\s]+)?\s*\*\*(.+?)\*\*(.*)/);
      let title = match[1].replace(/[.:]$/, '').trim();
      let body = match[2].replace(/^[\s—\-.:]+/, '').trim();

      while (i + 1 < lines.length && !/^[\-\*]/.test(lines[i + 1].trim()) && lines[i + 1].trim() && !lines[i + 1].startsWith('**Posisi')) {
        body += ' ' + lines[i + 1].trim();
        i++;
      }

      let icon = 'sparkles';
      const lt = title.toLowerCase();
      if (line.includes('💸') || lt.includes('biaya') || lt.includes('harga') || lt.includes('marginal')) icon = 'dollar';
      else if (line.includes('⏱') || lt.includes('waktu') || lt.includes('time') || lt.includes('cepat')) icon = 'clock';
      else if (line.includes('🎨') || lt.includes('brand') || lt.includes('dna') || lt.includes('warna')) icon = 'palette';
      else if (line.includes('📋') || lt.includes('spreadsheet') || lt.includes('sheets') || lt.includes('sync')) icon = 'spreadsheet';

      cards.push({ icon, title, body });
    } else if (line.toLowerCase().startsWith('**posisi kami:**') || line.toLowerCase().startsWith('posisi kami:')) {
      footer = line;
    } else if (!banner && line.startsWith('**')) {
      banner = line;
    }
  }

  const checkSvg = assetGenerator.getIconSvg('checkmark', { size: 14, color: 'var(--color-success)', strokeWidth: 3 });
  const cardsHtml = cards.map(c => `
    <div class="solution-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="card-icon-brand">
          ${assetGenerator.getIconSvg(c.icon, { size: 26, color: 'var(--brand-primary-light)' })}
        </div>
        <span class="solution-check" style="width:24px; height:24px; border-radius:50%; background:var(--color-success-subtle); border:1px solid var(--color-success-border); display:flex; align-items:center; justify-content:center;">
          ${checkSvg}
        </span>
      </div>
      <h3>${inline(c.title)}</h3>
      <p>${inline(c.body)}</p>
    </div>
  `).join('\n');

  return `
    <section class="slide-solution">
      <div class="slide-content">
        <div class="slide-header">
          <div class="badge-eyebrow badge-success">Solusi & Nilai Tambah</div>
          <h2>${inline(slide.title)}</h2>
          ${banner ? `<p class="slide-subtitle" style="color:var(--brand-text-primary); font-weight:600;">${inline(banner)}</p>` : ''}
        </div>
        <div class="cards-grid cards-grid-4">
          ${cardsHtml}
        </div>
        ${footer ? `
        <div style="margin-top:24px; padding:16px 28px; border-radius:12px; background:linear-gradient(90deg, rgba(0,155,173,0.12), rgba(255,255,255,0.02)); border:1px solid rgba(0,155,173,0.25); font-size:15px; display:flex; align-items:center; gap:12px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--brand-primary-light);"></span>
          <div style="color:var(--brand-text-secondary);">${inline(footer)}</div>
        </div>` : ''}
      </div>
    </section>`;
}

function renderEcosystemSlide(slide, brand) {
  return `
    <section class="slide-ecosystem">
      <div class="slide-content">
        <div class="slide-header" style="text-align:center; align-items:center; margin-bottom:20px;">
          <div class="badge-eyebrow">Arsitektur & Layanan</div>
          <h2>${inline(slide.title)}</h2>
          <p class="slide-subtitle" style="text-align:center;">Teknologi terintegrasi dari Brand DNA hingga pipeline video render lokal tanpa biaya per-render.</p>
        </div>
        <div class="ecosystem-container">
          <div class="ecosystem-diagram">
            <!-- Inline SVG per Inline SVG Enforcement Rule -->
            ${(() => {
              const svgPath = path.join(ASSETS_DIR, 'ecosystem-diagram.svg');
              if (fs.existsSync(svgPath)) {
                return fs.readFileSync(svgPath, 'utf8')
                  .replace(/<svg/, `<svg style="max-height:510px; width:100%; object-fit:contain; filter:drop-shadow(0 16px 36px rgba(0,0,0,0.5));"`)
                  .replace(/class=""/, '');
              }
              return assetGenerator.generateEcosystemDiagramSvg({ brandName: brand.name, primaryColor: brand.primaryColor, secondaryColor: brand.secondaryColor });
            })()}
          </div>
        </div>
      </div>
    </section>`;
}

// Features/Layanan grid — repurposes the solution-card archetype for a services grid.
function renderFeaturesSlide(slide, brand) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n');

  let subtitle = '';
  let note = '';
  const cards = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (/^\*\*(.+?)\*\*/.test(line) && line.includes('—')) {
      const parts = line.split('—');
      const title = parts[0].replace(/\*\*/g, '').trim();
      const body = parts.slice(1).join('—').trim();
      cards.push({ title, body });
    } else if (/^[\-\*]\s*\*\*(.+?)\*\*/.test(line)) {
      const match = line.match(/^[\-\*]\s*\*\*(.+?)\*\*(.*)/);
      const title = match[1].replace(/[.:]$/, '').trim();
      let body = match[2].replace(/^[\s—\-.:]+/, '').trim();
      while (i + 1 < lines.length && !/^[\-\*]/.test(lines[i + 1].trim()) && lines[i + 1].trim() && !lines[i + 1].startsWith('**')) {
        body += ' ' + lines[i + 1].trim();
        i++;
      }
      cards.push({ title, body });
    } else if (line.startsWith('*(') && line.includes('Fitur standar')) {
      note = line;
    } else if (!subtitle && !line.startsWith('#') && !line.startsWith('*(')) {
      subtitle = line;
    }
  }

  const iconMap = {
    biaya: 'dollar', harga: 'dollar', marginal: 'dollar',
    dna: 'palette', brand: 'palette',
    spreadsheet: 'spreadsheet', sheets: 'spreadsheet', sync: 'spreadsheet',
    sidecar: 'zap', copilot: 'zap', workflow: 'zap',
    arsitektur: 'cpu', pipeline: 'cpu', lokal: 'cpu'
  };
  const pickIcon = (t) => {
    const lt = t.toLowerCase();
    for (const k of Object.keys(iconMap)) if (lt.includes(k)) return iconMap[k];
    return 'sparkles';
  };

  const checkSvg = assetGenerator.getIconSvg('checkmark', { size: 14, color: 'var(--color-success)', strokeWidth: 3 });
  const cardsHtml = cards.map(c => `
    <div class="solution-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="card-icon-brand">
          ${assetGenerator.getIconSvg(pickIcon(c.title), { size: 26, color: 'var(--brand-primary-light)' })}
        </div>
        <span class="solution-check" style="width:24px; height:24px; border-radius:50%; background:var(--color-success-subtle); border:1px solid var(--color-success-border); display:flex; align-items:center; justify-content:center;">
          ${checkSvg}
        </span>
      </div>
      <h3>${inline(c.title)}</h3>
      <p>${inline(c.body)}</p>
    </div>
  `).join('\n');

  return `
    <section class="slide-features">
      <div class="slide-content">
        <div class="slide-header">
          <div class="badge-eyebrow">Layanan Unggulan</div>
          <h2>${inline(slide.title)}</h2>
          ${subtitle ? `<p class="slide-subtitle">${inline(subtitle)}</p>` : ''}
        </div>
        <div class="cards-grid cards-grid-4">
          ${cardsHtml}
        </div>
        ${note ? `
        <div style="margin-top:16px; font-size:13px; color:var(--brand-text-muted); text-align:center;">${inline(note)}</div>` : ''}
      </div>
    </section>`;
}

function renderShowcaseSlide(slide, brand) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n');

  let intro = '';
  let note = '';
  const proofs = [];

  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    if (/^[\-\*]\s+\*\*(.+?)\*\*(.*)/.test(l)) {
      const match = l.match(/^[\-\*]\s+\*\*(.+?)\*\*(.*)/);
      proofs.push({
        title: match[1].replace(/[.:]$/, '').trim(),
        desc: match[2].replace(/^[\s—\-.:]+/, '').trim()
      });
    } else if (l.toLowerCase().startsWith('**catatan jujur:**') || l.toLowerCase().startsWith('catatan jujur:')) {
      note = l;
    } else if (!intro && !l.startsWith('#')) {
      intro = l;
    }
  }

  const proofsHtml = proofs.map(p => `
    <div class="card" style="padding:18px 24px; border-left:4px solid var(--brand-primary-light); background:var(--brand-card-bg);">
      <h3 style="font-size:18px; font-weight:700; color:var(--brand-text-primary); margin-bottom:6px;">${inline(p.title)}</h3>
      <p style="font-size:14px; line-height:1.5; color:var(--brand-text-secondary); margin:0;">${inline(p.desc)}</p>
    </div>
  `).join('\n');

  return `
    <section class="slide-showcase">
      <div class="slide-content">
        <div style="display:grid; grid-template-columns:1.18fr 0.82fr; gap:48px; align-items:center; width:100%;">
          <div>
            <div class="slide-header" style="margin-bottom:24px;">
              <div class="badge-eyebrow">Bukti & Validasi</div>
              <h2>${inline(slide.title)}</h2>
              ${intro ? `<p class="slide-subtitle">${inline(intro)}</p>` : ''}
            </div>
            <div style="display:flex; flex-direction:column; gap:16px;">
              ${proofsHtml}
            </div>
            ${note ? `
            <div style="margin-top:20px; padding:14px 20px; border-radius:10px; background:rgba(0,155,173,0.08); border:1px solid rgba(0,155,173,0.2); font-size:13px; color:var(--brand-text-secondary);">
              ${inline(note)}
            </div>` : ''}
          </div>
          <div style="display:flex; justify-content:center; align-items:center;">
            ${assetGenerator.generateSmartphoneMockupHtml({ brandName: brand.name, primaryColor: brand.primaryColor })}
          </div>
        </div>
      </div>
    </section>`;
}

function renderPricingSlide(slide, brand) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n');

  let subtitle = '';
  const notes = [];
  const tableLines = [];

  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    if (l.startsWith('|')) {
      tableLines.push(l);
    } else if (l.startsWith('-') || l.startsWith('*')) {
      notes.push(l.replace(/^[\-\*]\s*/, ''));
    } else if (!subtitle && !l.startsWith('#')) {
      subtitle = l;
    }
  }

  const rows = [];
  for (let i = 0; i < tableLines.length; i++) {
    const tl = tableLines[i].replace(/^\||\|$/g, '').trim();
    if (/^(\s*:?-{2,}:?\s*\|?)+$/.test(tl)) continue;
    const cols = tl.split('|').map(c => c.trim());
    if (i > 0 && cols.length >= 3) {
      rows.push({
        tier: cols[0].replace(/\*\*/g, '').trim(),
        price: cols[1].replace(/\*\*/g, '').trim(),
        features: cols[2].split(/[,;]/).map(f => f.trim()).filter(Boolean)
      });
    }
  }

  const cardsHtml = rows.map(r => {
    const isFeatured = r.tier.toLowerCase().includes('pro');
    const isFree = r.tier.toLowerCase().includes('free') || r.price.includes('Rp0');
    const priceFormatted = r.price.split('(')[0].replace(/\/bulan|\/bln/gi, '').trim();
    const annualNote = r.price.includes('(') ? r.price.match(/\((.*?)\)/)[1] : '';
    const checkSvg = assetGenerator.getIconSvg('checkmark', { size: 16, color: 'var(--color-success)', strokeWidth: 3 });

    return `
      <div class="pricing-card${isFeatured ? ' pricing-featured' : ''}">
        ${isFeatured ? '<div class="badge-ribbon">Best Seller &bull; Paling Populer</div>' : ''}
        <div class="tier-name">${inline(r.tier)}</div>
        <div class="price-strikethrough">${isFeatured ? 'Rp149.000' : ''}</div>
        <div class="tier-price">${inline(priceFormatted)} <span>/ bln</span></div>
        ${annualNote ? `<div style="font-size:12px; color:var(--brand-primary-light); margin:-14px 0 16px;">${inline(annualNote)}</div>` : ''}
        <ul class="pricing-features">
          ${r.features.map(f => `<li>${checkSvg} <span>${inline(f)}</span></li>`).join('\n')}
        </ul>
        <a href="#/${slides.length - 1}" class="btn ${isFeatured ? 'btn-primary' : 'btn-secondary'}">
          ${isFree ? 'Mulai Gratis' : isFeatured ? 'Pilih Paket Pro' : 'Hubungi Tim'}
        </a>
      </div>`;
  }).join('\n');

  return `
    <section class="slide-pricing">
      <div class="slide-content">
        <div class="slide-header" style="text-align:center; align-items:center; margin-bottom:28px;">
          <div class="badge-eyebrow">Pilihan Paket</div>
          <h2>${inline(slide.title)}</h2>
          ${subtitle ? `<p class="slide-subtitle" style="text-align:center;">${inline(subtitle)}</p>` : ''}
        </div>
        <div class="pricing-grid">
          ${cardsHtml}
        </div>
        ${notes.length ? `
        <div style="margin-top:24px; display:flex; justify-content:center; gap:24px; font-size:13px; color:var(--brand-text-muted);">
          ${notes.map(n => `<div>&bull; ${inline(n)}</div>`).join('\n')}
        </div>` : ''}
      </div>
    </section>`;
}

function renderOfferSlide(slide, brand) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n');
  const items = [];
  for (const line of lines) {
    if (/^[\-\*]/.test(line.trim())) items.push(line.replace(/^[\-\*]\s*/, ''));
  }
  const checkSvg = assetGenerator.getIconSvg('checkmark', { size: 18, color: 'var(--color-success)', strokeWidth: 2.5 });

  return `
    <section class="slide-offer">
      <div class="slide-content">
        <div class="slide-header">
          <div class="badge-eyebrow badge-warning">Penawaran Eksklusif</div>
          <h2>${inline(slide.title)}</h2>
        </div>
        <div class="facility-box">
          <div class="facility-header">
            <span class="guarantee-badge">Garansi 100% Kepuasan</span>
            <span class="deadline-pill">Penawaran Terbatas</span>
          </div>
          <ul class="checklist-bullets">
            ${items.map(it => `<li>${checkSvg} <span>${inline(it)}</span></li>`).join('\n')}
          </ul>
        </div>
      </div>
    </section>`;
}

function renderClosingSlide(slide, brand) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n');

  let bannerDesc = '';
  let quote = '';
  const contacts = [];

  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    if (l.startsWith('>')) {
      quote = l.replace(/^>\s*/, '');
    } else if (/^[-*]\s*(?:\*\*)?([^:\n]+?)(?:\*\*)?:\s*(.+)$/.test(l)) {
      // Accept "- **Label:** value" OR "- Label: value". Strip backticks from value.
      const m = l.match(/^[-*]\s*(?:\*\*)?([^:\n]+?)(?:\*\*)?:\s*(.+)$/);
      const label = m[1].replace(/\*\*/g, '').trim();
      const value = m[2].replace(/`/g, '').trim();
      contacts.push({ label, value });
    } else if (!bannerDesc && !l.startsWith('#') && !l.startsWith('-') && !l.startsWith('*')) {
      if (!l.startsWith('**Kontak resmi')) bannerDesc = l;
    }
  }

  const waSvg = assetGenerator.getIconSvg('whatsapp', { size: 20, color: 'var(--brand-primary-light)' });
  const mailSvg = assetGenerator.getIconSvg('mail', { size: 20, color: 'var(--brand-primary-light)' });
  const phoneSvg = assetGenerator.getIconSvg('phone', { size: 20, color: 'var(--brand-primary-light)' });
  const webSvg = assetGenerator.getIconSvg('layers', { size: 20, color: 'var(--brand-primary-light)' });
  const pinSvg = assetGenerator.getIconSvg('map-pin', { size: 20, color: 'var(--brand-primary-light)' });

  const contactMeta = [
    { icon: waSvg, key: 'whatsapp', label: 'WhatsApp' },
    { icon: mailSvg, key: 'email', label: 'Email' },
    { icon: webSvg, key: 'website', label: 'Website' },
    { icon: pinSvg, key: 'alamat', label: 'Kantor' }
  ];

  // Zero-Hallucination: render every contact value EXACTLY as written in the slide
  // content (which for Venturo Pro are explicit "[…]" placeholders because the
  // input docs contain no real contact data). Never invent phone/email/address.
  const contactGroups = contactMeta.map(meta => {
    const match = contacts.find(c => c.label.toLowerCase().includes(meta.key));
    if (!match || !match.value) return '';
    return `
      <div class="contact-card">
        <div class="contact-icon">${meta.icon}</div>
        <div class="contact-info">
          <span class="contact-label">${meta.label}${meta.key === 'whatsapp' ? ' / Telepon' : ''}</span>
          <span class="contact-value">${inline(match.value)}</span>
        </div>
      </div>`;
  }).join('\n');

  return `
    <section class="slide-closing">
      <div class="slide-content">
        <div class="closing-banner">
          <div class="badge-eyebrow" style="margin:0 auto 16px;">Mulai Sekarang</div>
          <h2>Mulai Produksi Video Ber-Brand Hari Ini</h2>
          <p>${bannerDesc ? inline(bannerDesc) : 'Jangan biarkan biaya produksi yang tak terprediksi menjadi alasan brand-mu tampil tidak konsisten lagi.'}</p>
        </div>

        <div class="contact-grid">
          ${contactGroups}
        </div>

        ${quote ? `
        <div style="margin-top:20px; text-align:center; font-size:13px; color:var(--brand-text-muted); font-style:italic;">
          ${inline(quote)}
        </div>` : ''}
      </div>
    </section>`;
}

// Differentiator "Mengapa Kami" — parses a markdown comparison table into a 5-col comparison table.
function renderDifferentiatorSlide(slide, brand) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n');

  let intro = '';
  let honesty = '';
  const tableLines = [];

  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    if (l.startsWith('|')) {
      tableLines.push(l);
    } else if (l.toLowerCase().startsWith('**intinya:**') || l.toLowerCase().startsWith('intinya:') || l.toLowerCase().startsWith('**intinya')) {
      honesty = l.replace(/^\*\*intinya[:\s]*\*\*/i, '');
    } else if (!intro && !l.startsWith('#')) {
      intro = l;
    }
  }

  const rows = [];
  for (let i = 0; i < tableLines.length; i++) {
    const tl = tableLines[i].replace(/^\||\|$/g, '').trim();
    if (/^(\s*:?-{2,}:?\s*\|?)+$/.test(tl)) continue; // skip separator row
    const cols = tl.split('|').map(c => c.trim());
    if (cols.length >= 4) {
      rows.push({
        aspect: cols[0].replace(/\*\*/g, '').trim(),
        brand: cols[1].replace(/\*\*/g, '').trim(),
        other: cols.slice(2).map(c => c.replace(/\*\*/g, '').trim())
      });
    }
  }

  // Translate cell values to status chips for comparison columns.
  const cellValue = (text) => {
    const t = text.toLowerCase();
    if (!text || text === '-') return '<span style="color:var(--brand-text-muted);">—</span>';
    if (/(menjaga|penuh|tinggi|terprediksi|cepat|cukup)/.test(t)) {
      return `<span class="comparison-check">${assetGenerator.getIconSvg('checkmark', { size: 14, color: 'var(--color-success)', strokeWidth: 3 })} ${inline(text)}</span>`;
    }
    if (/(naik|mahal|lambat|rendah|terbatas|minim|tidak ada|parsial)/.test(t)) {
      return `<span class="comparison-cross">${assetGenerator.getIconSvg('close', { size: 14, color: 'var(--color-danger)', strokeWidth: 3 })} ${inline(text)}</span>`;
    }
    if (/(sedang|spreadsheet|opsional)/.test(t)) {
      return `<span class="comparison-warn">${assetGenerator.getIconSvg('warning', { size: 14, color: 'var(--color-warning)', strokeWidth: 3 })} ${inline(text)}</span>`;
    }
    return inline(text);
  };

  const rowsHtml = rows.map(r => `
    <tr>
      <td class="aspect-col">${inline(r.aspect)}</td>
      <td class="brand-col">${cellValue(r.brand)}</td>
      ${r.other.map(c => `<td>${cellValue(c)}</td>`).join('\n')}
    </tr>
  `).join('\n');

  const headerCols = rows.length ? rows[0].other.length + 2 : 5;

  return `
    <section class="slide-differentiator">
      <div class="slide-content">
        <div class="slide-header">
          <div class="badge-eyebrow">Keunggulan Kompetitif</div>
          <h2>${inline(slide.title)}</h2>
          ${intro ? `<p class="slide-subtitle">${inline(intro)}</p>` : ''}
        </div>
        <div class="table-container">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Aspek</th>
                <th class="brand-col">${brand.name}</th>
                <th>CapCut / Template</th>
                <th>SaaS Cloud</th>
                <th>Jasa Produksi</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
        ${honesty ? `
        <div class="honesty-callout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <p><strong>Catatan Transparansi:</strong> ${inline(honesty)}</p>
        </div>` : ''}
      </div>
    </section>`;
}

function renderGeneralSlide(slide, brand) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n');
  let bodyHtml = '';

  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    if (l.startsWith('-') || l.startsWith('*')) {
      bodyHtml += `<li>${inline(l.replace(/^[\-\*]\s*/, ''))}</li>\n`;
    } else {
      bodyHtml += `<p>${inline(l)}</p>\n`;
    }
  }

  return `
    <section>
      <div class="slide-content">
        <div class="slide-header">
          <div class="badge-eyebrow">${brand.name}</div>
          <h2>${inline(slide.title)}</h2>
        </div>
        <div class="card" style="padding:32px;">
          ${bodyHtml}
        </div>
      </div>
    </section>`;
}

// Editorial Archetype Classifier
// Returns ONE of the 8 spec archetypes. Priority order:
//   1. hero-cover       (index 0)
//   2. closing-cta      (final slide / contact keywords)
//   3. ecosystem-orbit  (architecture / ecosystem keywords — guarded: pipeline alone is NOT
//                        enough; must co-occur with ecosystem context to avoid false hits on
//                        slides that mention pipeline in a services/features context)
//   4. narrative-split  (problem OR solution — determined later in dispatch)
//   5. pricing-cards    (package / pricing keywords — biaya is excluded because it appears
//                        in comparison tables on non-pricing slides)
//   6. differentiator   (why-us / competitive advantage)
//   7. metrics-contact  (traction / metrics / KPI)
//   8. services-grid    (services / features / 4+ bullets)
//   fallback:           narrative-split
function classifyEditorialArchetype(slide, index, totalSlides) {
  const t = (slide.title || '').toLowerCase();
  const c = (slide.content || '').toLowerCase();
  const combined = t + ' ' + c;
  const bulletCount = (slide.content || '').match(/^[-*]\s/gm) || [];

  if (index === 0) return 'archetype-hero-cover';
  if (index === totalSlides - 1 || /hubungi|kontak|contact|cta/.test(combined)) return 'archetype-closing-cta';
  // Ecosystem: require "pipeline" to co-occur with explicit ecosystem context words,
  // otherwise slides that merely mention "pipeline" in features/services context would collide.
  // "multi-ai" and "satu state" are unique to the ecosystem/architecture slide.
  if (/arsitektur|ekosistem|ecosystem|stack|architecture/.test(combined) ||
      (/pipeline/.test(combined) && /multi-ai|satu state|clientlayout/.test(combined))) return 'archetype-ecosystem-orbit';
  if (/masalah|tantangan|pain|problem/.test(t)) return 'archetype-narrative-split';
  if (/solusi|solution|nilai tambah|value/.test(t)) return 'archetype-narrative-split';
  // Pricing: title-only check (content-level "harga"/"biaya" appears in comparison tables on
  // non-pricing slides like the differentiator slide, causing false matches).
  if (/paket|pricing|harga|kerjasama|plan/.test(t)) return 'archetype-pricing-cards';
  if (/mengapa|kenapa|why|differentiator|keunggulan kompetitif/.test(t)) return 'archetype-differentiator';
  // Metrics: title-only check ("angka" appears as a substring in unrelated slide content).
  if (/pencapaian|bukti|traction|showcase|metric|statistik|angka|kpi/.test(t)) return 'archetype-metrics-contact';
  if (/layanan|fitur|services|keunggulan/.test(combined) || bulletCount.length >= 4) return 'archetype-services-grid';
  return 'archetype-narrative-split';
}

// Editorial Archetype Renderers
function renderEditorialHero(slide, brand) {
  const lines = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim().split('\n').map(l => l.trim()).filter(Boolean);
  let tagline = '';
  let desc = '';
  for (const line of lines) {
    if (/^[-*]/.test(line)) continue;
    if (!tagline && !/^💼/u.test(line) && line.length > 5) tagline = line;
    else if (/^💼/u.test(line)) desc = line.replace(/^💼\s*/u, '');
    else if (!desc && line.length > 30) desc = line;
  }

  return `
    <section class="archetype-hero-cover">
      <nav class="editorial-top-nav">
        <div class="editorial-logo">${brand.name}</div>
        <div class="editorial-nav-links">
          <a class="editorial-nav-btn" href="#/1">Company Profile</a>
        </div>
      </nav>
      <div class="hero-floating-card">
        <span class="hero-pill-badge">${brand.name}</span>
        <h1 class="hero-headline">${inline(slide.title)}</h1>
        ${tagline ? `<p style="font-size:18px; color:var(--text-body); margin:0 0 12px;">${inline(tagline)}</p>` : ''}
        ${desc ? `<p style="font-size:15px; color:var(--text-muted); margin:0;">${inline(desc)}</p>` : ''}
        <div class="hero-actions" style="margin-top:28px;">
          <button class="btn-solid">Lihat Selengkapnya</button>
          <button class="btn-outline">Hubungi Kami</button>
        </div>
      </div>
      <div style="display:flex; justify-content:center; align-items:center;">
        <div class="phone-frame-editorial">
          <div class="phone-notch"></div>
        </div>
      </div>
    </section>`;
}

// Shared bullet-card parser (lines -> cards). Modes:
//  - 'bullets'  : "- **Title** — body" (mission-pillars / services-grid)
//  - 'numbered' : "1. Title — body"     (workflow-3col)
//  - 'metrics'  : "- number label"      (metrics-contact, number/label split)
function parseEditorialBulletCards(lines, mode) {
  const pattern =
    mode === 'numbered'
      ? /^\d+[.)]\s*(?:\*\*)?([^*\n]+)(?:\*\*)?\s*(?:—|:\s*)?(.*)$/
      : mode === 'metrics'
        ? /^[-*]\s*(?:\*\*)?([^*\n]+)(?:\*\*)?\s*[—-]?\s*(.*)$/
        : /^[-*]\s*(?:\*\*)?([^*\n]+)(?:\*\*)?\s*(?:—|:\s*)?(.*)$/;
  const cards = [];
  for (const line of lines) {
    if (/^---+$/.test(line.trim())) continue;
    const m = line.match(pattern);
    if (m) cards.push({ title: m[1].trim(), body: m[2] ? m[2].replace(/[*_]/g, '').trim() : '' });
  }
  return cards;
}

// One shared grid renderer. All editorial grid archetypes call it with their own options so the
// card/section body is never copy-pasted between archetype renderers.
function renderEditorialCardGrid(slide, opts) {
  const lines = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim().split('\n').map(l => l.trim()).filter(Boolean);
  const cards = parseEditorialBulletCards(lines, opts.cardMode);

  const cardHtml = cards.slice(0, opts.limit || cards.length).map((card, i) => {
    if (opts.cardType === 'metric') {
      return `
        <div class="metric-counter-box">
          <div class="metric-number">${inline(card.title)}</div>
          ${card.body ? `<p style="font-size:14px; color:var(--text-body); margin:10px 0 0;">${inline(card.body)}</p>` : ''}
        </div>`;
    }
    return `
      <div class="pillar-card">
        <div class="pillar-number">0${i + 1}</div>
        <h3 style="font-size:${opts.titleSize}px; font-weight:700; margin:0 0 ${opts.titleMarginBottom}px;">${inline(card.title)}</h3>
        ${card.body ? `<p style="font-size:${opts.bodySize}px; color:var(--text-body); margin:0;">${inline(card.body)}</p>` : ''}
      </div>`;
  }).join('\n');

  const sectionHeader = opts.headerLayout === 'split'
    ? `
      <div style="padding-right:24px;">
        <span class="hero-pill-badge" style="${opts.badgeStyle || ''}">${opts.badge}</span>
        <h2 style="font-family:var(--font-display); font-size:${opts.headlineSize}px; font-weight:800; color:var(--text-headline); margin:${opts.headlineMargin};">${inline(slide.title)}</h2>
      </div>`
    : `
      <div style="grid-column:1/-1; margin-bottom:8px;">
        <span class="hero-pill-badge">${opts.badge}</span>
        <h2 style="font-family:var(--font-display); font-size:${opts.headlineSize}px; font-weight:800; color:var(--text-headline); margin:8px 0 0;">${inline(slide.title)}</h2>
      </div>`;

  const cardsBlock = opts.wrapGrid
    ? `<div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">${cardHtml}</div>`
    : cardHtml;

  return `
    <section class="${opts.sectionClass}">
      ${sectionHeader}
      ${cardsBlock}
    </section>`;
}

function renderEditorialMissionPillars(slide, brand) {
  return renderEditorialCardGrid(slide, {
    sectionClass: 'archetype-mission-pillars', headerLayout: 'split',
    badge: 'Misi & Pilar', badgeStyle: 'margin-bottom:16px;',
    headlineSize: 36, headlineMargin: '0 0 16px',
    cardType: 'pillar', titleSize: 20, bodySize: 14, titleMarginBottom: 10,
    cardMode: 'bullets', wrapGrid: true
  });
}

function renderEditorialWorkflow(slide, brand) {
  return renderEditorialCardGrid(slide, {
    sectionClass: 'archetype-workflow-3col', headerLayout: 'full',
    badge: 'Workflow',
    headlineSize: 32, headlineMargin: '8px 0 0',
    cardType: 'pillar', titleSize: 18, bodySize: 14, titleMarginBottom: 10,
    cardMode: 'numbered', limit: 3
  });
}

// Inline SVG line-icon picker for services. Returns a simple stroked icon (44x44 box,
// brand color) selected semantically by content keywords, index as fallback.
function serviceIcon(name, color, idx) {
  const n = (name || '').toLowerCase();
  let svg = '';
  if (/dna|brand|warna|identitas|palette/.test(n)) {
    svg = '<circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10z"/>';
  } else if (/copilot|ai|chat|asisten|konteks/.test(n)) {
    svg = '<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>';
  } else if (/pipeline|gpu|lokal|render|produksi|comfy|workflow/.test(n)) {
    svg = '<rect x="7" y="2" width="10" height="18" rx="2"/><path d="M10 6h4M9 10h6M10 14h4"/>';
  } else if (/sheets|spreadsheet|sync|google|data/.test(n)) {
    svg = '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>';
  } else {
    const icons = [
      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="3" x2="12" y2="6"/>',
      '<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M3 10l8 5 8-5"/>',
      '<path d="M4 20V8m0 0a8 8 0 0 1 16 0M4 8l16 12"/>',
      '<circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/>'
    ];
    svg = icons[(idx || 0) % 4];
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`;
}

function renderEditorialServicesGrid(slide, brand) {
  const lines = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim().split('\n').map(l => l.trim()).filter(Boolean);
  const { cards } = parseEditorialCards(slide.content);
  const parsed = cards.length > 0 ? cards : parseEditorialBulletCards(lines, 'bullets');

  const cardHtml = parsed.slice(0, 4).map((card, i) => {
    const iconColor = i % 2 === 0 ? brand.primaryColor : brand.secondaryColor;
    return `
      <div class="service-card">
        <div class="editorial-icon-box">${serviceIcon(card.title, iconColor, i)}</div>
        <h3 style="font-size:18px; font-weight:700; color:var(--text-headline); margin:0 0 8px;">${inline(card.title)}</h3>
        <p style="font-size:13px; color:var(--text-body); line-height:1.5; margin:0;">${inline(card.desc)}</p>
      </div>`;
  }).join('\n');

  return `
    <section class="archetype-services-grid">
      <div style="grid-column:1/-1; margin-bottom:8px;">
        <span class="hero-pill-badge">Layanan</span>
        <h2 style="font-family:var(--font-display); font-size:32px; font-weight:800; color:var(--text-headline); margin:8px 0 0;">${inline(slide.title)}</h2>
      </div>
      <div class="services-grid-2x2">
        ${cardHtml}
      </div>
    </section>`;
}

// Ecosystem orbit: 50/50 split — left inline circular orbit SVG (center node + 4 satellites),
// right feature-list detail cards parsed from the slide.
function renderEditorialEcosystem(slide, brand) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const { cards } = parseEditorialCards(content);
  const defaultLabels = ['Brand DNA', 'GPU Pipeline', 'Google Sheets Sync', 'AI Copilot'];
  const labels = cards.length > 0 ? cards.slice(0, 4).map(c => c.title) : defaultLabels;
  const features = cards.length > 0 ? cards : defaultLabels.map(l => ({ title: l, desc: l }));

  const cx = 200, cy = 200, ring = 130;
  const satellites = [
    { x: cx, y: cy - ring, label: labels[0] },
    { x: cx + ring, y: cy, label: labels[1] },
    { x: cx, y: cy + ring, label: labels[2] },
    { x: cx - ring, y: cy, label: labels[3] }
  ];

  const satelliteNodes = satellites.map((s, i) => {
    const angle = i * (Math.PI / 2);
    const textX = cx + Math.cos(angle) * (ring + 46);
    const textY = cy + Math.sin(angle) * (ring + 46);
    return `
      <g>
        <line x1="${cx}" y1="${cy}" x2="${s.x}" y2="${s.y}" stroke="${brand.primaryColor}" stroke-width="2" opacity="0.5"/>
        <circle cx="${s.x}" cy="${s.y}" r="26" fill="${i === 1 ? brand.primaryColor : '#ffffff'}" stroke="${brand.primaryColor}" stroke-width="2"/>
        <text x="${textX}" y="${textY}" text-anchor="middle" font-size="12" font-weight="600" fill="${brand.primaryColor}">${inline(s.label)}</text>
      </g>`;
  }).join('\n');

  const ringCircle = `<circle cx="${cx}" cy="${cy}" r="${ring}" fill="none" stroke="${brand.primaryColor}" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.35"/>`;

  const orbitSvg = `
    <svg class="ecosystem-orbit-diagram" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      ${ringCircle}
      ${satelliteNodes}
      <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="16" font-weight="800" fill="${brand.primaryColor}">${inline(brand.name)}</text>
    </svg>`;

  const featureHtml = features.slice(0, 4).map((f, i) => `
    <div class="ecosystem-feature-card">
      <span style="display:inline-block; min-width:26px; font-weight:800; color:${brand.primaryColor};">${String(i + 1).padStart(2, '0')}</span>
      <div>
        <h3 style="font-size:15px; font-weight:700; color:var(--text-headline); margin:0 0 4px;">${inline(f.title)}</h3>
        <p style="font-size:13px; color:var(--text-body); line-height:1.5; margin:0;">${inline(f.desc)}</p>
      </div>
    </div>`).join('\n');

  return `
    <section class="archetype-ecosystem-orbit">
      <div style="grid-column:1/-1; margin-bottom:8px;">
        <span class="hero-pill-badge">Ekosistem</span>
        <h2 style="font-family:var(--font-display); font-size:32px; font-weight:800; color:var(--text-headline); margin:8px 0 0;">${inline(slide.title)}</h2>
      </div>
      <div class="ecosystem-split">
        <div class="ecosystem-orbit-diagram-wrap">${orbitSvg}</div>
        <div class="ecosystem-feature-list">${featureHtml}</div>
      </div>
    </section>`;
}

// Differentiator: "Mengapa Kami" comparison. Parses markdown table if present into a
// conventional column vs a highlighted Venturo Pro column; falls back to split cards.
function renderEditorialDifferentiator(slide, brand) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const tableLines = lines.filter(l => l.startsWith('|'));

  if (tableLines.length > 0) {
    const rows = [];
    for (const tl of tableLines) {
      const cleaned = tl.replace(/^\||\|$/g, '').trim();
      if (/^(\s*:?-{2,}:?\s*\|?)+$/.test(cleaned)) continue;
      const cols = cleaned.split('|').map(c => c.replace(/\*\*/g, '').trim());
      if (cols.length >= 2) rows.push(cols);
    }
    // Header row is rows[0] ("| | CapCut | SaaS | Jasa | Venturo Pro |"), data rows follow.
    const header = rows.length > 0 ? rows[0] : [];
    const data = rows.slice(1);
    const venturoIdx = header.findIndex(h => /venturo|kami|pro/.test(h.toLowerCase()));

    // Conventional column: concatenate every non-Venturo column per row into one summary.
    const conventionalHtml = data.map(r => {
      const others = r.map((val, ci) => ci === 0 || ci === venturoIdx ? null : val).filter(Boolean);
      return `<li><strong>${inline(r[0])}:</strong> ${inline(others.join(' / '))}</li>`;
    }).join('\n');
    const venturoHtml = data.map(r => `<li><strong>${inline(r[0])}:</strong> ${inline(r[venturoIdx])}</li>`).join('\n');

    return `
      <section class="archetype-differentiator">
        <div class="comparison-col">
          <h3>Cara Konvensional / SaaS Cloud</h3>
          <ul>${conventionalHtml}</ul>
        </div>
        <div class="comparison-col-venturo">
          <h3>Cara Venturo Pro</h3>
          <ul>${venturoHtml}</ul>
        </div>
      </section>`;
  }

  // Bullets fallback: split parsed cards into halves.
  const { cards } = parseEditorialCards(content);
  const half = Math.ceil(cards.length / 2);
  const left = cards.slice(0, half);
  const right = cards.slice(half);
  const fallbackList = (list) => list.map(c => `<li><strong>${inline(c.title)}</strong> — ${inline(c.desc)}</li>`).join('\n');

  return `
    <section class="archetype-differentiator">
      <div class="comparison-col">
        <h3>Cara Konvensional / SaaS Cloud</h3>
        <ul>${fallbackList(left)}</ul>
      </div>
      <div class="comparison-col-venturo">
        <h3>Cara Venturo Pro</h3>
        <ul>${fallbackList(right)}</ul>
      </div>
    </section>`;
}

// Pricing: 3 tier cards parsed from bullets, middle tier featured with a ribbon.
function renderEditorialPricing(slide, brand) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const { cards } = parseEditorialCards(content);

  const tierCards = cards.length >= 3 ? cards.slice(0, 3) : cards.concat(
    Array.from({ length: 3 - cards.length }, (_, i) => ({ title: 'Paket ' + (i + 1), desc: '—' }))
  );

  const priceOf = (tier) => {
    const m = tier.title.match(/\(([^)]+)\)/);
    return m ? m[1] : tier.title.replace(/^.*?[–—-]\s*/, '');
  };
  const nameOf = (tier) => tier.title.split(/[({–—-]/)[0].trim();

  const cardHtml = tierCards.map((tier, i) => {
    const isFeatured = i === 1;
    const features = tier.desc.split(/[;]/).map(f => f.trim()).filter(Boolean);
    const price = priceOf(tier);
    const name = nameOf(tier);
    return `
      <div class="pricing-card${isFeatured ? ' pricing-card-featured' : ''}">
        ${isFeatured ? '<div class="pricing-ribbon">Best Seller</div>' : ''}
        <h3 style="font-size:20px; font-weight:800; color:var(--text-headline); margin:0 0 10px;">${inline(name)}</h3>
        <div style="font-size:26px; font-weight:800; color:${brand.primaryColor}; margin-bottom:16px;">${inline(price)}</div>
        <ul style="list-style:none; padding:0; margin:0 0 24px; display:flex; flex-direction:column; gap:8px;">
          ${features.map(f => `<li style="font-size:13px; color:var(--text-body); display:flex; gap:8px;"><span style="color:${brand.primaryColor};">✓</span> ${inline(f)}</li>`).join('\n')}
        </ul>
        <button class="btn-solid">${isFeatured ? 'Pilih Paket Pro' : i === 0 ? 'Mulai Gratis' : 'Hubungi Tim'}</button>
      </div>`;
  }).join('\n');

  return `
    <section class="archetype-pricing-cards">
      <div style="grid-column:1/-1; margin-bottom:8px;">
        <span class="hero-pill-badge">Paket</span>
        <h2 style="font-family:var(--font-display); font-size:32px; font-weight:800; color:var(--text-headline); margin:8px 0 0;">${inline(slide.title)}</h2>
      </div>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:24px; align-items:stretch;">
        ${cardHtml}
      </div>
    </section>`;
}

function renderEditorialMetrics(slide, brand) {
  return renderEditorialCardGrid(slide, {
    sectionClass: 'archetype-metrics-contact', headerLayout: 'full',
    badge: 'Pencapaian',
    headlineSize: 32, headlineMargin: '8px 0 0',
    cardType: 'metric',
    cardMode: 'metrics'
  });
}

function renderEditorialClosing(slide, brand) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  let desc = '';
  const contacts = [];
  for (const line of lines) {
    const m = line.match(/^[-*]\s*(.+?)\s*:\s*(.+)$/);
    if (m) contacts.push({ label: m[1].replace(/[*_`]/g, '').trim(), value: m[2].replace(/[*_`]/g, '').trim() });
    else if (!desc && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*')) desc = line;
  }

  const contactCards = contacts.slice(0, 4).map((c, i) => `
    <div class="contact-grid-item">
      <span style="font-size:12px; text-transform:uppercase; letter-spacing:1px; opacity:0.7; color:#fff;">${inline(c.label)}</span>
      <span style="font-size:15px; font-weight:600; color:#fff; margin:6px 0 0;">${inline(c.value)}</span>
    </div>`).join('\n');

  return `
    <section class="archetype-closing-cta" style="display:flex; align-items:center; justify-content:center;">
      <div class="closing-charcoal-container" style="background:#232220; border-radius:16px; padding:48px; color:#ffffff; max-width:960px; width:100%; text-align:center;">
        <span class="hero-pill-badge" style="margin-bottom:16px;">Hubungi Kami</span>
        <h2 style="font-family:var(--font-display); font-size:40px; font-weight:800; color:#ffffff; margin:0 0 16px;">${inline(slide.title)}</h2>
        ${desc ? `<p style="font-size:17px; color:rgba(255,255,255,0.85); max-width:640px; margin:0 auto 28px;">${inline(desc)}</p>` : ''}
        ${contactCards ? `<div class="contact-grid-4col" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; margin-bottom:32px;">${contactCards}</div>` : ''}
        <div class="hero-actions" style="display:flex; justify-content:center; gap:16px; margin-top:8px;">
          <button class="btn-solid">Hubungi Sekarang</button>
          <button class="btn-outline" style="border-color:rgba(255,255,255,0.4); color:#ffffff;">Kembali ke Awal</button>
        </div>
      </div>
    </section>`;
}

function renderEditorialNarrativeSplit(slide, brand, type) {
  const content = slide.content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const { introText, cards } = parseEditorialCards(content);

  // Left column: pill badge, H2, intro paragraph, status SVG
  const pillLabel = type === 'problem' ? 'Tantangan' : 'Solusi';
  const statusSvg = type === 'problem'
    ? `<svg class="narrative-status-svg" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 10 L110 100 Q112 105 107 108 L13 108 Q8 105 10 100 Z" fill="${brand.primaryColor}" opacity="0.12" stroke="${brand.primaryColor}" stroke-width="2"/>
        <text x="60" y="72" text-anchor="middle" font-size="32" font-weight="700" fill="${brand.primaryColor}">!</text>
       </svg>`
    : `<svg class="narrative-status-svg" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="50" fill="${brand.primaryColor}" opacity="0.1" stroke="${brand.primaryColor}" stroke-width="2"/>
        <path d="M60 20 L65 55 L95 50 L70 65 L80 95 L60 75 L40 95 L50 65 L25 50 L55 55 Z" fill="${brand.primaryColor}" opacity="0.7"/>
       </svg>`;

  const leftHtml = `
    <div style="flex: 0 0 35%;">
      <span class="hero-pill-badge">${pillLabel}</span>
      <h2 style="font-family:var(--font-display); font-size:32px; font-weight:800; color:var(--text-headline); margin:16px 0 12px;">${inline(slide.title)}</h2>
      ${introText ? `<p style="font-size:15px; color:var(--text-body); line-height:1.6; margin:0 0 20px;">${inline(introText)}</p>` : ''}
      <div style="display:flex; justify-content:center;">${statusSvg}</div>
    </div>`;

  // Right column: numbered cards
  const cardsHtml = cards.map((card, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `
      <div class="editorial-card-numbered">
        <div class="editorial-num-badge">${num}</div>
        <div class="editorial-num-body">
          <h3 class="editorial-card-title">${inline(card.title)}</h3>
          <p class="editorial-card-desc">${inline(card.desc)}</p>
        </div>
      </div>`;
  }).join('\n');

  const rightHtml = `
    <div style="flex: 0 0 65%; display:flex; flex-direction:column; gap:16px;">
      ${cardsHtml}
    </div>`;

  return `
    <section class="archetype-narrative-split" style="display:flex; gap:40px; padding:40px;">
      ${leftHtml}
      ${rightHtml}
    </section>`;
}

// 6. Convert slides into HTML based on detected archetypes
const slideHtml = slides.map((s, idx) => {
  if (THEME === 'editorial') {
    const archetype = classifyEditorialArchetype(s, idx, slides.length);
    switch (archetype) {
      case 'archetype-narrative-split': {
        const type = /masalah|tantangan|pain|problem/.test((s.title || '').toLowerCase()) ? 'problem' : 'solution';
        return renderEditorialNarrativeSplit(s, brand, type);
      }
      case 'archetype-hero-cover': return renderEditorialHero(s, brand);
      case 'archetype-services-grid': return renderEditorialServicesGrid(s, brand);
      case 'archetype-ecosystem-orbit': return renderEditorialEcosystem(s, brand);
      case 'archetype-metrics-contact': return renderEditorialMetrics(s, brand);
      case 'archetype-differentiator': return renderEditorialDifferentiator(s, brand);
      case 'archetype-pricing-cards': return renderEditorialPricing(s, brand);
      default: return renderEditorialClosing(s, brand);
    }
  }
  const type = detectSlideType(s, idx, slides.length);
  switch (type) {
    case 'hero': return renderHeroSlide(s, brand);
    case 'problem': return renderProblemSlide(s, brand);
    case 'solution': return renderSolutionSlide(s, brand);
    case 'ecosystem': return renderEcosystemSlide(s, brand);
    case 'features': return renderFeaturesSlide(s, brand);
    case 'differentiator': return renderDifferentiatorSlide(s, brand);
    case 'showcase': return renderShowcaseSlide(s, brand);
    case 'pricing': return renderPricingSlide(s, brand);
    case 'offer': return renderOfferSlide(s, brand);
    case 'closing': return renderClosingSlide(s, brand);
    default: return renderGeneralSlide(s, brand);
  }
}).join('\n');

// 7. Inject into HTML Shell with dynamic CSS variables
let shell = fs.readFileSync(SHELL, 'utf8');
let customCss = fs.readFileSync(CSS, 'utf8');

// Inject dynamic client HSL tokens (no-op when CSS lacks these tokens, e.g. editorial.css)
customCss = customCss
  .replace(/--brand-h:\s*\d+;/, `--brand-h: ${hsl.h};`)
  .replace(/--brand-s:\s*\d+%;/, `--brand-s: ${hsl.s}%;`)
  .replace(/--brand-l:\s*\d+%;/, `--brand-l: ${hsl.l}%;`);

if (THEME === 'editorial') {
  shell = shell.replace(/<title>.*?<\/title>/, `<title>${brand.name} — Company Profile</title>`);
  shell = shell.replace('/* CSS_INLINE_PLACEHOLDER */', customCss);
  shell = shell.replace('<!-- SLIDES_INLINE_PLACEHOLDER -->', slideHtml);
} else {
  shell = shell.replace('/* {{CUSTOM_CSS}} */', customCss);
  shell = shell.replace(/{{COMPANY_NAME}}/g, brand.name);
  shell = shell.replace(
    /<!-- Konten slide di-inject di sini oleh builder -->[\s\S]*?<!-- Setiap section adalah satu slide beresolusi 1920x1080 \(16:9\) -->/,
    slideHtml
  );
}

// 8. Write primary deliverables
fs.writeFileSync(path.join(OUT_DIR, 'index.html'), shell, 'utf8');
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
  `Output Target   : ${path.join(OUT_DIR, 'index.html')}`,
  `Timestamp       : ${new Date().toISOString()}`,
  '',
  `Total Slides    : ${slides.length}`,
  ...slides.map((s, i) => {
    const type = THEME === 'editorial'
      ? classifyEditorialArchetype(s, i, slides.length).replace(/^archetype-/, '')
      : detectSlideType(s, i, slides.length);
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
  `  - Slide Deck    : ${path.join(OUT_DIR, 'index.html')}`,
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

console.log(`\n🎉 Company profile build complete!`);
console.log(`  Target : ${path.join(OUT_DIR, 'index.html')}`);
console.log(`  Slides : ${slides.length} slides compiled`);
console.log(`  Assets : 5 SVG vector assets generated in ${ASSETS_DIR}`);
console.log(`  Reports: build.log, review-report, and seo-report consolidated in ${REPORTS_DIR}`);
console.log(`  Drafts : source drafts consolidated in ${DRAFTS_DIR}\n`);

if (typeof module !== 'undefined' && typeof require !== 'undefined') {
  module.exports = { parseAndSanitizeMarkdown, parseEditorialCards, renderEditorialNarrativeSplit, renderEditorialEcosystem, renderEditorialDifferentiator, renderEditorialPricing, renderEditorialServicesGrid };
}