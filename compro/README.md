# Compro Plugin v2.8.0 — Multi-Agent Slide Deck Pipeline

Plugin otomatisasi pembuatan Company Profile interaktif dengan sistem desain **Aperture Cinematic Minimalist (Figma 1:1)**, standalone zero-dependency presentation engine (HTML5/CSS3/Vanilla JS), hybrid Unsplash direct CDN asset pipeline, dan deployment Vercel.

---

## What's New in v2.8.0 — Aperture Cinematic Minimalist

Rilis v2.8.0 menggantikan seluruh tema legacy Canva Editorial dan runtime Reveal.js dengan sistem presentasi sinematik modern **Aperture Cinematic Minimalist**:

- **Aperture Cinematic Minimalist Design System**: Perombakan visual menyeluruh beresolusi 1920×1080 (native 16:9), palet warna kontras tinggi (`--background: #ffffff`, `--foreground: #0a0a0a`, `--muted-foreground: #6b6b6b`, `--accent: #ff3b1d`, `--border: #e4e4e4`, `--ghost: #f1f1f1`, `--hover-bg: #fafafa`), tipografi editorial berbobot tinggi (*Archivo* untuk headline, *Inter* untuk body, *JetBrains Mono* untuk monospaced category kickers).
- **7 Core Slide Archetypes**:
  - `cover`: Full-Bleed Cinematic Hero dengan foto gelap berskala sinematik, gradient overlay ganda, live status dot (`● Now shipping`), category kicker vermilion, headline raksasa bottom-anchored, dan glass stat strip untuk 2–3 statistik kunci slide pembuka.
  - `problem`: 12-Column Asymmetric Split (4-col image kiri + 8-col text kanan), decorative ghost watermark text ("NO" di `#f1f1f1`), dan 3-item numbered list dengan angka vermilion dan highlight hover.
  - `product`: 50/50 Macro & Spec Matrix seimbang dengan floating glass badge pada foto makro produk dan 2x2 stat counter block berdefinisi tinggi.
  - `features`: Rail Image vertikal 3-kolom dengan caption teknis rotasi 90° (`writing-mode: vertical-rl`) di kiri, dan 4 baris fitur bernomor raksasa `01`–`04` di kanan yang interaktif hover.
  - `usp`: Frosted Glass Trio di atas dark viewfinder canvas dengan 3 kartu semi-transparan (`backdrop-filter: blur(12px)`), hairline white border, kicker, counter `01`–`03`, giant stat, dan teks penjelasan.
  - `pricing`: Vertical Image Rail ("Siap mulai.") di kiri dan 3 pricing tiers di kanan; featured tier mengusung inverted black background (`#0a0a0a`), teks putih, dan tombol CTA solid vermilion.
  - `closing`: Rail Image ("Langkah berikutnya") di kiri dan Contact Matrix di kanan — headline, daftar `.closing-notes` (komitmen/benefit), grid 2 kolom `.closing-contacts` (ikon + label mono + nilai), dan CTA vermilion. Placeholder kontak reviewer dirender sebagai `Belum tersedia`, tidak pernah dikarang.
- **Standalone Zero-Dependency Presentation Engine**: Menghilangkan dependensi CDN Reveal.js secara tuntas. Slide deck ditenagai runtime Vanilla HTML5/CSS3/JS yang ter-inline langsung, dilengkapi hairline progress bar 3px di bagian atas panggung, dot navigation interaktif di footer, dynamic counter (`01 / 06`), dan keyboard navigation lengkap (`ArrowLeft`, `ArrowRight`, `Space`, `PageDown`, `PageUp`, `Home`, `End`).
- **Cinematic Asset Pipeline Slots**: Cascading fallback berjenjang — **Openverse web image search** (keyless) ➔ **kurated Unsplash direct CDN** ➔ **Lorem Picsum** ➔ **local architectural SVG** — dalam satu budget waktu kompilasi bersama (default 25 s). Slot default per arketipe (`cover→hero`, `problem→problem`, `product→macro`, `features→hands`, `usp→viewfinder`, `pricing→lens`, `closing→closing`) selalu bisa ditimpa oleh directive gambar di draf.
- **Unified Archetype Classifier**: Eliminasi divergensi classifier ganda (`classifyCanvaArchetype` dipertahankan hanya sebagai alias deprecated; `classifyCinematicArchetype` menjadi single source of truth untuk classifier di asset pipeline, build log, dan slide renderer).
- **Deterministic Density Pipeline**: Splitter deterministik memecah konten padat menjadi slide Part 1/2/3 (4/4/3 bullet budget atau prose split) tanpa pemotongan fakta.
- **Zero-Hallucination Contact Handling**: Placeholder kontak reviewer (`[Nomor WhatsApp]`, `[Email Resmi]`, `[Alamat Kantor]`, …) tidak pernah bocor mentah ke deck dan tidak pernah diganti dengan nomor/email karangan — nilainya menjadi penanda eksplisit `Belum tersedia` dan dicatat di `reports/build.log`.
- **Comprehensive Verification Suite**: Rangkaian tes komprehensif mencakup classifier parity + anti-drift manifest (`test-cinematic-classifier.js`), figma DOM parity rendering (`test-modern-render.js`), dan golden DOM assertions (`test-modern-golden.js`).

### Kontrak Perilaku (dijaga otomatis oleh test suite)

1. **7 arketipe = satu SSOT.** `CINEMATIC_ARCHETYPES` / `CINEMATIC_SLOT_MAP` di `themes/modern.js`, `archetypes`/`slots` di `manifest.json`, dan dokumentasi harus identik — `test-cinematic-classifier.js` gagal kalau salah satu menyimpang. Setiap nilai slot wajib resolve di `imageFetcher.SLOT_MAP` beserta file fallback SVG-nya.
2. **Slide kontak tidak lagi salah arketipe.** Judul seperti "Hubungi Kami"/"Terima Kasih" memetakan ke `closing`, bukan `pricing` → `features`.
3. **Metrik tidak boleh salah baca.** Token bold adalah metrik hanya bila seluruh tokennya berbentuk figur (`1×`, `5–20`, `~90%`, `20:1`, `3-tier`, `0.4s`). `**20:1** — rasio LTV:CAC, di atas ambang sehat 3:1.` dirender sebagai `20:1`, bukan `3:1`.
4. **Tidak ada grid bolong.** Slide `product` tanpa angka metrik merender `.stat-cell.no-metric` dan menulis `console.warn`; tidak ada `<div class="stat-metric"></div>` kosong di HTML akhir.
5. **Statistik hero tidak hilang.** 2–3 bullet statistik pada Slide 1 dirender sebagai `.cover-stats`, bukan dibuang.
6. **Chrome berbahasa Indonesia.** Deck `lang="id"`; default renderer (`Produk`, `Fitur utama`, `Mengapa kami`, `Pilih paket`, `Siap mulai.`, `Hubungi kami`, `Langkah berikutnya`, …) bukan string Inggris.
7. **CSS valid.** `@import` font di-hoist ke atas blok `<style>` sebelum override `:root { --brand-primary }`, karena rule apa pun sebelum `@import` membuat import dibuang browser.
8. **Build log jujur.** Jumlah kata per slide dihitung tanpa marker markdown/directive gambar, plus baris `Brand Name Src`, `Brand Color Src`, dan `Contact Placeholders` sehingga fallback senyap tidak mungkin lagi.
9. **Deploy lintas platform.** `skills/publisher/scripts/deploy.js` memilih `cmd.exe` hanya di Windows (`process.platform === 'win32'`), dan menjalankan `vercel` langsung di POSIX.

---

## What's New in v2.7.0

- **Phase 0.5 Competitive Selling Point Research**: Writer melakukan research produk serupa di internet (`search_web` + `read_url_content`), menyusun tabel perbandingan internal, dan mengekstrak 5-8 selling points tervalidasi pasar. Hasil disimpan di `compros/<slug>/reports/selling-points-research.md` untuk user review sebelum drafting dimulai. Nama kompetitor TIDAK PERNAH muncul di slide output (Zero Competitor Leak).
- **Reviewer Selling Point Verification**: Checklist audit baru memverifikasi traceability selling points ke research report dan memindai competitor leak di narasi draf.
- **Embedded Design Skills (`ui-ux-pro-max` & `impeccable`)**: Kedua skill desain di-bundle langsung di dalam builder (`skills/builder/skills/`), menjadikan plugin fully self-contained dan portabel tanpa dependensi skill global.

---

## Tema Slide Deck

Builder (`/builder`) hanya memiliki satu template — `modern` yang mengimplementasikan sistem desain **Aperture Cinematic Minimalist**. Tidak ada opsi `--theme` dan tidak ada pemilihan tema di flow mana pun:

```bash
node skills/builder/scripts/build-deck.js --name=<slug>   # satu-satunya cara build
```

Contoh kompilasi:
```bash
node skills/builder/scripts/build-deck.js --name=venturo-pro
```

Output diproduksi di `compros/<slug>/` (`index.html`, `compro.md`, `assets/`, `reports/build.log`, `drafts/`).

---

## Test Suite & Verification Commands

Plugin dilengkapi rangkaian script pengujian otomatis untuk memverifikasi seluruh komponen pipeline:

```bash
# 1. Jalankan seluruh test suite Layer 3 (end-to-end verification)
npm test                    # = node scripts/test-all.js (offline-safe)

# 2. Uji parity classifier 7 arketipe cinematic, slot mapping, & anti-drift manifest
node scripts/test-cinematic-classifier.js

# 3. Uji DOM parity rendering untuk 7 arketipe & dispatcher
node scripts/test-modern-render.js

# 4. Uji golden DOM assertions, kontrak kontak, asset pipeline, & template shell
node scripts/test-modern-golden.js
```

`scripts/test-all.js` menjalankan **seluruh 16 script** dengan `COMPRO_OFFLINE=1` supaya suite tetap hermetik dan tidak membakar rate limit Openverse.

---

## Alur Kerja Layer 3 (Pipeline)

1. **Gate -1 - User Intent & Input Confirmation**: Hard gate sebelum membaca file apapun; menanyakan kesiapan 3 dokumen input dan menunggu konfirmasi eksplisit dari pengguna.
2. **Gate 0 - Intake Check & Slug Resolution**: Mengecek kelengkapan dokumen input dasar (`input/business-knowledge-base.md`, `business-audit-report.md`, `brand-story-guide.md`), menentukan identifier unik `<slug>` proyek, dan memeriksa potensi *Pipeline Resumability*.
3. **Phase 1 - Drafting (Dynamic Slides)** (`/writer`): Menghasilkan draf narasi per-slide dalam format Markdown (`compros/<slug>/drafts/01-draft.md`) dengan batas overlap repetisi ≤ 40% dan jumlah slide dinamis mengikuti konten.
4. **Phase 2 - Content QA (Dedup & Contact Check)** (`/reviewer`): Memverifikasi akurasi fakta bisnis, validasi kontak faktual (Zero Hallucination), deduplikasi konten antar-slide, brand voice, dan merumuskan draf On-Page SEO (Meta Title/Description). Iterasi revisi berjalan hingga status `APPROVED` (`compros/<slug>/drafts/02-final.md`).
5. **Phase 3 - Slide Deck Build (Aperture Cinematic & Standalone Engine)** (`/builder`): Membangun file presentasi statis *single-file HTML* dengan CSS ter-inline, gambar per-slide dari pipeline bertier (Openverse ➔ Unsplash ➔ Picsum ➔ SVG), 7 arketipe layout sinematik, dan zero-dependency standalone JS presentation engine (`compros/<slug>/index.html`).
6. **Phase 3b - Visual Self-Check** (`/builder` / orchestrator): Memverifikasi integritas visual di browser untuk memastikan tidak ada gambar/SVG rusak, teks overflow, atau layout clipping. Memeriksa fungsi progress bar, dot navigation, dan keyboard controls. Hasil dicatat di `build.log` dan bersifat blocking sebelum lanjut ke Phase 4.
7. **Phase 4 - Pre-flight SEO & Auto-Fix** (`/publisher`): Audit technical SEO (Title, Description, Open Graph, Schema.org JSON-LD, Alt Image) dan melakukan auto-patching otomatis pada file HTML (`compros/<slug>/reports/seo-report.md`).
8. **Gate 5 - User Confirmation Gate**: Berhenti dan menampilkan pratinjau lokal serta hasil audit SEO untuk meminta persetujuan rilis publik dari pengguna.
9. **Phase 6 - Deployment** (`/publisher`): Menayangkan slide ke URL publik via Vercel CLI (preview/production deployment) dan memverifikasi keterjangkauan live via HTTP GET 200 (`compros/<slug>/reports/deployment-status.md`).

---

## Struktur Repositori

```text
├── .claude-plugin/
│   └── plugin.json                     # Manifest plugin Claude Code
├── .codex-plugin/
│   └── plugin.json                     # Manifest registrasi skill Codex
├── package.json                        # Entry point `npm test` / `npm run build`
├── plugin.json                         # Manifest plugin root
├── skills/
│   ├── compro/SKILL.md                 # Orchestrator State-Machine (Gate -1 s/d Phase 6)
│   ├── writer/SKILL.md                 # Skill 8: Copywriting, Research & Slide Drafting
│   ├── reviewer/SKILL.md               # Skill 9: QA, Dedup, Selling Point Verify & Content SEO
│   ├── builder/                        # Skill 10: Aperture Cinematic Presentation Assembler
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   │   ├── build-deck.js           # Builder engine (parsing, chunking, shell injection, build.log)
│   │   │   ├── themes/modern.js        # 7 arketipe renderers + classifier SSOT
│   │   │   ├── image-fetcher.js        # Slot map + tiered image acquisition
│   │   │   └── asset-generator.js      # Procedural SVG assets
│   │   ├── templates/
│   │   │   ├── modern/                 # Template shell HTML, theme CSS, manifest, & README
│   │   │   └── assets/                 # Shared SVG vector fallbacks
│   │   ├── references/
│   │   │   ├── design-tokens.md        # Aperture Cinematic tokens & color palette
│   │   │   └── visual-hierarchy.md     # Layout archetypes & composition
│   │   └── skills/                     # Embedded design intelligence
│   │       ├── ui-ux-pro-max/          # 79 styles, 192 palettes, 74 fonts, Python CLI
│   │       └── impeccable/             # Craft quality: critique, audit, polish, 35 refs
│   └── publisher/                      # Skill 11: SEO Auto-Fix & Vercel Deployer
│       ├── SKILL.md
│       └── scripts/
│           └── deploy.js
├── assets/                             # Aset global, referensi Figma presentation, & data referensi compro/
│   └── compro/                         # Runtime reference data (scraped RT Online); binari berat di-gitignore
├── scripts/                            # Verifikasi & test suite runner
│   ├── test-all.js                     # Test runner seluruh suite (16 script)
│   ├── test-cinematic-classifier.js    # Test classifier 7 arketipe + slot + anti-drift manifest
│   ├── test-modern-render.js           # Test render figma DOM parity
│   └── test-modern-golden.js           # Golden DOM assertions, kontrak kontak, & asset assertions
├── test-fixtures/                      # Fixture pengujian & verifikasi
│   ├── 01-company-profile.md           # Dokumen input contoh realistis
│   └── expected/                       # Golden expected output
│       ├── 01-draft.md
│       ├── 01-draft.modern.md
│       ├── 02-final.md
│       ├── 02-final.modern.md          # Fixture utama untuk golden build/rendering
│       └── review-report.md
└── docs/superpowers/                   # Spesifikasi desain & rencana implementasi
```

### Artefak yang Dihasilkan saat Run-Time (Tidak Di-commit)

Seluruh artefak kerja proyek dikonsolidasikan di dalam direktori `compros/<slug>/` dan **dikecualikan dari git** melalui `.gitignore` — ini adalah data kerja privat per-pengguna, bukan bagian dari source code:

| Jalur Direktori / File | Keterangan & Isi | Diproduksi oleh |
|------------------------|------------------|-----------------|
| `input/` | Dokumen intake mentah pengguna | Pre-run / User |
| `compros/<slug>/input/` | Salinan/symlink dokumen input kerja | Gate 0 |
| `compros/<slug>/reports/selling-points-research.md` | Laporan research kompetitif internal (tabel perbandingan & selling points) | Phase 0.5 (Research) |
| `compros/<slug>/drafts/` | Draf narasi slide (`01-draft.md`, `02-final.md`) | Phase 1 & Phase 2 |
| `compros/<slug>/index.html` | File presentasi utama *single-file HTML* (Aperture Cinematic) | Phase 3 (Build) & Phase 4 (Patch) |
| `compros/<slug>/compro.md` | Draf slide presentasi format Markdown | Phase 3 |
| `compros/<slug>/assets/` | Foto slot Unsplash & SVG visual proyek | Phase 3 |
| `compros/<slug>/reports/` | Laporan evaluasi (`review-report.md`, `build.log`, `seo-report.md`, `deployment-status.md`) | Phase 2, 3b, 4, 6 |

State lokal lain yang juga di-ignore: `.vercel/` (kredensial & cache Vercel CLI), `.superpowers/` (workspace koordinasi Subagent-Driven Development), dan `node_modules/`.
