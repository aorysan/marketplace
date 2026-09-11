# Compro Plugin v2.4.0 — Multi-Agent Slide Deck Pipeline

Plugin otomatisasi pembuatan Company Profile interaktif berbasis Reveal.js dengan sistem desain **Canva Editorial Theme (Gray-White Modern)** dan deployment Vercel.

## What's New in v2.4.0

Rilis v2.4.0 menghadirkan pembaruan versi plugin, penyesuaian arsitektur manifest, dan sinkronisasi cache:

- **Manifest v2.4.0**: Validasi manifest diperbarui untuk memastikan kompatibilitas seluruh 5 Layer 3 skills pada versi 2.4.0.
- **Canva Editorial Theme (Gray-White Modern System)**: Sistem desain slide `editorial` dengan kanvas abu-abu lembut `#F4F5F7`, kartu putih `#FFFFFF`, charcoal `#232220`, dan aksen Venturo Teal `#009BAD`.
- **Layout Archetypes Dinamis & Procedural Slots**: Pemetaan konten Markdown ke arketipe layout dinamis dengan SVG visual slots terintegrasi tanpa hardcode jumlah slide.
- **Cache Synchronization Protocol**: Penyelarasan cache global `~/.claude/plugins/cache/` ke versi 2.4.0.

## What's New in v2.3.0

Rilis v2.3.0 menghadirkan sistem desain editorial baru dan peningkatan pipeline build:

- **Canva Editorial Theme (Gray-White Modern System)**: Sistem desain slide baru `editorial` dengan kanvas abu-abu lembut `#F4F5F7`, kartu putih `#FFFFFF`, charcoal `#232220`, dan aksen Venturo Teal `#009BAD`.
- **10 Layout Archetypes Dinamis**: Classifier otomatis memetakan konten Markdown ke 10 arketipe layout (`hero-cover`, `narrative-split`, `mission-pillars`, `workflow-3col`, `features-staggered`, `persona-cards`, `services-grid`, `portfolio-gallery`, `metrics-contact`, `closing-cta`) tanpa hardcode jumlah slide.
- **Dynamic Markdown Chunking**: Jumlah slide diturunkan dari konten intake; tidak ada slide dummy/forced.
- **Theme Selector CLI**: `node scripts/build-deck.js --name=<slug> --theme=editorial` (editorial adalah default).
- **Asset Pipeline Integration**: Font Plus Jakarta Sans & Inter, phone-frame mockup 9:16, dan warna brand Venturo terintegrasi.
- **Manifest v2.3.0**: Validasi manifest diperbarui untuk memastikan kompatibilitas seluruh 5 Layer 3 skills.

## Tema Slide Deck

Builder (`/builder`) mendukung dua tema build yang dapat dipilih melalui `--theme`:

- **`editorial`** (default, v2.4.0) — Sistem desain *Canva Editorial* gray-white modern: kanvas `#F4F5F7`, kartu `#FFFFFF`, charcoal `#232220`, aksen Venturo Teal `#009BAD`. Konten Markdown dipetakan otomatis ke 10 arketipe layout dinamis (`hero-cover`, `narrative-split`, `mission-pillars`, `workflow-3col`, `features-staggered`, `persona-cards`, `services-grid`, `portfolio-gallery`, `metrics-contact`, `closing-cta`) dan jumlah slide diturunkan langsung dari konten intake.
- **`profile`** (legacy) — Tema profil bawaan v2.2 dengan template dan CSS klasik.

```bash
node scripts/build-deck.js --name=<slug> --theme=editorial   # tema default
node scripts/build-deck.js --name=<slug> --theme=profile      # tema legacy
```

Tanpa opsi `--theme`, builder memakai `editorial` sebagai default.

## What's New in v2.2.0

Rilis v2.2.0 menghadirkan peningkatan signifikan pada stabilitas arsitektur, kualitas konten, fidelitas visual, dan developer experience:

- **Gate -1 User Intent Hard Gate**: Perlindungan terhadap eksekusi tak diinginkan. Agen wajib mengonfirmasi ketersediaan dokumen input kepada pengguna sebelum membaca file lokal apapun di filesystem.
- **Inline SVG Enforcement (Zero Broken Images)**: Semua ikon dan aset visual di-embed langsung sebagai inline `<svg>` di dalam file HTML Reveal.js, mengeliminasi risiko broken image atau 404 styling.
- **Phase 3b Visual Self-Check**: Verifikasi visual otomatis pasca-build untuk mendeteksi missing icon, text overflow, atau deviasi layout secara blocking sebelum masuk tahap SEO.
- **No Verbatim Repetition Rule (≤ 40% Overlap)**: Copywriter menerapkan pembatasan overlap teks antar-slide maksimal 40% untuk mencegah repetisi narasi dan memastikan setiap slide memiliki pesan unik.
- **Contact Factual Check & Zero Hallucination**: Reviewer memvalidasi keaslian data kontak (WhatsApp, email, domain, alamat) 100% akurat dari knowledge base tanpa data dummy.
- **Extended Slide Structure (7–10 Slides)**: Mendukung struktur slide adaptif dari 7 hingga 10 slide, termasuk penambahan slide opsional *Differentiator* (tabel perbandingan kompetitif) dan *Social Proof* (testimoni/klien).
- **Dynamic Brand Color Extraction**: Builder mengekstrak palet warna primer, sekunder, dan aksen langsung dari `brand-story-guide.md` dan menerapkannya secara dinamis pada CSS variables presentasi.
- **Slug Resolution Protocol & Pipeline Resumability**: Standarisasi penamaan proyek berbasis slug unik serta kemampuan mendeteksi artefak parsial untuk melanjutkan pipeline tanpa memulai ulang dari awal.
- **Enhanced Test Fixtures & Golden Expected Outputs**: Test fixtures realistis (~2–5KB per dokumen input) dan direktori `test-fixtures/expected/` (`01-draft.md`, `02-final.md`, `review-report.md`) sebagai standar referensi output.

## Alur Kerja Layer 3 (Pipeline)

1. **Gate -1 - User Intent & Input Confirmation**: Hard gate sebelum membaca file apapun; menanyakan kesiapan 3 dokumen input dan menunggu konfirmasi eksplisit dari pengguna.
2. **Gate 0 - Intake Check & Slug Resolution**: Mengecek kelengkapan dokumen input dasar (`input/business-knowledge-base.md`, `business-audit-report.md`, `brand-story-guide.md`), menentukan identifier unik `<slug>` proyek, dan memeriksa potensi *Pipeline Resumability*.
3. **Phase 1 - Drafting (Dynamic Slides)** (`/writer`): Menghasilkan draf narasi per-slide dalam format Markdown (`compros/<slug>/drafts/01-draft.md`) dengan batas overlap repetisi ≤ 40% dan jumlah slide dinamis mengikuti konten.
4. **Phase 2 - Content QA (Dedup & Contact Check)** (`/reviewer`): Memverifikasi akurasi fakta bisnis, validasi kontak faktual (Zero Hallucination), deduplikasi konten antar-slide, brand voice, dan merumuskan draf On-Page SEO (Meta Title/Description). Iterasi revisi berjalan hingga status `APPROVED` (`compros/<slug>/drafts/02-final.md`).
5. **Phase 3 - Slide Deck Build (Inline SVG & Dynamic Brand Colors)** (`/builder`): Membangun file presentasi statis *single-file HTML* (Reveal.js) dengan CSS inlined, penanaman inline SVG, dan ekstraksi variabel warna brand dinamis (`compros/<slug>/index.html`).
6. **Phase 3b - Visual Self-Check** (`/builder` / orchestrator): Memverifikasi integritas visual di browser untuk memastikan tidak ada SVG rusak, teks overflow, atau layout rusak. Hasil dicatat di `build.log` dan bersifat blocking sebelum lanjut ke Phase 4.
7. **Phase 4 - Pre-flight SEO & Auto-Fix** (`/publisher`): Audit technical SEO (Title, Description, Open Graph, Schema.org JSON-LD, Alt Image) dan melakukan auto-patching otomatis pada file HTML (`compros/<slug>/reports/seo-report.md`).
8. **Gate 5 - User Confirmation Gate**: Berhenti dan menampilkan pratinjau lokal serta hasil audit SEO untuk meminta persetujuan rilis publik dari pengguna.
9. **Phase 6 - Deployment** (`/publisher`): Menayangkan slide ke URL publik via Vercel CLI (preview/production deployment) dan memverifikasi keterjangkauan live via HTTP GET 200 (`compros/<slug>/reports/deployment-status.md`).

## Struktur Repositori

```text
├── .claude-plugin/
│   └── plugin.json                     # Manifest plugin Claude Code
├── .codex-plugin/
│   └── plugin.json                     # Manifest registrasi skill Codex
├── plugin.json                         # Manifest plugin root
├── skills/
│   ├── compro/SKILL.md                 # Orchestrator State-Machine (Gate -1 s/d Phase 6)
│   ├── writer/SKILL.md                 # Skill 8: Copywriting & Slide Drafting (dynamic slides)
│   ├── reviewer/SKILL.md               # Skill 9: QA, Dedup & Content SEO Validator
│   ├── builder/                        # Skill 10: Theme-based Reveal.js Assembler (Inline SVG)
│   │   ├── SKILL.md
│   │   ├── templates/
│   │   │   ├── profile-shell.html      # Tema legacy (v2.2)
│   │   │   ├── editorial-shell.html    # Tema Canva Editorial (v2.4.0)
│   │   │   ├── editorial.css           # Design system gray-white modern
│   │   │   └── custom.css
│   │   └── references/
│   └── publisher/                      # Skill 11: SEO Auto-Fix & Vercel Deployer
│       ├── SKILL.md
│       └── scripts/
│           └── deploy.js
├── assets/                             # Aset global
├── scripts/                            # Verifikasi & test suite runner (test-all.js)
├── test-fixtures/                      # Fixture pengujian & verifikasi
│   ├── input/                          # Contoh dokumen input realistis (~2-5KB)
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
| `compros/<slug>/drafts/` | Draf narasi slide (`01-draft.md`, `02-final.md`) | Phase 1 & Phase 2 |
| `compros/<slug>/index.html` | File presentasi utama *single-file HTML* (Reveal.js) | Phase 3 (Build) & Phase 4 (Patch) |
| `compros/<slug>/compro.md` | Draf slide presentasi format Markdown | Phase 3 |
| `compros/<slug>/assets/` | Ikon & aset visual proyek | Phase 3 |
| `compros/<slug>/reports/` | Laporan evaluasi (`review-report.md`, `build.log`, `seo-report.md`, `deployment-status.md`) | Phase 2, 3b, 4, 6 |

State lokal lain yang juga di-ignore: `.vercel/` (kredensial & cache Vercel CLI), `.superpowers/` (workspace koordinasi Subagent-Driven Development), dan `node_modules/`.
