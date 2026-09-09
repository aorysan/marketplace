# Builder

> **Skill untuk:** Mengubah Company Profile (Markdown) menjadi HTML presentasi slide-based (Reveal.js) 16:9 yang siap di-deploy, berstandar visual enterprise, dan fully self-contained.

---

## Tujuan
Mengkonversi dokumen Markdown company profile menjadi single-file HTML presentasi interaktif berukuran 1920×1080 (16:9) menggunakan Reveal.js. Output harus konsisten, memikat secara visual, dan mematuhi panduan desain modern (`ui-ux-pro-max` & `impeccable`) tanpa ketergantungan pada plugin eksternal di sisi user saat runtime.

---

## Dokumen Referensi Desain

Builder ini dilengkapi modul referensi desain bawaan yang self-contained di dalam skill:

1. **[Design Tokens (`references/design-tokens.md`)](references/design-tokens.md):**
   - **Dynamic HSL Brand Color Tokens:** `--brand-primary`, `--brand-primary-light`, `--brand-secondary`, `--brand-dark`, `--brand-muted`, `--brand-surface`, `--brand-card-bg`, `--brand-border`.
   - **Typography Scale:** Formula skala tipografi untuk resolusi 1920×1080 (*Plus Jakarta Sans* untuk title, heading, angka statistik, badge; *Inter* untuk body teks, keterangan, dan tabel data).
   - **Spacing & Elevation:** Skala 8-point (`--space-1` hingga `--space-20`), radius kelengkungan (`--radius-sm` hingga `--radius-full`), dan layered 3D drop shadows (`--shadow-resting`, `--shadow-hover`, `--shadow-featured`, `--shadow-device`).

2. **[Visual Hierarchy & Layout Composition (`references/visual-hierarchy.md`)](references/visual-hierarchy.md):**
   - **Layout Archetypes 16:9:** Komposisi slide untuk Hero 2-kolom, Problem cards ber-border dashed, Solution cards berikon SVG, Circular Ecosystem Diagram, Smartphone UI Mockup frame, Pricing table dengan "Best Seller" ribbon badge, serta Closing banner dengan pill badge App Store & Google Play.
   - **Standar Rasio Kontras:** Kepatuhan WCAG AA / AAA (kontras teks normal minimal 4.5:1, teks besar minimal 3:1 pada background gelap `--brand-surface` `#0f172a`).
   - **Scannability & Micro-Interactions:** Z-pattern eye-path, Squint Test, transisi kartu 150–300ms yang hardware-accelerated, dan fidelitas print PDF `@media print`.

---

## Input & Output

### Input
- File Markdown company profile (path disediakan oleh caller/orchestrator, misal `compros/<slug>/drafts/02-final.md`)
- Panduan brand/dokumen pengetahuan (opsional, misal `input/brand-story-guide.md` untuk ekstraksi warna brand primer)
- Gambar/mockup lokal atau URL eksternal (opsional)

### Output
- `<project>/compros/<slug>/index.html` — single-file HTML presentasi 16:9 Reveal.js interaktif, inlined CSS, & print-ready
- `<project>/compros/<slug>/compro.md` — Markdown final (copy)
- `<project>/compros/<slug>/assets/` — folder aset gambar, diagram SVG, dan mockup antarmuka
- `<project>/compros/<slug>/reports/build.log` — log kompilasi slide, mapping archetype, dan penanganan aset
- `<project>/compros/<slug>/reports/` — folder laporan (`review-report.md`, `seo-report.md`, `build.log`)
- `<project>/compros/<slug>/drafts/` — riwayat draf kerja (`01-draft.md`, `02-final.md`)

---

## Prinsip Kerja

1. **Self-Contained Design Intelligence:** Seluruh aturan visual, warna, dan tipografi bersumber dari `references/design-tokens.md` dan `references/visual-hierarchy.md`.
2. **Dynamic HSL Theming:** Builder mendeteksi warna primer brand klien (default Venturo Teal `#009BAD` / `hsl(186, 100%, 34%)`) dan menyuntikkan token CSS HSL dinamis (`--brand-h`, `--brand-s`, `--brand-l`) ke dalam template slide.
3. **Zero Broken Images & Smart Asset Pipeline:** Jika URL gambar eksternal tidak dapat diakses (bukan status 200) atau tidak disediakan, builder **wajib menghasilkan aset vector SVG inline** (mockup smartphone realistis, circular ecosystem diagram, icon badge Lucide-style) sehingga slide tetap tampil mewah tanpa placeholder rusak atau kotak kosong.
4. **Deterministic Chunking & Slide Budget:** Satu slide hanya memuat 1 konsep utama dengan batas maksimal ~250 kata atau 3–4 kartu konten untuk menjamin keterbacaan pada rasio 16:9.
5. **Aksesibilitas & Kontras Ketat:** Memastikan teks body memiliki rasio kontras minimal 4.5:1 terhadap latar belakang slide (`#0f172a`) dan tidak menyampaikan makna hanya melalui warna semata.

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
Petakan setiap bagian Markdown ke dalam arsitektur slide 16:9 yang sesuai:
- **Heading Utama / Pembuka** ➔ **Hero Slide Archetype** (Headline H1 punchy, tagline, 3 chip metrik besar, visual container).
- **Masalah / Pain Points** ➔ **Problem Slide Archetype** (Grid 2–3 kartu ber-border dashed merah/amber, badge peringatan SVG, impact metrics).
- **Solusi / Pilar Fitur** ➔ **Solution Slide Archetype** (Grid kartu solid ber-border glow brand, icon box SVG 48×48px, poin benefit bercentang hijau).
- **Ekosistem Platform / Alur Sistem** ➔ **Circular Ecosystem Diagram Archetype** (Hub lingkaran inti brand dikelilingi 4–6 node satelit fitur).
- **Tampilan Produk / Aplikasi** ➔ **Smartphone UI Mockup Archetype** (Frame smartphone realistis ber-Dynamic Island dengan preview UI fungsional).
- **Paket / Harga / Lisensi** ➔ **Pricing Slide Archetype** (Grid 3 kartu harga, tier rekomendasi berskala 1.04x dengan badge ribbon "Best Seller", harga coret diskon).
- **Kontak / CTA Penutup** ➔ **Closing Slide Archetype** (Banner ajakan kolaborasi, tombol pill download App Store & Google Play, grid kontak 4 kolom WA/Email/Web/Alamat).
- **Diferensiasi / Mengapa Kami** ➔ **Differentiator Table Archetype** (Tabel perbandingan 4–5 kolom brand vs kompetitor, highlight kolom brand, status indikator centang/silang/peringatan, honesty callout).
- **Testimoni / Social Proof** ➔ **Social Proof Slide Archetype** (Header terpusat, 2–3 kartu kutipan testimoni klien dengan atribusi lengkap, logo trust bar grayscale atau fallback company pill badges).

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
- **Constraint Retroaktif:** Aturan ini berlaku retroaktif: jika builder menemukan output lama dengan `<img src="assets/*.svg">`, harus di-fix saat rebuild.

### 4. HTML Assembly & Inlining
- Muat template kerangka `profile-shell.html`.
- Suntikkan Google Fonts (*Plus Jakarta Sans* 600/700/800 & *Inter* 400/500/600).
- Konfigurasi Reveal.js untuk ukuran fixed `1920x1080`, margin `0.04`, transisi `slide`.
- Suntikkan variabel CSS HSL brand ke dalam `:root`.
- Baca `templates/custom.css` dan masukkan isinya menggantikan komentar placeholder `/* {{CUSTOM_CSS}} */` di dalam `<style>`.
- Gantikan `{{COMPANY_NAME}}` pada `<title>`.
- Render masing-masing `<section>` ke dalam `<div class="slides">` dengan class CSS semantik (`.hero-slide`, `.problem-card`, `.solution-card`, `.ecosystem-diagram`, `.phone-frame`, `.pricing-card`, `.closing-banner`, `.slide-differentiator`, `.slide-social-proof`).
- Tulis file keluaran final ke `<project>/compros/<slug>/index.html`.

### Badge-Title Alignment Consistency Rule
- Badge eyebrow dan slide title HARUS memiliki alignment yang sama:
  - Centered slides: Ecosystem (Slide 5), Pricing (Slide 9), Social Proof (Slide 8) → badge must also be centered (`margin-left: auto; margin-right: auto;` atau `margin: 0 auto;`)
  - Left-aligned slides: Hero (Slide 1), Problem (Slide 2), Solution (Slide 3), Traction (Slide 6), Differentiator (Slide 7) → badge also left-aligned
- Slide yang wajib centered: Ecosystem (Slide 5), Pricing (Slide 9)
- Slide yang wajib left-aligned: Hero (Slide 1), Problem (Slide 2), Solution (Slide 3), Traction (Slide 6)
- Slide opsional mengikuti: Differentiator (Slide 7) → left, Social Proof (Slide 8) → centered
- No slide may have mismatched badge vs title alignment (DILARANG keras mismatch badge vs title alignment pada slide mana pun).

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

## Error Handling

| Skenario | Tindakan Builder |
|----------|------------------|
| File Markdown tidak ditemukan | Hentikan proses dan beri pesan: `Error: Markdown file not found at <path>` |
| File Markdown kosong | Hentikan proses dan beri pesan: `Error: Markdown file is empty` |
| URL gambar gagal diakses (bukan 200) | Generate vector SVG fallback, catat detail di `reports/build.log`, dan lanjutkan build tanpa error |
| Warna brand tidak didefinisikan | Gunakan default Venturo Teal (`hsl(186, 100%, 34%)` / `#009BAD`) |
| Konten slide sangat panjang (>250 kata) | Split section menjadi slide berseri (Part 1, Part 2) dengan H2 berlanjut |
