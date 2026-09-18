# Compro Plugin v2.7.0 — Selling Point Research & Design Skill Embedding

## Problem Statement

Compro plugin saat ini memiliki dua kekurangan kritis:

1. **Tidak ada mekanisme selling point otomatis.** Writer menulis narasi berdasarkan input docs tanpa validasi pasar. Selling points yang ditampilkan di slide bersifat self-declared — tidak di-benchmark terhadap kompetitor nyata di industri yang sama. Hasilnya, narasi kurang persuasif karena keunggulan yang diklaim tidak terverifikasi secara kompetitif.

2. **Builder tidak memiliki skill desain bawaan.** [SKILL.md](file:///home/aorysan/aorysan/AryokPunya/Magang/compro/.claude/plugins/compro/skills/builder/SKILL.md#L8) builder menyebut kepatuhan terhadap `ui-ux-pro-max` & `impeccable`, tetapi kedua skill ini hanya tersedia di path global user (`~/.gemini/config/skills/`). Jika user lain menggunakan plugin ini tanpa kedua skill tersebut terinstall di sistem mereka, builder tidak memiliki intelligence desain — menghasilkan output visual yang rata-rata dan inkonsisten.

---

## Fitur 1: Selling Point Research (Phase 0.5)

### Ringkasan

Menambahkan sub-phase baru di dalam Writer (Phase 1) yang melakukan **competitive research** produk serupa di internet sebelum menulis draf narasi. Hasilnya adalah dokumen selling points yang terverifikasi secara kompetitif, tanpa menyebutkan nama kompetitor di slide output.

### Alur Kerja Detail

#### Phase 0.5: Competitive Research (di dalam Writer, sebelum drafting)

```
Gate 0 (Slug resolved)
    │
    ▼
Phase 0.5 — Selling Point Research  ◄── BARU
    │  1. Baca business-knowledge-base.md
    │  2. Identifikasi: nama produk, kategori industri, fitur utama
    │  3. search_web: cari 3-5 produk serupa/kompetitor
    │  4. read_url_content: baca landing page kompetitor
    │  5. Susun perbandingan internal + selling points
    │  6. Tulis → compros/<slug>/reports/selling-points-research.md
    │  7. BLOCKING: tunggu user review
    │
    ▼
Phase 1 — Drafting (Writer membaca selling-points-research.md sebagai input tambahan)
```

#### Langkah-langkah Research dalam Writer

1. **Extract Product Identity:**
   - Baca `input/business-knowledge-base.md`
   - Identifikasi: nama produk/perusahaan, kategori industri (SaaS, F&B, Property, dll), daftar fitur/layanan utama, model bisnis, target market
   - Gunakan informasi ini sebagai search query basis

2. **Web Research — Discovery:**
   - Gunakan `search_web` dengan query terstruktur:
     - `"<kategori industri> <jenis produk> Indonesia"` (lokal)
     - `"<kategori industri> <jenis produk> competitor comparison"` (global)
     - `"best <jenis produk> 2025 2026"` (ranking/review)
   - Kumpulkan 3-5 produk serupa yang muncul di hasil pencarian
   - Catat: nama produk, URL website, tagline/positioning singkat

3. **Web Research — Deep Dive:**
   - Untuk setiap kompetitor yang ditemukan, gunakan `read_url_content` pada landing page utama mereka
   - Ekstrak: fitur yang diklaim, pricing model (jika publik), positioning/tagline, target market, keunggulan yang ditekankan
   - Batasan: maksimal 5 halaman dibaca total (efisiensi token)

4. **Analisis Perbandingan:**
   - Susun tabel perbandingan internal:

     | Aspek | Produk Kita | Kompetitor A | Kompetitor B | Kompetitor C |
     |-------|-------------|--------------|--------------|--------------|
     | Fitur X | ✓ | ✓ | ✗ | ✓ |
     | Fitur Y | ✓ | ✗ | ✓ | ✗ |

   - Identifikasi **keunggulan unik** produk kita yang TIDAK dimiliki mayoritas kompetitor
   - Identifikasi **keunggulan bersama** yang menjadi table stakes (common features)
   - Identifikasi **kelemahan** yang harus diakui secara transparan

5. **Formulasi Selling Points:**
   - Dari hasil perbandingan, formulasikan 5-8 selling points yang:
     - Berdiri sendiri tanpa menyebut nama kompetitor
     - Berbasis fakta terverifikasi dari `business-knowledge-base.md`
     - Diperkuat oleh temuan research (keunikan relatif terhadap pasar)
   - Format selling point:
     ```
     **[Selling Point Title]**
     Klaim: [Pernyataan keunggulan]
     Basis Fakta: [Referensi dari business-knowledge-base.md]
     Validasi Kompetitif: [Mengapa ini unik — tanpa sebut nama kompetitor]
     Rekomendasi Slide: [Hero/Solution/Differentiator/dll]
     ```

### Output: `selling-points-research.md`

File disimpan di `compros/<slug>/reports/selling-points-research.md` dengan struktur:

```markdown
# Selling Points Research Report
## Metadata
- Produk: <nama produk>
- Industri: <kategori>
- Tanggal Research: <YYYY-MM-DD>
- Jumlah Kompetitor Dianalisis: <N>

## Ringkasan Temuan
<1-2 paragraf ringkasan positioning produk di pasar>

## Tabel Perbandingan Internal
> ⚠️ DOKUMEN INTERNAL — Data kompetitor di bawah ini TIDAK ditampilkan di slide output.

| Aspek | [Produk Kita] | [Kompetitor 1] | [Kompetitor 2] | [Kompetitor 3] |
|-------|...

## Selling Points Teridentifikasi

### SP-1: [Title]
- **Klaim:** ...
- **Basis Fakta:** ...
- **Validasi Kompetitif:** ...
- **Rekomendasi Slide:** ...

### SP-2: [Title]
...

## Kelemahan yang Harus Diakui
<Aspek di mana kompetitor lebih unggul — untuk honesty callout di slide Differentiator>

## Sumber Research
- [URL 1] — <deskripsi singkat>
- [URL 2] — ...
```

### Gate: User Review

Setelah file ditulis, Writer menampilkan prompt ke user:

> "Saya telah melakukan research kompetitif dan mengidentifikasi [N] selling points. Silakan review `compros/<slug>/reports/selling-points-research.md`. Apakah selling points ini sudah sesuai, atau ada yang perlu diubah sebelum saya mulai menulis draf narasi?"

- **Blocking:** Writer TIDAK lanjut ke drafting sampai user approve
- User boleh mengedit file secara manual atau meminta revisi
- Setelah approved, Writer membaca `selling-points-research.md` dan merajut selling points ke narasi slide

### Dampak ke Skill Lain

#### Writer ([SKILL.md](file:///home/aorysan/aorysan/AryokPunya/Magang/compro/.claude/plugins/compro/skills/writer/SKILL.md))
- Tambahkan langkah 0.5 sebelum langkah 1 (Baca Dokumen)
- Tambahkan `selling-points-research.md` sebagai input opsional di bagian "Inputs"
- Update "Langkah Kerja" dengan sub-steps research
- Tambahkan constraint: selling points di narasi TIDAK BOLEH menyebut nama kompetitor

#### Orchestrator ([SKILL.md](file:///home/aorysan/aorysan/AryokPunya/Magang/compro/.claude/plugins/compro/skills/compro/SKILL.md))
- Update Phase 1 description untuk mencakup sub-phase research + user review gate
- Tambahkan `selling-points-research.md` di tabel artefak runtime
- Update Pipeline Resumability table: `selling-points-research.md` ada → skip research

#### Reviewer ([SKILL.md](file:///home/aorysan/aorysan/AryokPunya/Magang/compro/.claude/plugins/compro/skills/reviewer/SKILL.md))
- Tambah checklist "Selling Point Verification" di Checklist Audit
- Tambah input `selling-points-research.md` di bagian Inputs

### Constraint Ketat

1. **Zero Competitor Leak:** Nama kompetitor dan data perbandingan TIDAK PERNAH muncul di slide HTML output. Hanya ada di `selling-points-research.md` (dokumen internal).
2. **Fakta Tetap dari Input Docs:** Research internet memperkaya perspektif, tapi angka/klaim tetap harus bersumber dari `business-knowledge-base.md` (Zero Hallucination rule tetap berlaku).
3. **Budget Research:** Maksimal 3 query `search_web` + 5 halaman `read_url_content` untuk efisiensi token.
4. **Selling Points Berdiri Sendiri:** Setiap selling point harus persuasif tanpa konteks "dibanding kompetitor X". Formulasi harus positif ("Kami adalah satu-satunya platform yang...") bukan komparatif ("Tidak seperti Kompetitor X...").

---

## Fitur 2: Embed Skills `ui-ux-pro-max` & `impeccable` ke Builder

### Ringkasan

Menyalin (copy) seluruh konten skill `ui-ux-pro-max` dan `impeccable` dari path global sistem (`~/.gemini/config/skills/`) ke dalam direktori builder plugin, menjadikan builder **fully self-contained** dan portabel untuk user lain.

### Lokasi Target

```
skills/builder/
├── SKILL.md
├── references/
│   ├── design-tokens.md          # Sudah ada
│   └── visual-hierarchy.md       # Sudah ada
├── skills/                       # ◄── BARU
│   ├── ui-ux-pro-max/            # Copy utuh (~3.6 MB, 68 files)
│   │   ├── SKILL.md              # 28 KB
│   │   ├── data/                 # ~1.6 MB (CSV datasets)
│   │   │   ├── styles.csv
│   │   │   ├── colors.csv
│   │   │   ├── typography.csv
│   │   │   ├── icons.csv
│   │   │   ├── google-fonts.csv
│   │   │   ├── products.csv
│   │   │   ├── charts.csv
│   │   │   ├── landing.csv
│   │   │   ├── motion.csv
│   │   │   ├── ux-guidelines.csv
│   │   │   ├── ui-reasoning.csv
│   │   │   ├── react-performance.csv
│   │   │   ├── app-interface.csv
│   │   │   ├── stacks/
│   │   │   └── ... (provenance, licenses, summary JSONs)
│   │   └── scripts/              # Python search scripts
│   │       ├── search.py
│   │       ├── core.py
│   │       ├── design_system.py
│   │       ├── reasoning_contract.py
│   │       ├── validate_data.py
│   │       └── tests/
│   └── impeccable/               # Reference docs & launcher (~2.2 MB, 51 files)
│       ├── SKILL.md              # 11.6 KB
│       ├── reference/            # 35 reference docs (~300 KB)
│       │   ├── craft-floor.md
│       │   ├── new-work.md
│       │   ├── critique.md
│       │   ├── polish.md
│       │   ├── bolder.md
│       │   ├── audit.md
│       │   ├── animate.md
│       │   ├── colorize.md
│       │   ├── typeset.md
│       │   ├── layout.md
│       │   └── ... (35 files total)
│       └── scripts/              # Impeccable launcher & scripts (~1.9 MB, tanpa precompiled binary)
│           ├── impeccable
│           ├── impeccable.cmd
│           ├── data/
│           ├── command-metadata.json
│           └── live-browser*.js
├── scripts/
└── templates/
```

### Perubahan di Builder [SKILL.md](file:///home/aorysan/aorysan/AryokPunya/Magang/compro/.claude/plugins/compro/skills/builder/SKILL.md)

1. **Baris 8** — Update path referensi:
   ```diff
   -Output harus konsisten, memikat secara visual, dan mematuhi panduan desain modern (`ui-ux-pro-max` & `impeccable`)
   +Output harus konsisten, memikat secara visual, dan mematuhi panduan desain modern (lihat `skills/ui-ux-pro-max/SKILL.md` & `skills/impeccable/SKILL.md` yang ter-bundle di dalam builder ini)
   ```

2. **Section baru "Embedded Design Skills"** — Ditambahkan setelah "Dokumen Referensi Desain":
   ```markdown
   ## Embedded Design Skills (Self-Contained)

   Builder ini menyertakan dua skill desain lengkap yang di-bundle langsung:

   1. **[ui-ux-pro-max (`skills/ui-ux-pro-max/SKILL.md`)](skills/ui-ux-pro-max/SKILL.md):**
      - Design system generator: 79 style, 192 product palettes, 74 font pairings
      - Searchable datasets: colors, typography, icons (Lucide/Phosphor), motion presets, UX guidelines
      - Python CLI: `python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system`
      - Digunakan untuk: pemilihan palet warna, font pairing, style matching per industri

   2. **[impeccable (`skills/impeccable/SKILL.md`)](skills/impeccable/SKILL.md):**
      - Design craft intelligence untuk frontend interface
      - Commands: critique, audit, polish, bolder, animate, colorize, typeset, layout
      - Reference docs untuk quality floor, visual hierarchy, dan production-grade craft
      - Digunakan untuk: post-build quality audit, visual polish, accessibility check

   ### Kapan Builder Harus Memanggil Skill Ini

   | Tahap Build | Skill | Tujuan |
   |-------------|-------|--------|
   | 1a. Brand Color Resolution | ui-ux-pro-max (`--domain color`) | Validasi palet warna terhadap industry best practices |
   | 2. Archetype Mapping | ui-ux-pro-max (`--domain landing`) | Pastikan layout sesuai conversion patterns |
   | 4. HTML Assembly | impeccable (craft-floor.md) | Enforce quality floor: no placeholder, no broken layout |
   | Post-build Self-Check | impeccable (critique) | Heuristic UX review per-slide |
   ```

3. **Section "Prinsip Kerja"** — Update item 1:
   ```diff
   -1. **Self-Contained Design Intelligence:** Seluruh aturan visual ... dari `references/design-tokens.md` dan `references/visual-hierarchy.md`.
   +1. **Self-Contained Design Intelligence:** Seluruh aturan visual ... dari `references/design-tokens.md`, `references/visual-hierarchy.md`, serta dua skill desain ter-bundle `skills/ui-ux-pro-max/` dan `skills/impeccable/`.
   ```

### Dampak Ukuran Repository

| Komponen | Ukuran |
|----------|--------|
| ui-ux-pro-max (68 files) | ~3.6 MB |
| impeccable (51 files) | ~2.2 MB |
| **Total tambahan** | **~5.8 MB** |
| Plugin sebelumnya | ~200 KB |

> [!NOTE]
> Pada awalnya penambahan skill diestimasi ~21.6 MB karena mencakup compiled binary Linux-x64 `impeccable` (~16 MB). Berdasarkan review PR #9, binary precompiled tersebut dihapus karena redundant (builder hanya membaca reference docs markdown secara langsung) dan bersifat platform-specific (hanya Linux x64). Launcher script (`scripts/impeccable`) tetap disertakan dan dapat mengunduh binary secara on-demand atau mengeksekusi binary sistem di PATH jika dibutuhkan. Penambahan ukuran akhir tereduksi menjadi ~5.8 MB (menghemat ~16 MB).

---

## Proposed Changes

### Fitur 1 (Selling Point Research)

---

#### [MODIFY] [SKILL.md](file:///home/aorysan/aorysan/AryokPunya/Magang/compro/.claude/plugins/compro/skills/writer/SKILL.md) (Writer)
- Tambah section "Phase 0.5: Competitive Selling Point Research" sebelum "Langkah Kerja"
- Tambah `selling-points-research.md` sebagai output baru
- Update "Langkah Kerja" dengan sub-steps research
- Tambah constraint: selling points di narasi TIDAK BOLEH menyebut nama kompetitor

#### [MODIFY] [SKILL.md](file:///home/aorysan/aorysan/AryokPunya/Magang/compro/.claude/plugins/compro/skills/compro/SKILL.md) (Orchestrator)
- Update Phase 1 description untuk mencakup sub-phase research + user review gate
- Tambah `selling-points-research.md` di tabel artefak runtime
- Update Pipeline Resumability table: `selling-points-research.md` ada → skip research

#### [MODIFY] [SKILL.md](file:///home/aorysan/aorysan/AryokPunya/Magang/compro/.claude/plugins/compro/skills/reviewer/SKILL.md) (Reviewer)
- Tambah checklist "Selling Point Verification" di Checklist Audit
- Tambah input `selling-points-research.md` di bagian Inputs

---

### Fitur 2 (Skill Embedding)

#### [NEW] `skills/builder/skills/ui-ux-pro-max/` — Copy utuh, 68 files, ~3.6 MB
#### [NEW] `skills/builder/skills/impeccable/` — Reference docs, launcher & metadata (51 files, ~2.2 MB, tanpa precompiled binary)

#### [MODIFY] [SKILL.md](file:///home/aorysan/aorysan/AryokPunya/Magang/compro/.claude/plugins/compro/skills/builder/SKILL.md) (Builder)
- Update referensi path ke skill lokal
- Tambah section "Embedded Design Skills (Self-Contained)"
- Update "Prinsip Kerja" item 1

---

### Shared (Both Features)

#### [MODIFY] [plugin.json](file:///home/aorysan/aorysan/AryokPunya/Magang/compro/.claude/plugins/compro/plugin.json)
- Bump versi ke `2.7.0`

#### [MODIFY] [README.md](file:///home/aorysan/aorysan/AryokPunya/Magang/compro/.claude/plugins/compro/README.md)
- Tambah "What's New in v2.7.0" section
- Update struktur repositori

#### [MODIFY] [.gitignore](file:///home/aorysan/aorysan/AryokPunya/Magang/compro/.claude/plugins/compro/.gitignore)
- Pastikan `skills/builder/skills/` tidak ter-ignore

---

## Verification Plan

### Automated Tests

```bash
# 1. Verify skills copied correctly
diff -rq ~/.gemini/config/skills/ui-ux-pro-max/ skills/builder/skills/ui-ux-pro-max/
diff -rq ~/.gemini/config/skills/impeccable/ skills/builder/skills/impeccable/

# 2. Verify ui-ux-pro-max search script works from new location
python3 skills/builder/skills/ui-ux-pro-max/scripts/search.py "corporate enterprise SaaS" --design-system

# 3. Verify impeccable launcher accessible
ls -la skills/builder/skills/impeccable/scripts/impeccable

# 4. Run existing test suite — pastikan tidak ada regresi
node scripts/test-all.js

# 5. Verify plugin.json valid
node scripts/validate-manifest.js
```

### Manual Verification

1. **Selling Point Research Flow:**
   - Jalankan pipeline compro dari awal dengan test fixture input
   - Verifikasi `selling-points-research.md` dihasilkan dengan format yang benar
   - Verifikasi Writer menggunakan selling points dalam narasi
   - Verifikasi TIDAK ADA nama kompetitor di `01-draft.md` atau `02-final.md`

2. **Skill Embedding:**
   - Hapus skill dari path global (`~/.gemini/config/skills/`) secara temporer
   - Jalankan builder dan verifikasi masih bisa mereferensikan skill dari path lokal
   - Restore skill global setelah test

3. **End-to-End Pipeline:**
   - Jalankan full pipeline (Gate -1 → Phase 6) dan pastikan selling points research + embedded skills terintegrasi tanpa error
