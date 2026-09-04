/**
 * Sitegen Checklist Reviewer — Technical Check Script
 * 
 * Script ini membaca file-file landing page (HTML/TSX/CSS) di folder yang diberikan
 * dan melakukan pengecekan teknis otomatis.
 * 
 * Penggunaan:
 *   node check-technical.js <path-ke-folder-landing>
 * 
 * Contoh:
 *   node check-technical.js landings/novatech/
 * 
 * Output: JSON ke stdout berisi hasil pengecekan per item.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { resolve, join, extname } from 'path';

const projectDir = resolve(process.argv[2] || '.');

if (!existsSync(projectDir)) {
  console.error(`Error: Folder tidak ditemukan: ${projectDir}`);
  process.exit(1);
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
      // Skip node_modules dan .next
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
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

// ============ CHECK FUNCTIONS ============

const results = [];

function addResult(item, status, detail) {
  results.push({ item, status, detail });
}

// --- 1. Cek Title Tag ---
function checkTitleTags() {
  const htmlFiles = findFiles(projectDir, ['.html']);
  const tsxFiles = findFiles(projectDir, ['.tsx', '.ts']);
  
  // Cek di HTML files
  let found = false;
  for (const f of htmlFiles) {
    const content = readFile(f);
    if (content && /<title[^>]*>/.test(content)) {
      found = true;
      const match = content.match(/<title[^>]*>(.*?)<\/title>/);
      if (match && match[1].length > 55) {
        addResult('Title tag <= 55 char', 'FAIL', `Title "${match[1]}" = ${match[1].length} char (maks 55)`);
        return;
      }
    }
  }
  
  // Cek di TSX files (Next.js metadata export)
  for (const f of tsxFiles) {
    const content = readFile(f);
    if (content && /metadata.*title/s.test(content)) {
      found = true;
    }
  }
  
  addResult('Title tag ada', found ? 'PASS' : 'FAIL', found ? 'Ditemukan' : 'Tidak ditemukan di file HTML/TSX');
}

// --- 2. Cek Meta Description ---
function checkMetaDescription() {
  const htmlFiles = findFiles(projectDir, ['.html']);
  const tsxFiles = findFiles(projectDir, ['.tsx', '.ts']);
  
  let found = false;
  for (const f of htmlFiles) {
    const content = readFile(f);
    if (content && /meta\s+name=["']description["']/.test(content)) {
      found = true;
      const match = content.match(/meta\s+name=["']description["']\s+content=["'](.*?)["']/);
      if (match && match[1].length > 155) {
        addResult('Meta description <= 155 char', 'FAIL', `Meta desc = ${match[1].length} char (maks 155)`);
        return;
      }
    }
  }
  
  for (const f of tsxFiles) {
    const content = readFile(f);
    if (content && /metadata.*description/s.test(content)) {
      found = true;
    }
  }
  
  addResult('Meta description ada', found ? 'PASS' : 'FAIL', found ? 'Ditemukan' : 'Tidak ditemukan');
}

// --- 3. Cek Alt Text pada Gambar ---
function checkAltText() {
  const files = findFiles(projectDir, ['.html', '.tsx']);
  let totalImages = 0;
  let imagesWithAlt = 0;
  
  for (const f of files) {
    const content = readFile(f);
    if (!content) continue;
    
    // Match <img atau <Image tags
    const imgTags = content.match(/<(?:img|Image)\s[^>]*>/gi) || [];
    totalImages += imgTags.length;
    
    for (const tag of imgTags) {
      if (/alt=["'][^"']*["']/.test(tag)) {
        imagesWithAlt++;
      }
    }
  }
  
  const status = totalImages === 0 || imagesWithAlt === totalImages ? 'PASS' : 'FAIL';
  addResult('Alt text semua gambar', status, `${imagesWithAlt}/${totalImages} gambar punya alt text`);
}

// --- 4. Cek Title Attr pada Links ---
function checkLinkTitles() {
  const files = findFiles(projectDir, ['.html', '.tsx']);
  let totalLinks = 0;
  let linksWithTitle = 0;
  
  for (const f of files) {
    const content = readFile(f);
    if (!content) continue;
    
    const linkTags = content.match(/<a\s[^>]*>/gi) || [];
    totalLinks += linkTags.length;
    
    for (const tag of linkTags) {
      if (/title=["'][^"']*["']/.test(tag)) {
        linksWithTitle++;
      }
    }
  }
  
  const status = totalLinks === 0 || linksWithTitle === totalLinks ? 'PASS' : 'FAIL';
  addResult('Title attr semua link', status, `${linksWithTitle}/${totalLinks} link punya title`);
}

// --- 5. Cek robots.txt ---
function checkRobotsTxt() {
  const paths = [
    join(projectDir, 'robots.txt'),
    join(projectDir, 'public', 'robots.txt'),
    join(projectDir, 'app', 'robots.ts'),
    join(projectDir, 'app', 'robots.tsx'),
  ];
  
  const found = paths.find(p => existsSync(p));
  addResult('robots.txt ada', found ? 'PASS' : 'FAIL', found || 'Tidak ditemukan');
}

// --- 6. Cek sitemap ---
function checkSitemap() {
  const paths = [
    join(projectDir, 'sitemap.xml'),
    join(projectDir, 'public', 'sitemap.xml'),
    join(projectDir, 'app', 'sitemap.ts'),
    join(projectDir, 'app', 'sitemap.tsx'),
  ];
  
  const found = paths.find(p => existsSync(p));
  addResult('sitemap ada', found ? 'PASS' : 'FAIL', found || 'Tidak ditemukan');
}

// --- 7. Cek Schema.org JSON-LD ---
function checkSchemaOrg() {
  const files = findFiles(projectDir, ['.html', '.tsx', '.ts']);
  let found = false;
  
  for (const f of files) {
    const content = readFile(f);
    if (content && /application\/ld\+json/.test(content)) {
      found = true;
      break;
    }
  }
  
  addResult('Schema.org JSON-LD ada', found ? 'PASS' : 'FAIL', found ? 'Ditemukan' : 'Tidak ditemukan');
}

// --- 8. Cek overflow-x: hidden ---
function checkOverflowHidden() {
  const cssFiles = findFiles(projectDir, ['.css']);
  let found = false;
  
  for (const f of cssFiles) {
    const content = readFile(f);
    if (content && /overflow-x\s*:\s*hidden/.test(content)) {
      found = true;
      break;
    }
  }
  
  addResult('overflow-x: hidden', found ? 'PASS' : 'FAIL', found ? 'Ditemukan di CSS' : 'Tidak ditemukan');
}

// --- 9. Cek Lenis ---
function checkLenis() {
  const pkgPath = join(projectDir, 'package.json');
  let found = false;
  
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFile(pkgPath));
    if (pkg.dependencies?.lenis || pkg.devDependencies?.lenis) {
      found = true;
    }
  }
  
  // Juga cek di file TSX apakah ada import lenis
  if (!found) {
    const tsxFiles = findFiles(projectDir, ['.tsx', '.ts']);
    for (const f of tsxFiles) {
      const content = readFile(f);
      if (content && /import.*lenis/i.test(content)) {
        found = true;
        break;
      }
    }
  }
  
  // Cek di HTML (CDN)
  if (!found) {
    const htmlFiles = findFiles(projectDir, ['.html']);
    for (const f of htmlFiles) {
      const content = readFile(f);
      if (content && /lenis/i.test(content)) {
        found = true;
        break;
      }
    }
  }
  
  addResult('Lenis smooth scroll', found ? 'PASS' : 'FAIL', found ? 'Terintegrasi' : 'Tidak ditemukan');
}

// --- 10. Cek Emoji ---
function checkNoEmoji() {
  const files = findFiles(projectDir, ['.html', '.tsx', '.ts']);
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  
  const filesWithEmoji = [];
  for (const f of files) {
    const content = readFile(f);
    if (content && emojiRegex.test(content)) {
      filesWithEmoji.push(f);
    }
  }
  
  addResult('Tidak ada emoji di UI', filesWithEmoji.length === 0 ? 'PASS' : 'FAIL', 
    filesWithEmoji.length === 0 ? 'Bersih dari emoji' : `Emoji ditemukan di: ${filesWithEmoji.join(', ')}`);
}

// --- 11. Cek Tailwind (harusnya TIDAK ada) ---
function checkNoTailwind() {
  const pkgPath = join(projectDir, 'package.json');
  let hasTailwind = false;
  
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFile(pkgPath));
    if (pkg.dependencies?.tailwindcss || pkg.devDependencies?.tailwindcss) {
      hasTailwind = true;
    }
  }
  
  // Cek tailwind.config
  const tailwindConfig = [
    join(projectDir, 'tailwind.config.js'),
    join(projectDir, 'tailwind.config.ts'),
  ];
  
  if (tailwindConfig.some(p => existsSync(p))) {
    hasTailwind = true;
  }
  
  addResult('CSS Modules (bukan Tailwind)', hasTailwind ? 'FAIL' : 'PASS', 
    hasTailwind ? 'Tailwind CSS terdeteksi — seharusnya Vanilla CSS Modules' : 'Benar, menggunakan CSS Modules');
}

// ============ MAIN ============

console.log(`\n=== Sitegen Technical Check ===`);
console.log(`Project: ${projectDir}\n`);

checkTitleTags();
checkMetaDescription();
checkAltText();
checkLinkTitles();
checkRobotsTxt();
checkSitemap();
checkSchemaOrg();
checkOverflowHidden();
checkLenis();
checkNoEmoji();
checkNoTailwind();

// Output results
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

// Output as JSON for programmatic use
console.log(`\n--- JSON Output ---`);
console.log(JSON.stringify({ projectDir, results, summary: { passed, failed, total: results.length } }, null, 2));
