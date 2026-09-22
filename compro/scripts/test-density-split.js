const { splitDenseSlides } = require('../skills/builder/scripts/build-deck');
const mk = (n) => ({ title: 'Warga dan Iuran', content: Array.from({length: n}, (_, i) => `- **Fitur ${i+1}** — desc singkat delapan kata pas`).join('\n') });
const SPEC_DIRECTIVE = '<!-- image: services -- query: Modern community service photo ; keywords: community, service, modern ; style: photo -->';
const mkWithImage = (n) => ({ title: 'Galeri dan Iuran', content: `${SPEC_DIRECTIVE}\n` + Array.from({length: n}, (_, i) => `- **Item ${i+1}** — deskripsi singkat`).join('\n') });

function assert(cond, msg) { if (!cond) { console.error('FAIL: ' + msg); process.exit(1); } }

// 11 bullets -> 3 slides (4/4/3) + Part titles
let out = splitDenseSlides([mk(11)]);
assert(out.length === 3, `11 bullets -> ${out.length} slides, expected 3`);
assert(out[1].title.includes('Part 2'), 'continuation title missing Part 2');
assert(out[2].title === 'Lanjutan: Warga dan Iuran (Part 3)', `Part 3 title wrong: ${out[2].title}`);

// 4 bullets must not split
out = splitDenseSlides([mk(4)]);
assert(out.length === 1, '4 bullets must not split');

// 6 bullets -> 2 (card-safe conservative split; reviewer allows 6 plain, builder splits at 5+ for §4 cap)
out = splitDenseSlides([mk(6)]);
assert(out.length === 2, `6 bullets -> ${out.length} slides, expected 2`);
assert(out[1].title.includes('Part 2'), '6-bullet split missing Part 2 title');

// single directive per chunk + spec format preserved
out = splitDenseSlides([mkWithImage(6)]);
assert(out.length === 2, `6-bullet with image -> ${out.length} slides, expected 2`);
for (const chunk of out) {
  const imgMatches = chunk.content.match(/<!-- image:/g) || [];
  assert(imgMatches.length === 1, `chunk has ${imgMatches.length} image directives, expected 1`);
  assert(chunk.content.includes('query:'), 'spec directive format (query:) lost in chunk');
}

// prose-only 70 words -> force-split into 2 (spec §6 never pass over-budget through)
const prose70 = Array.from({length: 70}, (_, i) => `kata${i+1}`).join(' ') + '. Kalimat kedua penutup singkat.';
out = splitDenseSlides([{ title: 'Narasi Panjang', content: prose70 }]);
assert(out.length >= 2, `70-word prose -> ${out.length} slides, expected >=2`);
assert(out[1].title.includes('Part 2'), 'prose split missing Part 2 title');
for (const chunk of out) {
  const w = chunk.content.replace(/<!--[\s\S]*?-->/g, '').split(/\s+/).filter(Boolean).length;
  assert(w <= 60, `prose chunk has ${w} words, expected <=60`);
}

// [DENSE] warn trigger: <=4 long bullets but >60 words must log [DENSE]
const longBullets = { title: 'Padat Kata', content: Array.from({length: 4}, (_, i) => `- **Poin ${i+1}** — ` + Array.from({length: 20}, (_, j) => `kata${j}`).join(' ')).join('\n') };
let logged = '';
const origLog = console.log;
console.log = (m) => { logged += String(m) + '\n'; };
splitDenseSlides([longBullets]);
console.log = origLog;
assert(logged.includes('[DENSE]'), '[DENSE] warn not emitted for 4 long bullets over 60 words');

// intro not duplicated to Part 2
const withIntro = { title: 'Intro Test', content: 'Paragraf intro singkat.\n' + Array.from({length: 8}, (_, i) => `- **F${i+1}** — desc`).join('\n') };
out = splitDenseSlides([withIntro]);
assert(out.length === 2, 'intro 8-bullet split expected 2');
assert(out[0].content.includes('Paragraf intro'), 'Part 1 must keep intro');
assert(!out[1].content.includes('Paragraf intro'), 'Part 2 must not repeat intro');

// multi-directive input collapses to 1 per chunk with warning
const multi = { title: 'Multi Dir', content: '<!-- image: a -->\n<!-- image: b -->\n' + Array.from({length: 5}, (_, i) => `- **F${i+1}** — desc`).join('\n') };
logged = '';
console.log = (m) => { logged += String(m) + '\n'; };
out = splitDenseSlides([multi]);
console.log = origLog;
for (const chunk of out) {
  const n = (chunk.content.match(/<!-- image:/g) || []).length;
  if (n === 0) {
    const n2 = (chunk.content.match(/<!--/g) || []).length;
    assert(n2 <= 1, 'chunk has more than 1 directive');
  } else assert(n === 1, 'multi-directive chunk must keep exactly 1');
}

console.log('PASS: density splitter 4/4/3 + Part titles, 6-bullet split, single directive per chunk, prose split, [DENSE] trigger, intro-on-Part1-only');
process.exit(0);
