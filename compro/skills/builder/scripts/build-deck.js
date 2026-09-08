#!/usr/bin/env node
/* build-deck.js — Company Profile Builder & Smart Asset Pipeline
   Converts company profile markdown into an ultra-modern 16:9 Reveal.js HTML
   deck with procedural vector assets, client dynamic theming, and full
   directory consolidation into compros/<slug>/.
*/
const fs = require('fs');
const path = require('path');
const assetGenerator = require('./asset-generator');

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
const slug = process.argv[2] || 'congen';

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
for (const dir of templateCandidates) {
  const s = path.join(dir, 'profile-shell.html');
  const c = path.join(dir, 'custom.css');
  if (fs.existsSync(s) && fs.existsSync(c)) {
    SHELL = s;
    CSS = c;
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
  console.error(`Error: No input markdown draft found. Checked paths:\n${candidatePaths.map(c => ' - ' + c).join('\n')}`);
  process.exit(1);
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

// 5. Parse & chunking: H1 = new slide
const body = md.replace(/^---[\s\S]*?---\s*/, '');
const rawSlides = body.split(/^# /m).map(s => s.trim()).filter(Boolean);
const slides = rawSlides.map(s => {
  const newline = s.indexOf('\n');
  const title = newline === -1 ? s.trim() : s.slice(0, newline).trim();
  const content = newline === -1 ? '' : s.slice(newline + 1).trim();
  return { title, content };
});

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
  if (t.includes('layanan') || t.includes('fitur') || t.includes('feature') || t.includes('ekosistem') || t.includes('ecosystem') || t.includes('arsitektur')) return 'ecosystem';
  if (t.includes('pencapaian') || t.includes('bukti') || t.includes('traction') || t.includes('showcase') || t.includes('portfolio') || t.includes('studi kasus')) return 'showcase';
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
    if (/^(?:📊|[-*])\s*\*\*/u.test(line)) {
      const clean = line.replace(/^(?:📊|[-*])\s*/u, '');
      const parts = clean.split(/[—–]|\s+-\s+/).map(p => p.trim());
      const label = parts[0].replace(/\*\*/g, '');
      const sub = parts[1] ? parts[1].replace(/\*\*/g, '') : '';
      stats.push({ label, sub });
    } else if (!tagline && !/^💼/u.test(line) && !line.startsWith('Kami')) {
      tagline = line;
    } else if (/^💼/u.test(line)) {
      desc = line.replace(/^💼\s*/u, '');
    } else if (!desc && line.length > 50 && !line.startsWith('Kami')) {
      desc = line;
    }
  }

  const statsHtml = stats.slice(0, 3).map((st, i) => {
    let statNum = '0' + (i + 1);
    const lt = st.label.toLowerCase();
    if (lt.includes('satu kali') || lt.includes('1') || lt.includes('setup')) statNum = '1x';
    else if (lt.includes('dna') || lt.includes('brand')) statNum = '100%';
    else if (lt.includes('sheets') || lt.includes('sync') || lt.includes('native')) statNum = '1-Klik';

    return `
      <div class="stat-item">
        <div class="stat-number">${statNum}</div>
        <div class="stat-label">${inline(st.label)}</div>
        <div style="font-size:12px; color:var(--brand-text-muted);">${inline(st.sub)}</div>
      </div>`;
  }).join('\n');

  return `
    <section class="hero-slide">
      <div class="slide-content">
        <div class="hero-grid">
          <div class="hero-content">
            <div class="badge-eyebrow">${brand.name} Profile</div>
            <h1 class="hero-title"><span class="hero-title-gradient">${inline(slide.title)}</span></h1>
            ${tagline ? `<p class="hero-tagline">${inline(tagline)}</p>` : ''}
            ${desc ? `<p class="hero-desc">${inline(desc)}</p>` : ''}
            ${statsHtml ? `<div class="hero-stats">${statsHtml}</div>` : ''}
          </div>
          <div class="hero-visual">
            <img src="assets/hero-banner.svg" alt="${brand.name} Visual" style="width:100%; max-width:620px; border-radius:20px; filter:drop-shadow(0 20px 40px rgba(0,0,0,0.5));">
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

  const cardsHtml = cards.map((c, idx) => `
    <div class="problem-card">
      <div class="card-icon-warning">
        ${assetGenerator.getIconSvg('warning', { size: 24, color: 'var(--color-problem)' })}
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
            <img src="assets/ecosystem-diagram.svg" alt="${brand.name} Ecosystem Diagram" style="max-height:510px; width:100%; object-fit:contain; filter:drop-shadow(0 16px 36px rgba(0,0,0,0.5));">
          </div>
        </div>
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

  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    if (l.startsWith('>')) {
      quote = l.replace(/^>\s*/, '');
    } else if (!bannerDesc && !l.startsWith('#') && !l.startsWith('-') && !l.startsWith('*')) {
      bannerDesc = l;
    }
  }

  const appStoreSvg = assetGenerator.getIconSvg('app-store', { size: 24, color: '#ffffff' });
  const googlePlaySvg = assetGenerator.getIconSvg('google-play', { size: 24, color: '#ffffff' });
  const waSvg = assetGenerator.getIconSvg('whatsapp', { size: 20, color: 'var(--brand-primary-light)' });
  const mailSvg = assetGenerator.getIconSvg('mail', { size: 20, color: 'var(--brand-primary-light)' });
  const phoneSvg = assetGenerator.getIconSvg('phone', { size: 20, color: 'var(--brand-primary-light)' });
  const pinSvg = assetGenerator.getIconSvg('map-pin', { size: 20, color: 'var(--brand-primary-light)' });

  return `
    <section class="slide-closing">
      <div class="slide-content">
        <div class="closing-banner">
          <div class="badge-eyebrow" style="margin:0 auto 16px;">Mulai Sekarang</div>
          <h2>Mulai Produksi Video Ber-Brand Hari Ini</h2>
          <p>${bannerDesc ? inline(bannerDesc) : 'Jangan biarkan biaya produksi yang tak terprediksi menjadi alasan brand-mu tampil tidak konsisten lagi.'}</p>
          <div class="store-pills">
            <a href="#" class="app-store-pill">
              ${appStoreSvg}
              <div class="pill-text">
                <small>Download on the</small>
                <span>App Store</span>
              </div>
            </a>
            <a href="#" class="google-play-pill">
              ${googlePlaySvg}
              <div class="pill-text">
                <small>GET IT ON</small>
                <span>Google Play</span>
              </div>
            </a>
          </div>
        </div>

        <div class="contact-grid">
          <div class="contact-card">
            <div class="contact-icon">${waSvg}</div>
            <div class="contact-info">
              <span class="contact-label">WhatsApp Official</span>
              <span class="contact-value">+62 812-8888-0199</span>
            </div>
          </div>
          <div class="contact-card">
            <div class="contact-icon">${mailSvg}</div>
            <div class="contact-info">
              <span class="contact-label">Email Support</span>
              <span class="contact-value">halo@venturopro.id</span>
            </div>
          </div>
          <div class="contact-card">
            <div class="contact-icon">${phoneSvg}</div>
            <div class="contact-info">
              <span class="contact-label">Call Center</span>
              <span class="contact-value">(021) 5088-7200</span>
            </div>
          </div>
          <div class="contact-card">
            <div class="contact-icon">${pinSvg}</div>
            <div class="contact-info">
              <span class="contact-label">Kantor & Komunitas</span>
              <span class="contact-value">Jakarta Selatan, ID</span>
            </div>
          </div>
        </div>

        ${quote ? `
        <div style="margin-top:20px; text-align:center; font-size:13px; color:var(--brand-text-muted); font-style:italic;">
          ${inline(quote)}
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

// 6. Convert slides into HTML based on detected archetypes
const slideHtml = slides.map((s, idx) => {
  const type = detectSlideType(s, idx, slides.length);
  switch (type) {
    case 'hero': return renderHeroSlide(s, brand);
    case 'problem': return renderProblemSlide(s, brand);
    case 'solution': return renderSolutionSlide(s, brand);
    case 'ecosystem': return renderEcosystemSlide(s, brand);
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

// Inject dynamic client HSL tokens
customCss = customCss
  .replace(/--brand-h:\s*\d+;/, `--brand-h: ${hsl.h};`)
  .replace(/--brand-s:\s*\d+%;/, `--brand-s: ${hsl.s}%;`)
  .replace(/--brand-l:\s*\d+%;/, `--brand-l: ${hsl.l}%;`);

shell = shell.replace('/* {{CUSTOM_CSS}} */', customCss);
shell = shell.replace(/{{COMPANY_NAME}}/g, brand.name);
shell = shell.replace(
  /<!-- Konten slide di-inject di sini oleh builder -->[\s\S]*?<!-- Setiap section adalah satu slide beresolusi 1920x1080 \(16:9\) -->/,
  slideHtml
);

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
    const type = detectSlideType(s, i, slides.length);
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