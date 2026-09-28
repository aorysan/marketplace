#!/usr/bin/env node
/**
 * Insightify output verifier.
 *
 * Checks a generated OUT_DIR against the pipeline quality contract — the same
 * properties a reference build satisfies (baseline: insights/congen10).
 *
 * Usage:
 *   node scripts/verify-output.mjs <OUT_DIR>
 *   npm run verify:output -- <OUT_DIR>
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const CITATION = '> **Source:**';
// Sections buildDocSections deliberately keeps out of the HTML preview.
const HTML_SKIP = ['table of contents', 'approval workflows', 'unanswered questions', 'known gaps'];

const read = (target) => (fs.existsSync(target) ? fs.readFileSync(target, 'utf-8') : null);
const occurrences = (text, needle) => (text ? text.split(needle).length - 1 : 0);
const h2 = (md) => (md || '').split(/\r?\n/).filter((line) => line.startsWith('## ') && !line.startsWith('### '));
// Mirrors the slug rule in skills/builder/templates/build-html.mjs.
const slug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function verifyOutput(outDir) {
  const checks = [];
  const check = (name, ok, detail = '') => checks.push({ name, ok, detail, advisory: false });
  const advise = (name, ok, detail = '') => checks.push({ name, ok, detail, advisory: true });
  const at = (rel) => path.join(outDir, rel);

  const required = [
    'index.html',
    'Product-Knowledge-Base.md',
    'docs/markdown/documentation.md',
    'docs/final/final-documentation.md',
    '.insightify/plan.md'
  ];
  const missing = required.filter((rel) => !fs.existsSync(at(rel)));
  check('artifact wajib ada', missing.length === 0, missing.length ? `hilang: ${missing.join(', ')}` : `${required.length} file`);

  const kbDir = at('.insightify/knowledge');
  const kbFiles = fs.existsSync(kbDir) ? fs.readdirSync(kbDir).filter((name) => name.endsWith('.md')) : [];
  check('kategori knowledge terisi', kbFiles.length > 0, `${kbFiles.length} file`);

  const noFrontmatter = kbFiles.filter((name) => !(read(path.join(kbDir, name)) || '').startsWith('---'));
  check('knowledge punya YAML frontmatter', noFrontmatter.length === 0, noFrontmatter.join(', ') || 'semua oke');

  const noCitation = kbFiles.filter((name) => !(read(path.join(kbDir, name)) || '').includes(CITATION));
  check('knowledge menyimpan sitasi sumber', noCitation.length === 0, noCitation.join(', ') || 'semua oke');

  const html = read(at('index.html')) || '';
  const kb = read(at('Product-Knowledge-Base.md')) || '';
  const finalDoc = read(at('docs/final/final-documentation.md')) || '';
  const markdownDoc = read(at('docs/markdown/documentation.md')) || '';

  const clientFacing = {
    'Product-Knowledge-Base.md': kb,
    'docs/final/final-documentation.md': finalDoc,
    'docs/markdown/documentation.md': markdownDoc
  };
  const dirty = Object.keys(clientFacing).filter((name) => clientFacing[name].includes(CITATION));
  check('output klien bebas sitasi', dirty.length === 0, dirty.join(', ') || 'bersih');

  const yaml = Object.keys(clientFacing).filter((name) => clientFacing[name].startsWith('---'));
  check('output klien tanpa frontmatter YAML', yaml.length === 0, yaml.join(', ') || 'bersih');

  const docTopics = h2(finalDoc);
  const kbTopics = h2(kb).filter((line) => line.slice(3).trim().toLowerCase() !== 'table of contents');
  const expectedTitles = docTopics
    .map((line) => line.slice(3).trim())
    .filter((title) => !HTML_SKIP.includes(title.toLowerCase()));
  const anchors = html.match(/<section id="[^"]+"/g) || [];

  const tocIdx = kb.indexOf('## Table of Contents');
  const firstTopicIdx = kbTopics.length ? kb.indexOf(kbTopics[0]) : -1;
  check(
    'Table of Contents mendahului section pertama',
    tocIdx !== -1 && firstTopicIdx > tocIdx,
    `toc@${tocIdx} pertama@${firstTopicIdx}`
  );

  check(
    'parity jumlah section (dokumen = knowledge base)',
    docTopics.length > 0 && docTopics.length === kbTopics.length,
    `dokumen=${docTopics.length} kb=${kbTopics.length}`
  );

  const missingAnchors = expectedTitles
    .map((title) => `id="${slug(title)}"`)
    .filter((needle) => !html.includes(needle));
  check('setiap section punya anchor di HTML', missingAnchors.length === 0, missingAnchors.join(', ') || `${expectedTitles.length} anchor`);
  check(
    'jumlah anchor HTML sesuai dokumen',
    anchors.length === expectedTitles.length + 1,
    `html=${anchors.length} (overview + ${expectedTitles.length})`
  );

  const plan = read(at('.insightify/plan.md'));
  if (plan) {
    const declared = Number((plan.match(/^total_sections:\s*(\d+)/m) || [])[1]);
    check('plan total_sections = jumlah section dokumen', declared === docTopics.length, `plan=${declared} dokumen=${docTopics.length}`);
  } else {
    advise('plan total_sections = jumlah section dokumen', false, 'plan.md tidak ada');
  }

  check('satu blok <style> inline', occurrences(html, '<style>') === 1, `${occurrences(html, '<style>')} blok`);
  check('satu blok <script> inline', occurrences(html, '<script>') === 1, `${occurrences(html, '<script>')} blok`);
  check(
    'satu script eksternal (mermaid CDN)',
    occurrences(html, '<script src=') === 1 && html.includes('cdn.jsdelivr.net/npm/mermaid'),
    `${occurrences(html, '<script src=')} script eksternal`
  );
  check(
    'satu stylesheet (Google Fonts)',
    occurrences(html, 'rel="stylesheet"') === 1 && html.includes('fonts.googleapis.com/css2'),
    `${occurrences(html, 'rel="stylesheet"')} stylesheet`
  );
  check('tanpa class blueprint yang sudah dihapus', !html.includes('class="bp-'));
  check('tanpa section "Documentation Pipeline"', !html.includes('Documentation Pipeline'));
  check('navigasi + diagram aktif', html.includes('id="overview"') && html.includes('mermaid.initialize'));
  check('design token dirender', html.includes('--color-primary'));

  const manifest = fs.existsSync(at('.insightify/sources/manifest.md'));
  advise('manifest sumber ada', manifest, manifest ? '' : '.insightify/sources/manifest.md tidak ada');

  const docLines = finalDoc.split(/\r?\n/).length;
  advise('dokumen padat (>= 300 baris)', docLines >= 300, `${docLines} baris`);

  const failures = checks.filter((item) => !item.ok && !item.advisory);
  return { checks, passed: failures.length === 0, failures };
}

function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node scripts/verify-output.mjs <OUT_DIR>');
    process.exit(2);
  }
  if (!fs.existsSync(target)) {
    console.error(`[ERROR] OUT_DIR tidak ditemukan: ${target}`);
    process.exit(2);
  }

  const { checks, passed, failures } = verifyOutput(target);
  const blocking = checks.filter((item) => !item.advisory);

  console.log(`\nVerifikasi output Insightify: ${target}`);
  for (const item of checks) {
    const mark = item.ok ? '\u2714' : item.advisory ? '!' : '\u2716';
    console.log(`  ${mark} ${item.name}${item.detail ? `  (${item.detail})` : ''}`);
  }
  console.log(`\n  ${blocking.filter((item) => item.ok).length}/${blocking.length} check wajib lulus`);
  console.log(passed ? '  VERIFY_OK\n' : `  VERIFY_FAILED (${failures.length} check gagal)\n`);
  process.exit(passed ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
