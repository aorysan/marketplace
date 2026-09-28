/**
 * Sitegen Checklist Reviewer — Technical Check Script
 *
 * Membaca file-file landing page (HTML/TSX/CSS) di folder yang diberikan dan
 * melakukan pengecekan teknis otomatis sesuai SOP Sitegen.
 *
 * Penggunaan:
 *   node check-technical.js <path-ke-folder-landing>
 *
 * Contoh:
 *   node check-technical.js landings/novatech
 *
 * Output: ringkasan teks + JSON ke stdout.
 * EXIT CODE: 0 = semua lulus, 1 = ada FAIL (dipakai sebagai hard-fail gate QA/debug),
 *            2 = argumen/folder salah.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, join, relative, isAbsolute } from 'path';

const projectDir = resolve(process.argv[2] || '.');

if (!existsSync(projectDir)) {
  console.error(`Error: Folder tidak ditemukan: ${projectDir}`);
  process.exit(2);
}

// ============ UTILITY FUNCTIONS ============

/**
 * Rekursif mencari semua file dengan ekstensi tertentu di dalam folder.
 */
function findFiles(dir, extensions) {
  const results = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip dependency, build output, dan folder test (spec Playwright memuat
      // potongan markup di dalam pesan assertion, mis. `<img>`, yang akan
      // salah dihitung sebagai gambar halaman).
      if (['node_modules', '.next', '.git', 'dist', 'build', '.vercel', 'tests', '__tests__', 'e2e'].includes(entry.name)) continue;
      results.push(...findFiles(fullPath, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Membaca isi file sebagai string.
 */
function readFile(filePath) {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Menghapus komentar JS/JSX sebelum diperiksa.
 * Tanpa ini, komentar seperti `/* alt="palsu" *\/` di dalam tag akan dihitung
 * sebagai atribut asli sehingga pemeriksaan bisa dicurangi.
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1 ');
}

/** Ekstrak semua tag pembuka dengan nama tertentu (aman untuk tag multi-baris). */
function matchTags(content, names) {
  const pattern = new RegExp(`<(${names.join('|')})\\b[^>]*>`, 'gi');
  return content.match(pattern) || [];
}

/** Nilai atribut dianggap nyata bila literal non-kosong atau ekspresi JSX non-kosong. */
function hasRealAttr(tag, attr) {
  const literal = new RegExp(`${attr}\\s*=\\s*("[^"]+"|'[^']+')`);
  const expression = new RegExp(`${attr}\\s*=\\s*\\{\\s*[^}\\s][^}]*\\}`);
  return literal.test(tag) || expression.test(tag);
}

const results = [];
function addResult(item, status, detail) {
  results.push({ item, status, detail });
}

const srcFiles = () => findFiles(projectDir, ['.tsx', '.ts', '.jsx', '.js', '.html']);
const cssFiles = () => findFiles(projectDir, ['.css']);

function relativeList(paths, max = 3) {
  const list = paths.slice(0, max).map(p => (isAbsolute(p) ? relative(projectDir, p) : p));
  return paths.length > max ? `${list.join(', ')} (+${paths.length - max} lain)` : list.join(', ');
}

/** File test/spec (termasuk yang diletakkan berdampingan dengan komponen). */
const TEST_FILE = /\.(spec|test)\.(ts|tsx|js|jsx|mjs|cjs)$/;

/**
 * Semua file kode yang isinya sudah bebas komentar.
 * File test/spec dikecualikan: isinya bukan markup halaman.
 */
function scannedSources() {
  return srcFiles()
    .filter(f => !TEST_FILE.test(f))
    .map(f => ({ file: f, raw: readFile(f) }))
    .filter(entry => entry.raw !== null)
    .map(entry => ({ file: entry.file, content: stripComments(entry.raw) }));
}

// ============ CHECK FUNCTIONS ============

// --- 1. Cek Title Tag (panjang <= 55 char) ---
function checkTitleTags() {
  const sources = scannedSources();
  const found = sources.some(s => /<title[^>]*>/.test(s.content) || /metadata\s*[:=][\s\S]{0,200}?title\s*:/.test(s.content));
  addResult('Title tag ada', found ? 'PASS' : 'FAIL', found ? 'Ditemukan' : 'Tidak ditemukan di file HTML/TSX');

  const tooLong = [];
  for (const s of sources) {
    const html = s.content.match(/<title[^>]*>(.*?)<\/title>/);
    if (html && html[1].trim().length > 55) tooLong.push(`${relative(projectDir, s.file)} (${html[1].trim().length} char)`);
    const meta = s.content.match(/title\s*:\s*["'`]([^"'`]+)["'`]/);
    if (meta && meta[1].trim().length > 55) tooLong.push(`${relative(projectDir, s.file)} (${meta[1].trim().length} char)`);
  }
  addResult('Title tag <= 55 char', tooLong.length === 0 ? 'PASS' : 'FAIL',
    tooLong.length === 0 ? 'Semua title <= 55 karakter' : `Terlalu panjang: ${relativeList(tooLong)}`);
}

// --- 2. Cek Meta Description (panjang <= 155 char) ---
function checkMetaDescription() {
  const sources = scannedSources();
  const found = sources.some(s => /<meta\s+name=["']description["']/.test(s.content) || /description\s*:/.test(s.content));
  addResult('Meta description ada', found ? 'PASS' : 'FAIL', found ? 'Ditemukan' : 'Tidak ditemukan');

  const tooLong = [];
  for (const s of sources) {
    const html = s.content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/);
    if (html && html[1].length > 155) tooLong.push(`${relative(projectDir, s.file)} (${html[1].length} char)`);
    const meta = s.content.match(/description\s*:\s*["'`]([^"'`]+)["'`]/);
    if (meta && meta[1].length > 155) tooLong.push(`${relative(projectDir, s.file)} (${meta[1].length} char)`);
  }
  addResult('Meta description <= 155 char', tooLong.length === 0 ? 'PASS' : 'FAIL',
    tooLong.length === 0 ? 'Semua meta description <= 155 karakter' : `Terlalu panjang: ${relativeList(tooLong)}`);
}

// --- 3. Cek pasangan ganda alt + title pada gambar ---
function checkImageAttributes() {
  const sources = scannedSources();
  let total = 0;
  const missingAlt = [];
  const missingTitle = [];
  const placeholder = [];

  for (const s of sources) {
    const tags = matchTags(s.content, ['img', 'Image']);
    for (const tag of tags) {
      total += 1;
      if (!hasRealAttr(tag, 'alt')) missingAlt.push(`${relative(projectDir, s.file)} → ${tag.slice(0, 90)}…`);
      if (!hasRealAttr(tag, 'title')) missingTitle.push(`${relative(projectDir, s.file)} → ${tag.slice(0, 90)}…`);
      if (/src\s*=\s*["'][^"']*(picsum\.photos|placehold\.|via\.placeholder|example\.(jpg|jpeg|png)|loremflickr)/i.test(tag)) {
        placeholder.push(relative(projectDir, s.file));
      }
    }
  }

  addResult('Atribut alt pada semua gambar', missingAlt.length === 0 ? 'PASS' : 'FAIL',
    total === 0 ? 'Tidak ada gambar ditemukan' : `${total - missingAlt.length}/${total} gambar punya alt (nilai nyata)`);
  if (missingAlt.length > 0) results[results.length - 1].detail += ` — kurang: ${relativeList(missingAlt)}`;

  addResult('Atribut title pada semua gambar', missingTitle.length === 0 ? 'PASS' : 'FAIL',
    total === 0 ? 'Tidak ada gambar ditemukan' : `${total - missingTitle.length}/${total} gambar punya title (nilai nyata)`);
  if (missingTitle.length > 0) results[results.length - 1].detail += ` — kurang: ${relativeList(missingTitle)}`;

  addResult('Gambar tanpa placeholder fiktif', placeholder.length === 0 ? 'PASS' : 'FAIL',
    placeholder.length === 0 ? 'Tidak ada placeholder (picsum/placehold/example)' : `Placeholder di: ${relativeList(placeholder)}`);
}

// --- 4. Cek Title Attr pada Links ---
function checkLinkTitles() {
  const sources = scannedSources();
  let total = 0;
  const missing = [];

  for (const s of sources) {
    for (const tag of matchTags(s.content, ['a', 'Link'])) {
      total += 1;
      if (!hasRealAttr(tag, 'title')) missing.push(relative(projectDir, s.file));
    }
  }

  addResult('Title attr semua link', total === 0 || missing.length === 0 ? 'PASS' : 'FAIL',
    total === 0 ? 'Tidak ada link ditemukan' : `${total - missing.length}/${total} link punya title` +
      (missing.length ? ` — kurang: ${relativeList([...new Set(missing)])}` : ''));
}

// --- 5. Cek robots.txt ---
function checkRobotsTxt() {
  const found = [join(projectDir, 'robots.txt'), join(projectDir, 'public', 'robots.txt'),
    join(projectDir, 'app', 'robots.ts'), join(projectDir, 'app', 'robots.js')].find(p => existsSync(p));
  addResult('robots.txt ada', found ? 'PASS' : 'FAIL', found ? relative(projectDir, found) : 'Tidak ditemukan');
}

// --- 6. Cek sitemap ---
function checkSitemap() {
  const found = [join(projectDir, 'sitemap.xml'), join(projectDir, 'public', 'sitemap.xml'),
    join(projectDir, 'app', 'sitemap.ts'), join(projectDir, 'app', 'sitemap.js')].find(p => existsSync(p));
  addResult('sitemap ada', found ? 'PASS' : 'FAIL', found ? relative(projectDir, found) : 'Tidak ditemukan');
}

// --- 7. Cek Schema.org JSON-LD ---
function checkSchemaOrg() {
  const sources = scannedSources();
  const hit = sources.find(s => /application\/ld\+json/.test(s.content));
  addResult('Schema.org JSON-LD ada', hit ? 'PASS' : 'FAIL', hit ? relative(projectDir, hit.file) : 'Tidak ditemukan');
}

// --- 8. Cek overflow-x hidden pada html/body ---
function checkOverflowHidden() {
  let ok = false;
  const files = cssFiles();
  for (const f of files) {
    const raw = readFile(f);
    if (!raw) continue;
    const css = stripComments(raw);
    // Pecah per aturan CSS, cari aturan yang menyasar html dan/atau body.
    for (const rule of css.split('}')) {
      const [selectorPart, ...declParts] = rule.split('{');
      if (!selectorPart || declParts.length === 0) continue;
      const selector = selectorPart.trim().toLowerCase();
      const decls = declParts.join('{');
      const targetsRoot = /(^|[\s,])html\b/.test(selector) || /(^|[\s,])body\b/.test(selector);
      if (targetsRoot && /overflow-x\s*:\s*hidden/.test(decls) && /max-width\s*:\s*100(vw|%)/.test(decls)) {
        ok = true;
      }
    }
  }
  addResult('overflow-x: hidden + max-width pada html/body', ok ? 'PASS' : 'FAIL',
    ok ? 'Ditemukan di CSS' : 'Tidak ditemukan pasangan overflow-x: hidden + max-width pada html/body');
}

// --- 9. Cek Lenis ---
function checkLenis() {
  const pkgPath = join(projectDir, 'package.json');
  let found = false;

  if (existsSync(pkgPath)) {
    const raw = readFile(pkgPath);
    try {
      const pkg = raw ? JSON.parse(raw) : {};
      if (pkg.dependencies?.lenis || pkg.devDependencies?.lenis) found = true;
    } catch {
      /* package.json rusak → lanjut ke pemeriksaan sumber */
    }
  }

  if (!found) {
    found = scannedSources().some(s => /import\s+.*lenis/i.test(s.content) || /\bnew\s+Lenis\b/.test(s.content));
  }

  addResult('Lenis smooth scroll', found ? 'PASS' : 'FAIL', found ? 'Terintegrasi' : 'Tidak ditemukan');
}

// --- 10. Cek Emoji ---
function checkNoEmoji() {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const files = scannedSources().filter(s => emojiRegex.test(s.content)).map(s => s.file);
  addResult('Tidak ada emoji di UI', files.length === 0 ? 'PASS' : 'FAIL',
    files.length === 0 ? 'Bersih dari emoji' : `Emoji ditemukan di: ${relativeList(files)}`);
}

// --- 11. Cek Tailwind (harusnya TIDAK ada) ---
function checkNoTailwind() {
  let hasTailwind = false;
  const pkgPath = join(projectDir, 'package.json');

  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFile(pkgPath) || '{}');
      if (pkg.dependencies?.tailwindcss || pkg.devDependencies?.tailwindcss) hasTailwind = true;
    } catch {
      /* abaikan */
    }
  }
  if (['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.cjs'].some(f => existsSync(join(projectDir, f)))) {
    hasTailwind = true;
  }

  addResult('CSS Modules (bukan Tailwind)', hasTailwind ? 'FAIL' : 'PASS',
    hasTailwind ? 'Tailwind CSS terdeteksi — seharusnya Vanilla CSS Modules' : 'Benar, menggunakan CSS Modules');
}

// --- 12. Cek Trilogi Animasi: Anime.js v4 + unidirectional + stagger aktif ---
function checkAnimationStandard() {
  const sources = scannedSources();
  const animeFiles = sources.filter(s => /from\s+["']animejs["']/.test(s.content));

  // 12a. DILARANG API v3
  const v3ApiPattern = /import\s+anime\s+from\s+["']animejs["']|\banime\s*\(\s*\{|\banime\.(stagger|set|remove|random|timeline)\b/;
  const v3Files = animeFiles.filter(s => v3ApiPattern.test(s.content)).map(s => s.file);
  addResult('Anime.js v4 API (bukan v3)', v3Files.length === 0 ? 'PASS' : 'FAIL',
    v3Files.length === 0 ? 'Tidak ada pemakaian API v3' : `Masih API v3 di: ${relativeList(v3Files)}`);

  // 12b. Deteksi arah gulir (unidirectional) wajib ada
  const animated = animeFiles.filter(s => /\banimate\s*\(/.test(s.content));
  const tracked = animated.filter(s => /scrollY/.test(s.content)).map(s => s.file);
  addResult('Deteksi arah scroll (unidirectional)', animated.length === 0 || tracked.length === animated.length ? 'PASS' : 'FAIL',
    animated.length === 0 ? 'Tidak ada komponen animasi ditemukan'
      : `${tracked.length}/${animated.length} komponen animasi melacak scrollY`);

  // 12c. DILARANG once: true
  const onceFiles = sources.filter(s => /\bonce\s*:\s*true\b/.test(s.content)).map(s => s.file);
  addResult('Tidak ada `once: true`', onceFiles.length === 0 ? 'PASS' : 'FAIL',
    onceFiles.length === 0 ? 'Tidak ada animasi sekali jalan' : `Ditemukan di: ${relativeList(onceFiles)}`);

  // 12d. `.stagger-item` wajib benar-benar dianimasikan (bukan class inert)
  const usesStaggerClass = sources.filter(s => /stagger-item/.test(s.content));
  const hasStaggerCall = animeFiles.some(s => /\bstagger\s*\(/.test(s.content));
  const inert = usesStaggerClass.length > 0 && !hasStaggerCall;
  addResult('Staggering .stagger-item aktif', inert ? 'FAIL' : 'PASS',
    usesStaggerClass.length === 0 ? 'Tidak ada .stagger-item di halaman'
      : inert ? 'Class .stagger-item dipakai tetapi tidak ada pemanggilan stagger() — animasi inert'
        : `stagger() dipakai untuk ${usesStaggerClass.length} file ber-.stagger-item`);

  // 12e. DILARANG @types/animejs (stub usang)
  const pkgPath = join(projectDir, 'package.json');
  let stub = false;
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFile(pkgPath) || '{}');
      stub = Boolean(pkg.dependencies?.['@types/animejs'] || pkg.devDependencies?.['@types/animejs']);
    } catch {
      /* abaikan */
    }
  }
  addResult('Tanpa @types/animejs (stub usang)', stub ? 'FAIL' : 'PASS',
    stub ? '@types/animejs terpasang — animejs v4 sudah membawa tipe sendiri' : 'Tidak terpasang');

  // 12f. DILARANG individual transform properties di inline style pada file animasi.
  //      Anime.js v4 hanya menulis hasil animasinya ke `transform` dan TIDAK menghapus
  //      properti `translate`/`scale`/`rotate`, sehingga keduanya berkomposisi dan
  //      elemen tertinggal offset permanen (terverifikasi +30px di Chrome).
  const individualTransform = /style=\{\{[^}]*?\b(translate|scale|rotate|perspective|skew)(X|Y|Z)?\s*:/;
  const individualFiles = animated.filter(s => individualTransform.test(s.content)).map(s => s.file);
  addResult('Transform awal via inline `transform` (bukan translate/scale)',
    individualFiles.length === 0 ? 'PASS' : 'FAIL',
    individualFiles.length === 0
      ? 'Tidak ada individual transform property di inline style'
      : `Individual transform (translate/scale/rotate) di inline style pada: ${relativeList(individualFiles)} — berkomposisi dengan hasil animasi dan meninggalkan offset permanen`);
}

// --- 13. Cek aturan layout SwipeableCards (mobile horizontal scroll) ---
function checkSwipeableCards() {
  const moduleCss = cssFiles().filter(f => /SwipeableCards/i.test(f));
  if (moduleCss.length === 0) {
    addResult('SwipeableCards: flex-shrink + scroll-snap', 'PASS', 'Tidak ada komponen SwipeableCards di proyek');
    return;
  }
  const missing = [];
  for (const f of moduleCss) {
    const css = stripComments(readFile(f) || '');
    if (!/flex-shrink\s*:\s*0/.test(css) || !/scroll-snap-type\s*:\s*x/.test(css) || !/overflow-x\s*:\s*auto/.test(css)) {
      missing.push(f);
    }
  }
  addResult('SwipeableCards: flex-shrink + scroll-snap', missing.length === 0 ? 'PASS' : 'FAIL',
    missing.length === 0 ? 'Aturan horizontal scroll lengkap' : `Kurang flex-shrink:0 / scroll-snap-type:x / overflow-x:auto di: ${relativeList(missing)}`);
}

// ============ MAIN ============

console.log(`\n=== Sitegen Technical Check ===`);
console.log(`Project: ${projectDir}\n`);

checkTitleTags();
checkMetaDescription();
checkImageAttributes();
checkLinkTitles();
checkRobotsTxt();
checkSitemap();
checkSchemaOrg();
checkOverflowHidden();
checkLenis();
checkNoEmoji();
checkNoTailwind();
checkAnimationStandard();
checkSwipeableCards();

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;

console.log(`\n--- Hasil ---`);
for (const r of results) {
  const icon = r.status === 'PASS' ? '[PASS]' : '[FAIL]';
  console.log(`${icon} ${r.item} — ${r.detail}`);
}

console.log(`\n--- Ringkasan ---`);
console.log(`Passed: ${passed}/${results.length}`);
console.log(`Failed: ${failed}/${results.length}`);
console.log(`Status: ${failed === 0 ? 'ALL PASS' : 'NEEDS FIX'}`);

console.log(`\n--- JSON Output ---`);
console.log(JSON.stringify({ projectDir, results, summary: { passed, failed, total: results.length } }, null, 2));

// Hard-fail gate: QA/debug WAJIB memakai exit code ini, bukan hanya membaca teks.
process.exitCode = failed > 0 ? 1 : 0;
