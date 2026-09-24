# Builder

> **Skill untuk:** Mengubah Company Profile (Markdown) menjadi HTML presentasi slide-based 16:9 (Aperture Cinematic Minimalist) yang siap di-deploy, berstandar visual enterprise, dan fully self-contained dengan runtime standalone zero-dependency (Vanilla HTML5/CSS3/JS).

---

## Tujuan
Mengkonversi dokumen Markdown company profile menjadi single-file HTML presentasi interaktif berukuran 1920×1080 (16:9) menggunakan shell Aperture Cinematic Minimalist mandiri (zero-dependency Vanilla HTML5/CSS3/JS). Output harus konsisten, memikat secara visual, dan mematuhi panduan desain Aperture Cinematic (lihat skill ter-bundle [`ui-ux-pro-max`](skills/ui-ux-pro-max/SKILL.md) & [`impeccable`](skills/impeccable/SKILL.md)) tanpa ketergantungan pada CDN atau plugin eksternal di sisi user saat runtime.

---

## Dokumen Referensi Desain

Builder ini dilengkapi modul referensi desain bawaan yang self-contained di dalam skill:

1. **[Design Tokens (`references/design-tokens.md`)](references/design-tokens.md):**
   - **Aperture Cinematic Palette:** `--background` (`#ffffff`), `--foreground` (`#0a0a0a`), `--muted-foreground` (`#6b6b6b`), `--accent` (`var(--brand-primary, #ff3b1d)`), `--border` (`#e4e4e4`), `--ghost` (`#f1f1f1`), `--hover-bg` (`#fafafa`).
   - **Typography Scale:** Formula skala tipografi untuk resolusi 1920×1080 (*Archivo* untuk display headline; *Inter* untuk body teks dan deskripsi; *JetBrains Mono* untuk category kickers, counter, dan labels).
   - **Spacing & Structure:** 12-column grid splits (3:9, 4:8, 50/50), hairline 1px borders, frosted glass surfaces (`backdrop-filter: blur(12px)`), dan minimal clean elevation.

2. **[Visual Hierarchy & Layout Composition (`references/visual-hierarchy.md`)](references/visual-hierarchy.md):**
   - **6 Slide Archetypes 16:9:** Komposisi slide untuk Cover (Full-Bleed Cinematic Hero), Problem (12-Col Split with Ghost Watermark), Product (50/50 Macro & Spec Matrix), Features (Rail Image + Giant Numbered List), USP (Frosted Glass Trio), dan Pricing (Vertical Image Rail + Tier Matrix).
   - **Standar Rasio Kontras:** Kepatuhan WCAG AA / AAA (kontras teks normal minimal 4.5:1, teks besar minimal 3:1 pada kanvas terang maupun kanvas gelap).
   - **Scannability & Micro-Interactions:** Hairline progress bar, active dot indicator berdenyut vermilion, interactive row hover effects, dan keyboard shortcuts navigation.

## Embedded Design Skills (Self-Contained)

Builder ini menyertakan dua skill desain lengkap yang di-bundle langsung untuk portabilitas penuh:

1. **[ui-ux-pro-max (`skills/ui-ux-pro-max/SKILL.md`)](skills/ui-ux-pro-max/SKILL.md):**
   - Design system generator dengan 79 searchable styles (50 aktif), 192 product palettes & reasoning profiles, 74 font pairings
   - Searchable datasets: colors, typography, icons (Lucide/Phosphor), motion presets, UX guidelines, landing patterns
   - Python CLI: `python3 skills/builder/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system`
   - Digunakan untuk: pemilihan palet warna, font pairing, style matching per industri produk klien

2. **[impeccable (`skills/impeccable/SKILL.md`)](skills/impeccable/SKILL.md):**
   - Design craft intelligence untuk frontend interface — award-winning design director level
   - Commands: `critique` (UX heuristic scoring), `audit` (a11y, perf, responsive), `polish` (final quality pass), `bolder` (amplify bland designs), `animate` (purposeful motion), `colorize` (strategic color), `typeset` (typography hierarchy), `layout` (spacing & rhythm)
   - Critical reference: [`craft-floor.md`](skills/impeccable/reference/craft-floor.md) — quality floor & absolute bans
   - Digunakan untuk: post-build quality audit, visual polish, accessibility check pada HTML output
   - Di-embed via 35 reference docs lengkap dan launcher script (`scripts/impeccable`), tanpa precompiled binary platform-specific di git (~16MB dihemat). Builder mengonsumsi reference docs secara langsung; launcher script akan mendownload binary sesuai platform atau menggunakan `impeccable` dari PATH jika eksekusi CLI diperlukan.

### Kapan Builder Harus Memanggil Skill Ini

| Tahap Build | Skill yang Dipanggil | Tujuan |
|-------------|---------------------|--------|
| 1a. Brand Color Resolution | ui-ux-pro-max (`python3 skills/builder/skills/ui-ux-pro-max/scripts/search.py "<industri> <produk>" --domain color`) | Validasi palet warna terhadap industry best practices |
| 2. Archetype Mapping | ui-ux-pro-max (`--domain landing`) | Pastikan layout sesuai conversion patterns untuk industri klien |
| 4. HTML Assembly | impeccable — baca [`craft-floor.md`](skills/impeccable/reference/craft-floor.md) | Enforce quality floor: no placeholder text, no broken layout, no orphaned elements |
| 4. HTML Assembly | impeccable — baca [`typeset.md`](skills/impeccable/reference/typeset.md) | Pastikan typography hierarchy konsisten (Archivo + Inter + JetBrains Mono scale) |
| Phase 3b Visual Self-Check | impeccable — baca [`critique.md`](skills/impeccable/reference/critique.md) | Heuristic UX review per-slide: scannability, visual balance, contrast |
| Phase 3b Visual Self-Check | impeccable — baca [`audit.md`](skills/impeccable/reference/audit.md) | Technical quality: accessibility (WCAG AA contrast), responsive behavior |

### Cara Menggunakan

Builder WAJIB membaca reference doc yang relevan dari skill ter-bundle pada tahap yang sesuai. Contoh penggunaan:

```bash
# Generate design system recommendation untuk industri klien
python3 skills/builder/skills/ui-ux-pro-max/scripts/search.py "fintech digital payment" --design-system

# Cari font pairing recommendation
python3 skills/builder/skills/ui-ux-pro-max/scripts/search.py "professional corporate" --domain typography

# Cari color palette recommendation
python3 skills/builder/skills/ui-ux-pro-max/scripts/search.py "healthcare wellness" --domain color
```

Untuk impeccable, builder membaca reference docs secara langsung (bukan menjalankan CLI):
- Sebelum HTML assembly: baca `skills/impeccable/reference/craft-floor.md`
- Saat visual self-check: baca `skills/impeccable/reference/critique.md` dan `skills/impeccable/reference/audit.md`

---

## Input & Output

### Input
- File Markdown company profile (path disediakan oleh caller/orchestrator, misal `compros/<slug>/drafts/02-final.md`)
- Panduan brand/dokumen pengetahuan (opsional, misal `input/brand-story-guide.md` untuk ekstraksi warna brand primer)
- Gambar/mockup lokal atau URL eksternal (opsional)

### Output
- `<project>/compros/<slug>/index.html` — single-file HTML presentasi 16:9 Aperture Cinematic interaktif (zero-dependency standalone engine), inlined CSS, & print-ready
- `<project>/compros/<slug>/compro.md` — Markdown final (copy)
- `<project>/compros/<slug>/assets/` — folder aset gambar, diagram SVG, dan mockup antarmuka
- `<project>/compros/<slug>/reports/build.log` — log kompilasi slide, mapping archetype, dan penanganan aset
- `<project>/compros/<slug>/reports/` — folder laporan (`review-report.md`, `seo-report.md`, `build.log`)
- `<project>/compros/<slug>/drafts/` — riwayat draf kerja (`01-draft.md`, `02-final.md`)

---

## Prinsip Kerja

1. **Self-Contained Design Intelligence:** Seluruh aturan visual, warna, dan tipografi bersumber dari `references/design-tokens.md`, `references/visual-hierarchy.md`, serta dua skill desain ter-bundle `skills/ui-ux-pro-max/` (design system generator, palettes, fonts, icons) dan `skills/impeccable/` (craft quality floor, critique, audit, polish).
2. **Single Template `modern` & Aperture Cinematic System:** Builder hanya memiliki satu template (`templates/modern/`) dengan sistem desain Aperture Cinematic Minimalist (kanvas `#ffffff`, teks `#0a0a0a`, muted `#6b6b6b`, aksen vermilion `--accent: var(--brand-primary, #ff3b1d)`, border hairline `#e4e4e4`, ghost `#f1f1f1`, hover `#fafafa`). Tidak ada opsi pemilihan tema/flag `--theme`; builder selalu merender via `themes/modern.js` (`renderCinematicSlide`) serta menyuntikkan variabel CSS brand ke dalam `:root`.
3. **Hybrid Asset Pipeline & Curated Direct CDN:** Mengunduh foto arsitektur, teknologi, dan produk resolusi tinggi dari Unsplash direct CDN (`images.unsplash.com`) berdasarkan slot komentar markdown (`<!-- image: <slot> -- ... -->`) untuk 6 cinematic slots (`hero`, `problem`, `macro`, `hands`, `viewfinder`, `lens`), dengan fallback berjenjang ke Lorem Picsum dan aset vektor SVG lokal (`templates/assets/fallback/`). Zero API key barrier, deck mandiri tersimpan di `compros/<slug>/assets/`.
4. **Deterministic Chunking & Slide Budget:** Satu slide memuat 1 konsep utama berukuran 1920×1080 (16:9 1080p) dengan batas maksimal 60 kata atau 4 kartu; >4 bullets atau >60 kata dipecah otomatis via splitDenseSlides() menjadi Part 1/2/3 (`Lanjutan: [Title] (Part N)`) untuk menjamin keterbacaan proporsional. Threshold 4 card-safe: reviewer mengizinkan hingga 6 plain bullets, builder split konservatif di 5+ agar §4 4-card cap selalu terpenuhi; prose-only >60 kata di-split per kalimat dengan budget 60 kata.
5. **Aksesibilitas & Kontras Ketat:** Memastikan teks body memiliki rasio kontras minimal 4.5:1 terhadap latar belakang (teks utama `#0a0a0a` pada kanvas terang `#ffffff`, teks inverse `#ffffff` pada kanvas gelap `#000000`/`#0a0a0a`).
6. **Git Worktree & Dynamic Workspace Sync Guarantee:** Builder mendeteksi environment kerja secara dinamis tanpa hardcoded absolute paths (`--root`, `COMPRO_PROJECT_ROOT`, atau auto-inspeksi file pointer `.git` worktree). `postBuildSyncGuarantee()` menjamin file output otomatis disinkronkan ke root workspace pengguna (`compros/<slug>/`) tanpa risiko kehilangan artefak.
7. **Clean Markdown Sanitization & Big Number Extraction:** Otomatis membersihkan blok frontmatter, `Meta Title:`, `Meta Description:`, `Tagline:`, mengganti placeholder kontak `[...]` dengan nilai demo terformat, dan mengekstrak statistik metrik menjadi spec matrix dan stat counter.

---

## Langkah Kerja Kompilasi Slide

### 1. Parse dan Analyze Markdown
- Baca file Markdown sumber dan ekstrak metadata perusahaan (nama perusahaan, tagline, warna brand, kontak).
- Analisis struktur heading (`#`, `##`, `###`) dan daftar bullet/tabel.
- Ekstrak statistik kunci dan angka metrik untuk diposisikan sebagai anchor visual.

### 1a. Brand Color Resolution
Tentukan warna brand primer dengan urutan prioritas berikut:
1. **Eksplisit dari brand-story-guide.md:**
   - Cari section "Brand Color Palette" atau tabel warna
   - Jika ada HEX warna primer → konversi ke HSL → inject ke `--brand-h/s/l`
   - Jika ada konflik token yang disebutkan → gunakan yang dilabeli "documented brand" (bukan "runtime token")
2. **Industri dari business-knowledge-base.md:**
   - Jika tidak ada warna eksplisit, identifikasi bidang usaha
   - Cocokkan dengan Industry Preset Palette di `design-tokens.md` §1.2
3. **Default fallback:**
   - Jika tidak bisa menentukan → Venturo Teal (H:186, S:100%, L:34%)

- **Wajib log keputusan** di `reports/build.log`:
  ```
  [COLOR] Source: brand-story-guide.md → #009BAD (documented brand)
  [COLOR] HSL: H=186, S=100%, L=34%
  [COLOR] Conflict noted: runtime token #00A76F differs; using documented brand
  ```

### 2. Archetype Mapping & Chunking
Petakan setiap bagian Markdown ke dalam arsitektur slide 16:9 yang sesuai (6 Aperture Cinematic Archetypes):
- **Heading Utama / Pembuka** ➔ **`cover` (Full-Bleed Cinematic Hero):** Dark photography background, double gradient overlay, live status dot ("● Now shipping"), vermilion kicker, giant headline (9rem), dan subtitle.
- **Masalah / Pain Points** ➔ **`problem` (12-Col Split with Ghost Watermark):** Asymmetric split (4-col image kiri + 8-col text kanan), watermark ghost text ("NO"), kicker, dan 3-item numbered list dengan highlight hover.
- **Tampilan Produk / Solusi / Value** ➔ **`product` (50/50 Macro & Spec Matrix):** 50% foto makro produk kiri dengan floating glass badge + 50% kanan berisi headline, paragraf deskriptif, dan 2x2 high-contrast stat counter block.
- **Fitur / Layanan / Kapabilitas** ➔ **`features` (Rail Image + Giant Numbered List):** 3-col rail image vertikal kiri dengan caption rotasi 90° + 9-col container dengan 4 baris fitur bernomor raksasa `01`–`04` (interaktif hover vermilion).
- **Keunggulan Kompetitif / Mengapa Kami** ➔ **`usp` (Frosted Glass Trio):** Dark viewfinder background canvas dengan 3 kartu frosted glass trio (`backdrop-filter: blur(12px)`), hairline white border, kicker, counter `01`–`03`, giant stat, headline, dan eksplanasi.
- **Paket / Harga / Lisensi / Kontak** ➔ **`pricing` (Vertical Image Rail + Tier Matrix):** 3-col vertical image rail dengan watermark "Ship it." di kiri + 9-col container dengan 3 tier pricing di kanan (featured tier inverted black background dengan tombol CTA vermilion).

### 3. Smart Asset Pipeline & Vector Fallbacks
- Untuk setiap referensi gambar:
  - Lakukan pemeriksaan validasi (HEAD request status 200).
  - Jika URL valid, gunakan tag `<img>` atau salin aset lokal ke `compros/<slug>/assets/`.
  - Jika tidak ada gambar atau gambar gagal dimuat: generate vector SVG inline (SVG device frame, circular orbit diagram, SVG checkmarks & icons) dan simpan ke `compros/<slug>/assets/`.
  - Catat seluruh status penanganan aset ke dalam `reports/build.log`.

### 3a. Inline SVG Enforcement Rule
- **SEMUA aset SVG yang di-generate builder** (hero banner, ecosystem diagram, smartphone mockup, icon badges, closing banner) WAJIB di-inline langsung ke dalam HTML sebagai tag `<svg>`, BUKAN sebagai `<img src="assets/file.svg">`.
- File SVG terpisah di `assets/` tetap disimpan sebagai arsip/backup, tetapi HTML TIDAK BOLEH me-reference mereka.
- Satu-satunya `<img>` yang dibolehkan adalah:
  - Gambar dari CDN eksternal (URL `https://`)
  - Gambar raster yang disediakan user (PNG/JPG) yang memang harus jadi file terpisah
- **Post-build self-check:** Setelah menulis `index.html`, scan semua tag `<img>`. Jika ada yang me-reference path lokal relatif (`src="assets/..."` atau `src="./..."`), itu adalah ERROR — baca file tersebut, inline isinya sebagai `<svg>`, dan hapus tag `<img>`.
- **Pengecualian per-build `closing-banner.svg`:** `renderModernClosing` (`themes/modern.js`) menyematkan `<img src="assets/closing-banner.svg">` — file art bermerek yang di-generate ke `assets/` pada setiap build. Ini BUKAN pelanggaran aturan inline: panel kiri membutuhkan byte gambar yang unik agar tidak melanggar aturan unique-md5 image (pakai ulang byte foto hero akan menggandakan hash).
- **Constraint Retroaktif:** Aturan ini berlaku retroaktif: jika builder menemukan output lama dengan `<img src="assets/*.svg">`, harus di-fix saat rebuild.

### 4. HTML Assembly & Inlining
- Muat template kerangka `templates/modern/shell.html` (satu-satunya template).
- Suntikkan Google Fonts (*Archivo* 500/600/700/800 display, *Inter* 400/500/600 body, *JetBrains Mono* 400/500 mono).
- Konfigurasi standalone zero-dependency Vanilla presentation shell untuk ukuran fixed `1920x1080` (16:9), hairline progress bar, dot navigation interaktif, dan keyboard shortcuts.
- Suntikkan variabel CSS brand ke dalam `:root` (`--accent: var(--brand-primary, #ff3b1d)`).
- Baca `templates/modern/theme.css` dan masukkan isinya menggantikan placeholder `/* CSS_INLINE_PLACEHOLDER */` di dalam `<style>`.
- Gantikan `<title>` dengan nama perusahaan (`<nama> — Company Profile`), serta suntikkan `{{BRAND_TITLE}}` ke header rail shell.
- Render masing-masing slide via `themes/modern.js` (`renderCinematicSlide`) ke dalam `<section class="deck-stage">` menggantikan `<!-- SLIDES_INLINE_PLACEHOLDER -->`.
- Render masing-masing slide dengan class CSS semantik (`.slide-cover`, `.slide-problem`, `.slide-product`, `.slide-features`, `.slide-usp`, `.slide-pricing`).
- Tulis file keluaran final ke `<project>/compros/<slug>/index.html`.

### Visual Hierarchy & Alignment Consistency Rule
- Category kicker mono (`font-mono`, `text-[11px]`, `tracking-[0.3em]`) diletakkan di atas slide title dengan warna aksen vermilion (`var(--accent)`).
- Left-aligned content slides: `problem`, `product`, `features`, `pricing` mempertahankan struktur grid teratur dan rapi.
- Centered / atmospheric slides: `usp` (frosted glass trio) dan `cover` (headline bottom-anchored) memaksimalkan kedalaman visual dengan dark canvas.

### 5. Konsolidasi Folder
- Simpan seluruh hasil kerja secara rapi dalam 1 root folder khusus proyek:
  - `<project>/compros/<slug>/index.html`
  - `<project>/compros/<slug>/compro.md`
  - `<project>/compros/<slug>/assets/`
  - `<project>/compros/<slug>/reports/build.log`
  - `<project>/compros/<slug>/reports/review-report.md`
  - `<project>/compros/<slug>/reports/seo-report.md`
  - `<project>/compros/<slug>/drafts/01-draft.md`
  - `<project>/compros/<slug>/drafts/02-final.md`

---

## Pola Komponen & Struktur Semantic Slide

### 1. Slide Hero
```html
<section class="slide-hero">
  <div class="hero-container">
    <div class="hero-content">
      <div class="badge-eyebrow">ENTERPRISE PLATFORM</div>
      <h1 class="hero-title">Nama Perusahaan</h1>
      <p class="hero-tagline">Solusi Cerdas untuk Mengakselerasi Bisnis Digital</p>
      <div class="hero-stats">
        <div class="stat-item"><span class="stat-number">500K+</span><span class="stat-label">Pengguna Aktif</span></div>
        <div class="stat-item"><span class="stat-number">99.9%</span><span class="stat-label">SLA Uptime</span></div>
        <div class="stat-item"><span class="stat-number">4.9/5</span><span class="stat-label">Rating Klien</span></div>
      </div>
    </div>
    <div class="hero-visual">
      <!-- Phone Mockup Frame atau SVG Platform Asset -->
    </div>
  </div>
</section>
```

### 2. Slide Problem
```html
<section class="slide-problem">
  <div class="slide-header">
    <div class="badge-eyebrow badge-danger">TANTANGAN INDUSTRI</div>
    <h2>Masalah Krusial yang Dihadapi Pasar</h2>
  </div>
  <div class="cards-grid cards-grid-3">
    <div class="problem-card">
      <div class="card-icon-warning">
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h3>Proses Manual Lambat</h3>
      <p>Pekerjaan operasional memakan waktu hingga 45 jam kerja per minggu akibat sistem yang terfragmentasi.</p>
      <div class="impact-pill">-45% Efisiensi</div>
    </div>
    <!-- problem-card berikutnya -->
  </div>
</section>
```

### Problem Card Icon Variation Rule
- Setiap problem card WAJIB menggunakan ikon SVG Lucide-style yang BERBEDA dan semantically RELEVAN dengan masalah yang digambarkan.
- Panduan pemilihan ikon:
  | Kategori Masalah | Ikon yang Sesuai |
  |------------------|------------------|
  | Biaya / Finansial | TrendingUp, DollarSign, CreditCard |
  | Konsistensi / Kualitas | Palette, Layers, ShieldOff |
  | Workflow / Fragmentasi | Puzzle, GitBranch, Shuffle |
  | Kecepatan / Waktu | Clock, Hourglass, Timer |
  | Keamanan / Risiko | ShieldAlert, Lock, AlertOctagon |
  | Skalabilitas | BarChart, Activity, Scale |
- DILARANG menggunakan ikon yang sama untuk >1 problem card dalam satu deck.
- Jika tidak yakin kategori masalah, default ke ikon yang paling deskriptif berdasarkan kata kunci di heading card.

### 3. Slide Solution
```html
<section class="slide-solution">
  <div class="slide-header">
    <div class="badge-eyebrow">SOLUSI UNGGULAN</div>
    <h2>Platform Terintegrasi Generasi Baru</h2>
  </div>
  <div class="cards-grid cards-grid-2">
    <div class="solution-card">
      <div class="card-icon-brand">
        <!-- SVG Icon Lucide -->
      </div>
      <h3>Otomasi Alur Kerja AI</h3>
      <p>Mengeliminasi tugas repetitif secara otomatis dengan akurasi pemrosesan hingga 99.8%.</p>
      <ul class="benefit-list">
        <li><svg class="check-icon">...</svg> Integrasi API instan ke sistem eksisting</li>
        <li><svg class="check-icon">...</svg> Pemrosesan data real-time dalam hitungan milidetik</li>
      </ul>
    </div>
    <!-- solution-card berikutnya -->
  </div>
</section>
```

### 4. Slide Pricing dengan "Best Seller" Badge
```html
<section class="slide-pricing">
  <div class="slide-header">
    <div class="badge-eyebrow">INVESTASI & LISENSI</div>
    <h2>Paket Berlangganan yang Fleksibel</h2>
  </div>
  <div class="pricing-grid">
    <div class="pricing-card">
      <div class="tier-name">Starter</div>
      <div class="tier-price">Rp 2.500.000<span>/bulan</span></div>
      <!-- features list -->
      <a href="#" class="btn btn-secondary">Pilih Paket</a>
    </div>
    <div class="pricing-card pricing-featured">
      <div class="badge-ribbon">BEST SELLER</div>
      <div class="tier-name">Professional</div>
      <div class="price-strikethrough">Rp 7.500.000</div>
      <div class="tier-price">Rp 5.000.000<span>/bulan</span></div>
      <!-- features list -->
      <a href="#" class="btn btn-primary">Mulai Sekarang</a>
    </div>
    <div class="pricing-card">
      <div class="tier-name">Enterprise</div>
      <div class="tier-price">Custom Quote</div>
      <!-- features list -->
      <a href="#" class="btn btn-secondary">Hubungi Sales</a>
    </div>
  </div>
</section>
```

### 5. Slide Closing / CTA
```html
<section class="slide-closing">
  <div class="closing-banner">
    <h2>Siap Mentransformasi Bisnis Anda Bersama Kami?</h2>
    <p>Jadwalkan konsultasi dan demonstrasi privat bersama konsultan solusi kami hari ini.</p>
    <div class="store-pills">
      <a href="#" class="app-store-pill">
        <svg class="apple-logo">...</svg>
        <div class="pill-text"><small>Download on the</small><span>App Store</span></div>
      </a>
      <a href="#" class="google-play-pill">
        <svg class="google-logo">...</svg>
        <div class="pill-text"><small>GET IT ON</small><span>Google Play</span></div>
      </a>
    </div>
  </div>
  <div class="contact-grid">
    <div class="contact-card"><strong>WhatsApp:</strong> +62 812-3456-7890</div>
    <div class="contact-card"><strong>Email:</strong> contact@company.com</div>
    <div class="contact-card"><strong>Website:</strong> www.company.com</div>
    <div class="contact-card"><strong>Kantor:</strong> Jakarta, Indonesia</div>
  </div>
</section>
```

### 6. Slide Differentiator / Why Choose Us
```html
<section class="slide-differentiator">
  <div class="slide-header">
    <div class="badge-eyebrow">KEUNGGULAN KOMPETITIF</div>
    <h2>Mengapa Memilih Kami Dibandingkan Alternatif Lain</h2>
  </div>
  <div class="table-container">
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Fitur / Kapabilitas</th>
          <th class="brand-col">Brand Kami</th>
          <th>Kompetitor A</th>
          <th>Kompetitor B</th>
          <th>Metode Manual</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Model Biaya</td>
          <td class="brand-col">
            <span class="comparison-check">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Flat bulanan
            </span>
          </td>
          <td>
            <span class="comparison-cross">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Per-transaksi
            </span>
          </td>
          <td>
            <span class="comparison-cross">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Per-transaksi
            </span>
          </td>
          <td>
            <span class="comparison-cross">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Biaya tak terduga
            </span>
          </td>
        </tr>
        <tr>
          <td>Konsistensi Brand DNA</td>
          <td class="brand-col">
            <span class="comparison-check">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Otomatis & Terpusat
            </span>
          </td>
          <td>
            <span class="comparison-cross">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Manual
            </span>
          </td>
          <td>
            <span class="comparison-cross">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Tidak ada
            </span>
          </td>
          <td>
            <span class="comparison-warn">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Manual & Terfragmentasi
            </span>
          </td>
        </tr>
        <tr>
          <td>Alur Kerja & Integrasi</td>
          <td class="brand-col">
            <span class="comparison-check">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Satu alur terintegrasi
            </span>
          </td>
          <td>
            <span class="comparison-warn">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Parsial
            </span>
          </td>
          <td>
            <span class="comparison-cross">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Terpisah
            </span>
          </td>
          <td>
            <span class="comparison-cross">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Terpisah
            </span>
          </td>
        </tr>
        <tr>
          <td>Setup & Infrastruktur</td>
          <td class="brand-col">
            <span class="comparison-warn">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              GPU hardware req
            </span>
          </td>
          <td>
            <span class="comparison-check">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Cloud hosted
            </span>
          </td>
          <td>
            <span class="comparison-check">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Cloud hosted
            </span>
          </td>
          <td>
            <span class="comparison-check">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Tidak ada
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="honesty-callout">
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    <p><strong>Catatan Transparansi:</strong> Kami tidak menyembunyikan trade-off — lihat kolom Setup. Arsitektur on-premise kami memerlukan spesifikasi GPU mandiri demi menjaga kedaulatan data dan privasi komputasi internal Anda.</p>
  </div>
</section>
```
- **Panduan Implementasi Slide Differentiator:**
  - Header berposisi left-aligned sesuai *Badge-Title Alignment Consistency Rule*.
  - Tabel perbandingan `.comparison-table` memiliki 4–5 kolom: Brand column + 2–3 kompetitor + kolom manual.
  - Kolom Brand diberi class `.brand-col` (pada `<th>` dan setiap `<td>`) untuk highlight visual berlatar brand subtle (`var(--brand-primary-subtle)`).
  - Baris berisi aspek pembanding / key differentiators. Setiap cell status menggunakan ikon SVG dengan class semantik `.comparison-check` (centang hijau), `.comparison-cross` (silang merah), atau `.comparison-warn` (peringatan kuning) disertai keterangan singkat.
  - Kotak catatan kejujuran `.honesty-callout` bersifat opsional namun sangat direkomendasikan jika terdapat aspek di mana kompetitor lebih unggul (transparansi membangun *trust* klien).

### 7. Slide Social Proof / Testimonials
```html
<section class="slide-social-proof">
  <div class="slide-header">
    <div class="badge-eyebrow">BUKTI KEPERCAYAAN</div>
    <h2>Dipercaya oleh Pemimpin Industri Terkemuka</h2>
  </div>
  <div class="testimonials-grid">
    <div class="testimonial-card">
      <div class="quote-icon">
        <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>
      </div>
      <p class="testimonial-quote">"Implementasi platform ini memangkas waktu operasional tim kami hingga 60% dalam 3 bulan pertama. Dukungan teknis dan keandalan sistemnya benar-benar di atas ekspektasi."</p>
      <div class="testimonial-attribution">
        <div class="author-avatar">
          <!-- Inlined avatar SVG atau inisial nama -->
          <span class="avatar-initials">BS</span>
        </div>
        <div class="author-info">
          <strong class="author-name">Budi Santoso</strong>
          <span class="author-title">Chief Technology Officer</span>
          <span class="author-company">PT Finansial Mandiri</span>
        </div>
      </div>
    </div>
    <div class="testimonial-card">
      <div class="quote-icon">
        <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>
      </div>
      <p class="testimonial-quote">"Solusi paling stabil dan intuitif yang pernah diadopsi enterprise kami. Kolaborasi tim antar-departemen meningkat drastis berkat otomasi alur kerja terpadu."</p>
      <div class="testimonial-attribution">
        <div class="author-avatar">
          <span class="avatar-initials">SW</span>
        </div>
        <div class="author-info">
          <strong class="author-name">Siti Wulandari</strong>
          <span class="author-title">VP of Operations</span>
          <span class="author-company">Nusantara Logistics</span>
        </div>
      </div>
    </div>
  </div>
  <div class="trust-logo-bar">
    <!-- Format A: Logo perusahaan klien inlined SVG (grayscale & subtle) -->
    <div class="trust-logo-item">
      <svg class="trust-logo" viewBox="0 0 120 36" width="120" height="36" fill="currentColor">
        <!-- SVG vector logo -->
      </svg>
    </div>
    <!-- Format B (Fallback jika logo SVG tidak tersedia): Company name pill badges -->
    <span class="company-pill">PT Finansial Mandiri</span>
    <span class="company-pill">Nusantara Logistics</span>
    <span class="company-pill">Astra Digital Corp</span>
    <span class="company-pill">Telko Media Pratama</span>
    <span class="company-pill">Bank Mega Perkasa</span>
  </div>
</section>
```
- **Panduan Implementasi Slide Social Proof:**
  - Header slide wajib terpusat (*centered*) sesuai *Badge-Title Alignment Consistency Rule* (`.slide-social-proof .slide-header { text-align: center; align-items: center; }` dan `.badge-eyebrow { margin-left: auto; margin-right: auto; }`).
  - Menampilkan 2–3 kartu testimoni `.testimonial-card` yang berisi kutipan pengalaman positif klien beserta atribusi lengkap (`author-name`, `author-title`, `author-company`).
  - Bar logo kepercayaan di bawah kartu (`.trust-logo-bar`) menggunakan flex row terpusat dengan efek grayscale dan transparansi subtle.
  - Fallback jika logo klien tidak tersedia: tampilkan nama-nama perusahaan dalam pill badges `.company-pill`.

---

### 3.5 Sistem Desain Aperture Cinematic Minimalist (Template `modern`)

Template `modern` (`templates/modern/`) adalah **satu-satunya template** pada `build-deck.js`: tidak ada flag `--theme` dan tidak ada pemilihan tema. Arsitektur visual mengadopsi sistem desain sinematik **Aperture Cinematic Minimalist** beresolusi 1920×1080 (16:9) dengan runtime standalone zero-dependency (Vanilla HTML5/CSS3/JS, tanpa dependensi CDN Reveal.js).

### Design Tokens (CSS Custom Properties)

| Token | Nilai | Keterangan |
|---|---|---|
| `--background` | `#ffffff` | Kanvas latar belakang slide terang |
| `--foreground` | `#0a0a0a` | Warna teks primer dan latar belakang kartu gelap |
| `--muted-foreground` | `#6b6b6b` | Teks sekunder, label mono, metadata slide |
| `--accent` | `var(--brand-primary, #ff3b1d)` | Aksen vermilion untuk kickers, active dot, tombol featured |
| `--accent-glow` | `rgba(255, 59, 29, 0.2)` | Efek glow pada aksen aktif / status indicator |
| `--border` | `#e4e4e4` | Border hairline 1px untuk grid dan kartu |
| `--ghost` | `#f1f1f1` | Tipografi dekoratif ghost watermarks (22rem) |
| `--hover-bg` | `#fafafa` | Highlight baris list / hover state |
| Dark Surface | `#000000` | Kanvas hitam untuk slide cover dan slide USP |
| Glass Surface | `rgba(0, 0, 0, 0.45)` | Permukaan frosted glass card (`backdrop-filter: blur(12px)`) |

**Typography Scale:**
- **Display / Headline:** Archivo (500/600/700/800) — headline ultra-besar 6rem hingga 9rem dengan leading rapat (0.85–0.95).
- **Body / Keterangan:** Inter (400/500/600) — body text netral, tinggi x-height optimal, terbaca tajam dan jernih.
- **Kickers / Mono Badges:** JetBrains Mono (400/500) — huruf kapital monospaced teknis dengan letter spacing lebar (`letter-spacing: 0.3em`).

**Standalone Presentation Shell:**
```html
<main class="deck-container">
  <!-- Top Rail: Brand title, sub-label, counter 01 / 06 -->
  <!-- Progress Line: 3px hairline progress bar (0% -> 100%) -->
  <!-- Main Stage: <section class="deck-stage"> (1920×1080 16:9 fixed canvas) -->
  <!-- Bottom Rail: Dot navigation & arrow navigation buttons -->
</main>
```
Slide dirender langsung ke dalam `.deck-stage` tanpa framework eksternal. Script inlined vanilla JS mengontrol perpindahan slide, pembaruan nomor counter, progress bar, dot aktif, serta navigasi keyboard (`ArrowRight`, `ArrowLeft`, `Space`, `Home`, `End`).

### 6 Slide Archetypes Aperture Cinematic

Builder memetakan setiap bagian Markdown secara otomatis ke salah satu dari 6 arketipe cinematic:

| Archetype Class | Layout & Proporsi | Elemen Kunci |
|---|---|---|
| `cover` (`.slide-cover`) | Full-Bleed Cinematic Hero | Dark photography background dengan double gradient fade (ke hitam), live status dot (`● Now shipping`), category kicker vermilion, headline raksasa bottom-anchored (9rem), dan lead subtitle. |
| `problem` (`.slide-problem`) | 12-Col Split with Ghost Watermark | Grid 12 kolom (4-col image kiri + 8-col konten kanan), giant ghost text watermark ("NO" di `#f1f1f1`), category kicker, headline tegas, dan 3-item numbered list (`01`–`03` vermilion) dengan hover highlight (`#fafafa`). |
| `product` (`.slide-product`) | 50/50 Macro & Spec Matrix | Grid 2 kolom seimbang. Sisi kiri: macro product image resolusi tinggi dengan floating glass badge. Sisi kanan: headline, paragraf deskriptif, dan 2x2 spec matrix stat block dengan angka kontras tinggi dan label mono. |
| `features` (`.slide-features`) | Rail Image + Giant Numbered List | Sisi kiri: 3-col vertical rail image dengan caption teknis rotasi 90° (`writing-mode: vertical-rl`). Sisi kanan: 9-col container dengan 4 baris fitur bernomor raksasa `01`–`04` (`#e4e4e4` berubah vermilion saat hover). |
| `usp` (`.slide-usp`) | Frosted Glass Trio | Dark viewfinder background canvas dengan vertical gradient. 3 kartu frosted glass trio (`backdrop-filter: blur(12px)`, `bg-black/40`, 1px hairline border putih). Tiap kartu memiliki kicker, counter `01`–`03`, giant stat, headline, dan eksplanasi. |
| `pricing` (`.slide-pricing`) | Vertical Image Rail + Tier Matrix | Sisi kiri: 3-col vertical image rail dengan watermark "Ship it." dan tag pengiriman. Sisi kanan: 9-col container dengan 3 pricing tiers. Featured tier mengusung inverted black background (`#0a0a0a`), teks putih, dan tombol CTA solid vermilion. |

### Imagery Guidelines & Asset Pipeline Slots

Pipeline aset mencari gambar yang cocok untuk tiap slide — **tanpa asset diawal pun build tetap jalan**:

1. **Deterministic Slot Mapping:**
   Membaca tag komentar `<!-- image: <slot> -- query: ... ; keywords: ... ; style: photo -->` pada draf Markdown dan memetakan ke slot visual cinematic (`hero`, `problem`, `macro`/`solution`, `hands`/`features`/`services`, `viewfinder`/`usp`, `lens`/`pricing`, plus `differentiator`, `metrics`, `ecosystem`, `closing`).

2. **Tier cascade (urutan pencarian):**
   - **`search`** — query web image search **Openverse** (keyless, `api.openverse.org`) memakai `keywords` → `query` → `judul slide + slot`. Hasil diurutkan per orientasi slot (portrait/landscape). Bisa dimatikan dengan env `COMPRO_OFFLINE=1`.
   - **`catalog`** — fallback katalog Unsplash hardcode 10 URL + Picsum.
   - **`generate`** — Pollinations AI dari `query:` (kalau search+catalog gagal).
   - **`svg`** — fallback vektor lokal (`templates/assets/fallback/`), deck tidak pernah broken.
   - **`cached`** — file `assets/slide-N-slot.jpg|svg` sudah valid, skip.

3. **Micro-Interactions & Motion Dynamics:**
   - **Hairline Progress Bar:** Garis progress 3px di bagian atas panggung yang terisi secara halus (`transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1)`) dari 0% ke 100% mengikuti slide aktif.
   - **Dot Navigation:** Lingkaran navigasi di footer rail dengan slide aktif berdenyut aksen vermilion (`background: var(--accent)`).
   - **Numbered List & Row Hover:** Nomor raksasa `01`–`04` pada slide features dan problem bertransisi dari `#e4e4e4` menjadi `#ff3b1d` dengan background baris berubah menjadi `#fafafa` saat disentuh kursor.
   - **Elevated Featured Tier:** Kartu paket unggulan pada slide pricing memiliki kontras invers visual (`#0a0a0a`) yang dominan dan tombol CTA aksen vermilion terang.

4. **Idempotensi & Offline Safety:**
   Gambar disimpan permanen di `compros/<slug>/assets/slide-*.jpg` (> 1 KB) atau `slide-*.svg`. Jika sudah ada, builder melewati proses download. `COMPRO_OFFLINE=1` melewati web search (pakai catalog). Budget aset default 25 s (override: `COMPRO_ASSET_BUDGET_MS`).

### Git Worktree & Workspace Sync Guarantee

Builder dilengkapi algoritma deteksi root dinamis (`detectProjectRoot`):
1. Parameter CLI `--root=<path>`
2. Environment variable `COMPRO_PROJECT_ROOT`
3. Inspeksi file pointer `.git` worktree (`gitdir: ...`) yang menavigasi ke root workspace utama.

Pada akhir kompilasi, `postBuildSyncGuarantee()` memverifikasi apakah build dieksekusi di dalam worktree terisolasi. Jika terdeteksi di worktree, skrip secara otomatis menyalin seluruh bundel proyek (`compros/<slug>/`) ke workspace utama pengguna sehingga artefak tidak pernah hilang saat sesi worktree ditutup.

### Cara Menjalankan

```bash
node scripts/build-deck.js --name=<slug>
```

Contoh:
```bash
node scripts/build-deck.js --name=congen5
```

Output diproduksi di `compros/<slug>/` (index.html, compro.md, assets/, reports/build.log, drafts/).

## Sinkronisasi Plugin

Setelah mengubah script builder, template, atau tema, jalankan:

```bash
node scripts/sync-plugin.js
```

Script ini menyalin file sumber ke dua lokasi plugin: `.claude/marketplace/compro/` (submodule marketplace) dan `~/.claude/plugins/cache/aorysan-marketplace/compro/2.8.0/` (global Claude Code cache v2.8.0), sehingga perubahan langsung aktif secara deterministik di kedua target.

---

## Error Handling

| Skenario | Tindakan Builder |
|----------|------------------|
| File Markdown tidak ditemukan | Hentikan proses dan beri pesan: `Error: Markdown file not found at <path>` |
| File Markdown kosong | Hentikan proses dan beri pesan: `Error: Markdown file is empty` |
| URL gambar gagal diakses (bukan 200) | Generate vector SVG fallback, catat detail di `reports/build.log`, dan lanjutkan build tanpa error |
| Warna brand tidak didefinisikan | Gunakan default Aperture Vermilion (`#ff3b1d`) |
| Konten slide sangat panjang (>250 kata) | Split section menjadi slide berseri (Part 1, Part 2) dengan H2 berlanjut |
