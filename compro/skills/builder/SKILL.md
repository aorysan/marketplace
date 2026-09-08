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

### 2. Archetype Mapping & Chunking
Petakan setiap bagian Markdown ke dalam arsitektur slide 16:9 yang sesuai:
- **Heading Utama / Pembuka** ➔ **Hero Slide Archetype** (Headline H1 punchy, tagline, 3 chip metrik besar, visual container).
- **Masalah / Pain Points** ➔ **Problem Slide Archetype** (Grid 2–3 kartu ber-border dashed merah/amber, badge peringatan SVG, impact metrics).
- **Solusi / Pilar Fitur** ➔ **Solution Slide Archetype** (Grid kartu solid ber-border glow brand, icon box SVG 48×48px, poin benefit bercentang hijau).
- **Ekosistem Platform / Alur Sistem** ➔ **Circular Ecosystem Diagram Archetype** (Hub lingkaran inti brand dikelilingi 4–6 node satelit fitur).
- **Tampilan Produk / Aplikasi** ➔ **Smartphone UI Mockup Archetype** (Frame smartphone realistis ber-Dynamic Island dengan preview UI fungsional).
- **Paket / Harga / Lisensi** ➔ **Pricing Slide Archetype** (Grid 3 kartu harga, tier rekomendasi berskala 1.04x dengan badge ribbon "Best Seller", harga coret diskon).
- **Kontak / CTA Penutup** ➔ **Closing Slide Archetype** (Banner ajakan kolaborasi, tombol pill download App Store & Google Play, grid kontak 4 kolom WA/Email/Web/Alamat).

### 3. Smart Asset Pipeline & Vector Fallbacks
- Untuk setiap referensi gambar:
  - Lakukan pemeriksaan validasi (HEAD request status 200).
  - Jika URL valid, gunakan tag `<img>` atau salin aset lokal ke `compros/<slug>/assets/`.
  - Jika tidak ada gambar atau gambar gagal dimuat: generate vector SVG inline (SVG device frame, circular orbit diagram, SVG checkmarks & icons) dan simpan ke `compros/<slug>/assets/`.
  - Catat seluruh status penanganan aset ke dalam `reports/build.log`.

### 4. HTML Assembly & Inlining
- Muat template kerangka `profile-shell.html`.
- Suntikkan Google Fonts (*Plus Jakarta Sans* 600/700/800 & *Inter* 400/500/600).
- Konfigurasi Reveal.js untuk ukuran fixed `1920x1080`, margin `0.04`, transisi `slide`.
- Suntikkan variabel CSS HSL brand ke dalam `:root`.
- Baca `templates/custom.css` dan masukkan isinya menggantikan komentar placeholder `/* {{CUSTOM_CSS}} */` di dalam `<style>`.
- Gantikan `{{COMPANY_NAME}}` pada `<title>`.
- Render masing-masing `<section>` ke dalam `<div class="slides">` dengan class CSS semantik (`.hero-slide`, `.problem-card`, `.solution-card`, `.ecosystem-diagram`, `.phone-frame`, `.pricing-card`, `.closing-banner`).
- Tulis file keluaran final ke `<project>/compros/<slug>/index.html`.

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

---

## Error Handling

| Skenario | Tindakan Builder |
|----------|------------------|
| File Markdown tidak ditemukan | Hentikan proses dan beri pesan: `Error: Markdown file not found at <path>` |
| File Markdown kosong | Hentikan proses dan beri pesan: `Error: Markdown file is empty` |
| URL gambar gagal diakses (bukan 200) | Generate vector SVG fallback, catat detail di `reports/build.log`, dan lanjutkan build tanpa error |
| Warna brand tidak didefinisikan | Gunakan default Venturo Teal (`hsl(186, 100%, 34%)` / `#009BAD`) |
| Konten slide sangat panjang (>250 kata) | Split section menjadi slide berseri (Part 1, Part 2) dengan H2 berlanjut |
