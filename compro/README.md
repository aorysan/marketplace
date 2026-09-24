# Compro Plugin v2.8.0 — Multi-Agent Slide Deck Pipeline

Plugin otomatisasi pembuatan Company Profile interaktif dengan sistem desain **Aperture Cinematic Minimalist (Figma 1:1)**, standalone zero-dependency presentation engine (HTML5/CSS3/Vanilla JS), hybrid Unsplash direct CDN asset pipeline, dan deployment Vercel.

---

## What's New in v2.8.0 — Aperture Cinematic Minimalist

Rilis v2.8.0 menggantikan seluruh tema legacy Canva Editorial dan runtime Reveal.js dengan sistem presentasi sinematik modern **Aperture Cinematic Minimalist**:

- **Aperture Cinematic Minimalist Design System**: Perombakan visual menyeluruh beresolusi 1920×1080 (native 16:9), palet warna kontras tinggi (`--background: #ffffff`, `--foreground: #0a0a0a`, `--muted-foreground: #6b6b6b`, `--accent: #ff3b1d`, `--border: #e4e4e4`, `--ghost: #f1f1f1`, `--hover-bg: #fafafa`), tipografi editorial berbobot tinggi (*Archivo* untuk headline, *Inter* untuk body, *JetBrains Mono* untuk monospaced category kickers).
- **6 Core Slide Archetypes**:
  - `cover`: Full-Bleed Cinematic Hero dengan foto gelap berskala sinematik, gradient overlay ganda, live status dot (`● Now shipping`), category kicker vermilion, dan headline raksasa bottom-anchored.
  - `problem`: 12-Column Asymmetric Split (4-col image kiri + 8-col text kanan), decorative ghost watermark text ("NO" di `#f1f1f1`), dan 3-item numbered list dengan angka vermilion dan highlight hover.
  - `product`: 50/50 Macro & Spec Matrix seimbang dengan floating glass badge pada foto makro produk dan 2x2 stat counter block berdefinisi tinggi.
  - `features`: Rail Image vertikal 3-kolom dengan caption teknis rotasi 90° (`writing-mode: vertical-rl`) di kiri, dan 4 baris fitur bernomor raksasa `01`–`04` di kanan yang interaktif hover.
  - `usp`: Frosted Glass Trio di atas dark viewfinder canvas dengan 3 kartu semi-transparan (`backdrop-filter: blur(12px)`), hairline white border, kicker, counter `01`–`03`, giant stat, dan teks penjelasan.
  - `pricing`: Vertical Image Rail ("Ship it.") di kiri dan 3 pricing tiers di kanan; featured tier mengusung inverted black background (`#0a0a0a`), teks putih, dan tombol CTA solid vermilion.
- **Standalone Zero-Dependency Presentation Engine**: Menghilangkan dependensi CDN Reveal.js secara tuntas. Slide deck ditenagai runtime Vanilla HTML5/CSS3/JS yang ter-inline langsung, dilengkapi hairline progress bar 3px di bagian atas panggung, dot navigation interaktif di footer, dynamic counter (`01 / 06`), dan keyboard navigation lengkap (`ArrowLeft`, `ArrowRight`, `Space`, `PageDown`, `PageUp`, `Home`, `End`).
- **Cinematic Asset Pipeline Slots**: Pemetaan deterministik 6 slot visual Unsplash resolusi tinggi (`hero`, `problem`, `macro`, `hands`, `viewfinder`, `lens`) dengan cascading fallback (Direct Unsplash CDN ➔ Lorem Picsum ➔ Local architectural SVG) dalam budget waktu kompilasi ketat.
- **Unified Archetype Classifier**: Eliminasi divergensi classifier ganda (`classifyCanvaArchetype` dipertahankan hanya sebagai alias deprecated; `classifyCinematicArchetype` menjadi single source of truth untuk classifier di asset pipeline, build log, dan slide renderer).
- **Deterministic Density Pipeline**: Splitter deterministik memecah konten padat menjadi slide Part 1/2/3 (4/4/3 bullet budget atau prose split) tanpa pemotongan fakta.
- **Comprehensive Verification Suite**: Rangkaian tes komprehensif mencakup classifier parity (`test-cinematic-classifier.js`), figma DOM parity rendering (`test-modern-render.js`), dan golden DOM assertions (`test-modern-golden.js`).

---

## What's New in v2.7.0

- **Phase 0.5 Competitive Selling Point Research**: Writer melakukan research produk serupa di internet (`search_web` + `read_url_content`), menyusun tabel perbandingan internal, dan mengekstrak 5-8 selling points tervalidasi pasar. Hasil disimpan di `compros/<slug>/reports/selling-points-research.md` untuk user review sebelum drafting dimulai. Nama kompetitor TIDAK PERNAH muncul di slide output (Zero Competitor Leak).
- **Reviewer Selling Point Verification**: Checklist audit baru memverifikasi traceability selling points ke research report dan memindai competitor leak di narasi draf.
- **Embedded Design Skills (`ui-ux-pro-max` & `impeccable`)**: Kedua skill desain di-bundle langsung di dalam builder (`skills/builder/skills/`), menjadikan plugin fully self-contained dan portabel tanpa dependensi skill global.

---

## Tema Slide Deck

Builder (`/builder`) hanya memiliki satu template — `modern` yang mengimplementasikan sistem desain **Aperture Cinematic Minimalist**. Tidak ada opsi `--theme` dan tidak ada pemilihan tema di flow mana pun:

```bash
node scripts/build-deck.js --name=<slug>   # satu-satunya cara build
```

Contoh kompilasi:
```bash
node scripts/build-deck.js --name=venturo-pro
```

Output diproduksi di `compros/<slug>/` (`index.html`, `compro.md`, `assets/`, `reports/build.log`, `drafts/`).

---

## Test Suite & Verification Commands

Plugin dilengkapi rangkaian script pengujian otomatis untuk memverifikasi seluruh komponen pipeline:

```bash
# 1. Uji parity classifier 6 arketipe cinematic & slot mapping
node scripts/test-cinematic-classifier.js

# 2. Uji figma DOM parity rendering untuk 6 arketipe & dispatcher
node scripts/test-modern-render.js

# 3. Uji golden DOM assertions, asset pipeline, & template shell
node scripts/test-modern-golden.js

# 4. Jalankan seluruh test suite Layer 3 (end-to-end verification)
node scripts/test-all.js
```

---

## Alur Kerja Layer 3 (Pipeline)

1. **Gate -1 - User Intent & Input Confirmation**: Hard gate sebelum membaca file apapun; menanyakan kesiapan 3 dokumen input dan menunggu konfirmasi eksplisit dari pengguna.
2. **Gate 0 - Intake Check & Slug Resolution**: Mengecek kelengkapan dokumen input dasar (`input/business-knowledge-base.md`, `business-audit-report.md`, `brand-story-guide.md`), menentukan identifier unik `<slug>` proyek, dan memeriksa potensi *Pipeline Resumability*.
3. **Phase 1 - Drafting (Dynamic Slides)** (`/writer`): Menghasilkan draf narasi per-slide dalam format Markdown (`compros/<slug>/drafts/01-draft.md`) dengan batas overlap repetisi ≤ 40% dan jumlah slide dinamis mengikuti konten.
4. **Phase 2 - Content QA (Dedup & Contact Check)** (`/reviewer`): Memverifikasi akurasi fakta bisnis, validasi kontak faktual (Zero Hallucination), deduplikasi konten antar-slide, brand voice, dan merumuskan draf On-Page SEO (Meta Title/Description). Iterasi revisi berjalan hingga status `APPROVED` (`compros/<slug>/drafts/02-final.md`).
5. **Phase 3 - Slide Deck Build (Aperture Cinematic & Standalone Engine)** (`/builder`): Membangun file presentasi statis *single-file HTML* dengan CSS ter-inline, 6 slot gambar Unsplash resolusi tinggi, 6 arketipe layout sinematik, dan zero-dependency standalone JS presentation engine (`compros/<slug>/index.html`).
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
├── plugin.json                         # Manifest plugin root
├── skills/
│   ├── compro/SKILL.md                 # Orchestrator State-Machine (Gate -1 s/d Phase 6)
│   ├── writer/SKILL.md                 # Skill 8: Copywriting, Research & Slide Drafting
│   ├── reviewer/SKILL.md               # Skill 9: QA, Dedup, Selling Point Verify & Content SEO
│   ├── builder/                        # Skill 10: Aperture Cinematic Presentation Assembler
│   │   ├── SKILL.md
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
├── assets/                             # Aset global & referensi Figma presentation
├── scripts/                            # Verifikasi & test suite runner
│   ├── test-all.js                     # Test runner seluruh suite
│   ├── test-cinematic-classifier.js    # Test classifier 6 arketipe & slot mapping
│   ├── test-modern-render.js           # Test render figma DOM parity
│   └── test-modern-golden.js           # Golden DOM assertions & asset assertions
├── test-fixtures/                      # Fixture pengujian & verifikasi
│   ├── input/                          # Dokumen input contoh realistis (~2-5KB)
│   │   ├── business-knowledge-base.md
│   │   ├── business-audit-report.md
│   │   └── brand-story-guide.md
│   └── expected/                       # Golden expected output
│       ├── 01-draft.md
│       ├── 02-final.md
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
