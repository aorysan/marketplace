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
   - **7 Slide Archetypes 16:9:** Komposisi slide untuk Cover (Full-Bleed Cinematic Hero + glass stat strip), Problem (12-Col Split with Ghost Watermark), Product (50/50 Macro & Spec Matrix), Features (Rail Image + Giant Numbered List), USP (Frosted Glass Trio), Pricing (Vertical Image Rail + Tier Matrix), dan Closing (Rail Image + Contact Matrix & CTA).
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
3. **Hybrid Asset Pipeline:** Menyelesaikan gambar untuk tiap slide dari directive markdown melalui tier berjenjang: **Openverse web image search** (keyless, bisa dimatikan dengan `COMPRO_OFFLINE=1`) ➔ **kurated Unsplash direct CDN** ➔ **Lorem Picsum** ➔ **SVG vektor lokal** (`templates/assets/fallback/`). Tiga bentuk directive diterima (`parseImageDirective`): `<!-- image: <slot> -->`, `<!-- image: <slot> <teks bebas sebagai query> -->`, dan bentuk terstruktur `<!-- image: <slot> -- query: ...; keywords: ...; style: photo -->`; bagian terstruktur boleh sebagian (tidak wajib lengkap) dan setiap bagian yang hilang tidak membatalkan bagian lain. **Validasi byte:** setiap respons unduhan diperiksa magic bytes-nya (`sniffImageFormat`); respons 200 yang bukan gambar (halaman error CDN, body JSON rate-limit, challenge HTML) dihapus dan tier berikutnya yang dipakai, sehingga slot gambar tidak pernah berisi file rusak. Dua kosakata slot dibedakan tegas: **slot directive** bebas dari `imageFetcher.SLOT_MAP` (`hero`, `problem`, `solution`, `services`, `ecosystem`, `metrics`, `differentiator`, `pricing`, `closing`, `macro`, `hands`, `viewfinder`, `lens`) dan **slot default arketipe** dari `CINEMATIC_SLOT_MAP`. Directive selalu menang atas classifier; slot berhenti dipakai sebagai nama file `assets/slide-N-<slot>.jpg`. Zero API key barrier, deck mandiri tersimpan di `compros/<slug>/assets/`.
4. **Deterministic Chunking & Slide Budget:** Satu slide memuat 1 konsep utama berukuran 1920×1080 (16:9 1080p) dengan batas maksimal 60 kata atau 4 kartu; >4 bullets atau >60 kata dipecah otomatis via splitDenseSlides() menjadi Part 1/2/3 (`Lanjutan: [Title] (Part N)`) untuk menjamin keterbacaan proporsional. Threshold 4 card-safe: reviewer mengizinkan hingga 6 plain bullets, builder split konservatif di 5+ agar §4 4-card cap selalu terpenuhi; prose-only >60 kata di-split per kalimat dengan budget 60 kata.
5. **Aksesibilitas & Kontras Ketat:** Memastikan teks body memiliki rasio kontras minimal 4.5:1 terhadap latar belakang (teks utama `#0a0a0a` pada kanvas terang `#ffffff`, teks inverse `#ffffff` pada kanvas gelap `#000000`/`#0a0a0a`).
6. **Git Worktree & Dynamic Workspace Sync Guarantee:** Builder mendeteksi environment kerja secara dinamis tanpa hardcoded absolute paths (`--root`, `COMPRO_PROJECT_ROOT`, atau auto-inspeksi file pointer `.git` worktree). `postBuildSyncGuarantee()` menjamin file output otomatis disinkronkan ke root workspace pengguna (`compros/<slug>/`) tanpa risiko kehilangan artefak.
7. **Clean Markdown Sanitization & Big Number Extraction:** Otomatis membersihkan blok frontmatter, `Meta Title:`, `Meta Description:`, dan `Tagline:`, serta mengekstrak angka metrik untuk spec matrix / stat counter. Placeholder kontak reviewer (`[Nomor WhatsApp]`, `[Email Resmi]`, `[Alamat Kantor]`, …) **tidak pernah ditampilkan mentah** dan **tidak pernah diganti dengan data karangan** — nilainya menjadi penanda eksplisit `Belum tersedia` dan dicatat di `reports/build.log`. Angka hanya dianggap metrik bila token bold-nya memang berbentuk figur (`1×`, `5–20`, `~90%`, `20:1`, `3-tier`, `< Rp100rb`), sehingga kalimat naratif tidak pernah dipromosikan menjadi metrik.

---

## Langkah Kerja Kompilasi Slide

### 1. Parse dan Analyze Markdown
- Baca file Markdown sumber dan ekstrak metadata perusahaan (nama perusahaan, tagline, warna brand, kontak).
- Analisis struktur heading (`#`, `##`, `###`) dan daftar bullet/tabel.
- Ekstrak statistik kunci dan angka metrik untuk diposisikan sebagai anchor visual.

### 1a. Brand Color Resolution
Nama perusahaan dan warna brand primer diambil dari dokumen input, dengan urutan:
1. **`input/brand-story-guide.md`** — baris tabel `| Primary | … | #RRGGBB |` (dan `Secondary`/`Accent`).
2. **`input/business-knowledge-base.md`** — pola tabel yang sama sebagai sumber cadangan.
3. **Default Aperture Vermilion `#ff3b1d`** — dipakai bila tidak ada warna eksplisit.

Implementasinya: `runMain()` di `skills/builder/scripts/build-deck.js` memanggil `assetGenerator.hexToHsl()`
untuk meng-inject `:root { --brand-primary: <hex>; }` plus `--brand-h/s/l` ke CSS inline.

- **Wajib log keputusan** di `reports/build.log` (baris `Brand Name Src` / `Brand Color Src`):
  ```
  Brand Name Src  : brand-story-guide.md
  Brand Color Src : brand-story-guide.md
  ```
- **Fallback tidak boleh senyap:** bila warna brand tidak ditemukan, builder menulis
  peringatan ke stderr (`[WARN] Brand primary color not found … using default #ff3b1d.`)
  dan `Brand Color Src: default (#ff3b1d)` ke log, sehingga tabel palet yang salah format
  tidak diam-diam merilis accent color yang keliru. Nama perusahaan yang jatuh ke heading
  markdown juga dilaporkan sebagai `markdown heading`.

### 2. Archetype Mapping & Chunking
Petakan setiap bagian Markdown ke dalam arsitektur slide 16:9 yang sesuai (7 Aperture Cinematic Archetypes — SSOT `CINEMATIC_ARCHETYPES` di `scripts/themes/modern.js`, dicerminkan di `templates/modern/manifest.json` dan dijaga `scripts/test-cinematic-classifier.js`):
- **Heading Utama / Pembuka** ➔ **`cover` (Full-Bleed Cinematic Hero):** Dark photography background, double gradient overlay, live status dot ("● Now shipping"), vermilion kicker, giant headline (9rem), dan subtitle.
- **Masalah / Pain Points** ➔ **`problem` (12-Col Split with Ghost Watermark):** Asymmetric split (4-col image kiri + 8-col text kanan), watermark ghost text ("NO"), kicker, dan 3-item numbered list dengan highlight hover.
- **Tampilan Produk / Solusi / Value** ➔ **`product` (50/50 Macro & Spec Matrix):** 50% foto makro produk kiri dengan floating glass badge + 50% kanan berisi headline, paragraf deskriptif, dan 2x2 high-contrast stat counter block.
- **Fitur / Layanan / Kapabilitas** ➔ **`features` (Rail Image + Giant Numbered List):** 3-col rail image vertikal kiri dengan caption rotasi 90° + 9-col container dengan 4 baris fitur bernomor raksasa `01`–`04` (interaktif hover vermilion).
- **Keunggulan Kompetitif / Mengapa Kami** ➔ **`usp` (Frosted Glass Trio):** Dark viewfinder background canvas dengan 3 kartu frosted glass trio (`backdrop-filter: blur(12px)`), hairline white border, kicker, counter `01`–`03`, giant stat, headline, dan eksplanasi.
- **Paket / Harga / Lisensi** ➔ **`pricing` (Vertical Image Rail + Tier Matrix):** 3-col vertical image rail dengan overlay "Siap mulai." di kiri + 9-col container dengan 3 tier pricing di kanan (featured tier inverted black background dengan tombol CTA vermilion). Tanpa tabel/item apa pun, builder turun ke layout `features`.
- **Kontak / CTA / "Hubungi Kami" / "Terima Kasih"** ➔ **`closing` (Image Rail + Contact Matrix):** 3-col rail image dengan caption rotasi "Langkah berikutnya" + 9-col container berisi headline, `.closing-notes` (bullet komitmen/benefit), `.closing-contacts` (grid 2 kolom ikon + label + nilai), dan `.closing-cta` vermilion. Hanya bullet berlabel kontak (WhatsApp/telepon/email/alamat/website/kontak) yang masuk matriks kontak; bullet lain menjadi notes.

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
- Muat template kerangka `templates/modern/shell.html` (satu-satunya template).
- Suntikkan Google Fonts (*Archivo* 500/600/700/800 display, *Inter* 400/500/600 body, *JetBrains Mono* 400/500 mono).
- Konfigurasi standalone zero-dependency Vanilla presentation shell untuk ukuran fixed `1920x1080` (16:9), hairline progress bar, dot navigation interaktif, dan keyboard shortcuts.
- Suntikkan variabel CSS brand ke dalam `:root` (`--accent: var(--brand-primary, #ff3b1d)`).
- Baca `templates/modern/theme.css` dan masukkan isinya menggantikan placeholder `/* CSS_INLINE_PLACEHOLDER */` di dalam `<style>`.
- Gantikan `<title>` dengan nama perusahaan (`<nama> — Company Profile`), serta suntikkan `{{BRAND_TITLE}}` ke header rail shell.
- Render masing-masing slide via `themes/modern.js` (`renderCinematicSlide`) ke dalam `<section class="deck-stage">` menggantikan `<!-- SLIDES_INLINE_PLACEHOLDER -->`.
- Render masing-masing slide dengan class CSS semantik (`.slide-cover`, `.slide-problem`, `.slide-product`, `.slide-features`, `.slide-usp`, `.slide-pricing`, `.slide-closing`).
- **Urutan CSS wajib benar:** baris `@import url('…googleapis…')` milik `theme.css` harus tetap berada **di paling atas** blok `<style>`; builder memindahkan (hoist) seluruh `@import` ke atas sebelum menyisipkan `:root { --brand-primary: … }`. Menaruh rule apa pun sebelum `@import` membuat browser membuang import tersebut.
- Tulis file keluaran final ke `<project>/compros/<slug>/index.html`.

### Visual Hierarchy & Alignment Consistency Rule
- Category kicker mono (`font-mono`, `text-[11px]`, `tracking-[0.3em]`) diletakkan di atas slide title dengan warna aksen vermilion (`var(--accent)`).
- Left-aligned content slides: `problem`, `product`, `features`, `pricing`, `closing` mempertahankan struktur grid teratur dan rapi.
- Centered / atmospheric slides: `usp` (frosted glass trio) dan `cover` (headline bottom-anchored) memaksimalkan kedalaman visual dengan dark canvas.
- **Bahasa default chrome adalah Indonesia** (deck `lang="id"`): `Masalahnya`, `Cara lama`, `Produk`, `Fitur utama`, `Semua yang Anda butuhkan`, `Mengapa kami`, `Pilih paket`, `Siap mulai.`, `Pendampingan dari awal`, `Hubungi kami`, `Langkah berikutnya`. Semua bisa ditimpa dari draf (`kicker:`, `caption:`, `railLabel:`, `railTitle:`, `railSub:`) — jangan hardcode string Inggris baru.

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

Markup slide **tidak ditulis tangan**. Setiap arketipe diproduksi secara
deterministik oleh renderer-nya di `skills/builder/scripts/themes/modern.js`, jadi
satu-satunya sumber kebenaran DOM + class adalah renderer tersebut beserta
`skills/builder/templates/modern/theme.css`.

| Arketipe | Renderer | Root class |
|---|---|---|
| `cover` | `renderCover` | `.slide-cover` |
| `problem` | `renderProblem` | `.slide-problem` |
| `product` | `renderProduct` | `.slide-product` |
| `features` | `renderFeatures` | `.slide-features` |
| `usp` | `renderUsp` | `.slide-usp` |
| `pricing` | `renderPricing` | `.slide-pricing` |
| `closing` | `renderClosing` | `.slide-closing` |

Setiap slide adalah `<article class="slide-item" id="slide-<index>">` dan menjadi
anak langsung `.deck-stage`; slide yang sedang aktif mendapat `.slide-item.active`.
Shell menghitung jumlah slide, dot navigation, counter, dan progress bar dari DOM
yang di-inject, bukan dari angka hardcoded.

Referensi komposisi & class lengkap (jangan duplikasi markup di sini):

- `skills/builder/templates/modern/README.md` — arketipe, slot default, shell chrome, bahasa default.
- `skills/builder/references/design-tokens.md` §4 & §6 — grid split, token warna, dan daftar class semantik.
- `skills/builder/references/visual-hierarchy.md` §2 — komposisi per arketipe + aturan zero-hallucination.

Aturan yang berlaku untuk semua arketipe:

1. **Tanpa markup manual.** Menulis `<section class="slide-...">` sendiri akan
   menghasilkan slide tanpa gaya, karena class tersebut tidak ada di `theme.css`.
2. **Zero-hallucination.** Hanya kartu/metrik yang ter-parse dari draf yang dirender
   (`cards.slice(0, kapasitas)`); tidak ada default layanan/metrik/testimoni.
3. **Degradasi aman.** Bullet tanpa angka → `.stat-cell.no-metric`; `pricing` tanpa
   tabel → layout `features`; `closing` tanpa kontak → headline + CTA.
4. **Kontak tidak dikarang.** Placeholder reviewer menjadi `Belum tersedia` dan
   dilaporkan di `reports/build.log`.

> **Catatan historis:** dokumen ini sebelumnya memuat contoh HTML manual untuk
> arketipe lama (`.slide-hero`, `.problem-card`, `.pricing-card`,
> `.comparison-table`, `.slide-differentiator`, `.slide-social-proof`,
> `.testimonial-card`, `.trust-logo-bar`, `.company-pill`, store badges). Class
> tersebut sudah dihapus dari `theme.css` bersama renderer legacy-nya (build v2.8
> hanya punya 7 arketipe sinematik). Gunakan tabel di atas.

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

### 7 Slide Archetypes Aperture Cinematic

Builder memetakan setiap bagian Markdown secara otomatis ke salah satu dari 7 arketipe cinematic (SSOT: `CINEMATIC_ARCHETYPES`):

| Archetype Class | Layout & Proporsi | Elemen Kunci |
|---|---|---|
| `cover` (`.slide-cover`) | Full-Bleed Cinematic Hero | Dark photography background dengan double gradient fade (ke hitam), live status dot (`● Now shipping`), category kicker vermilion, headline raksasa bottom-anchored (9rem), dan lead subtitle. |
| `problem` (`.slide-problem`) | 12-Col Split with Ghost Watermark | Grid 12 kolom (4-col image kiri + 8-col konten kanan), giant ghost text watermark ("NO" di `#f1f1f1`), category kicker, headline tegas, dan 3-item numbered list (`01`–`03` vermilion) dengan hover highlight (`#fafafa`). |
| `product` (`.slide-product`) | 50/50 Macro & Spec Matrix | Grid 2 kolom seimbang. Sisi kiri: macro product image resolusi tinggi dengan floating glass badge. Sisi kanan: headline, paragraf deskriptif, dan 2x2 spec matrix stat block dengan angka kontras tinggi dan label mono. |
| `features` (`.slide-features`) | Rail Image + Giant Numbered List | Sisi kiri: 3-col vertical rail image dengan caption teknis rotasi 90° (`writing-mode: vertical-rl`). Sisi kanan: 9-col container dengan 4 baris fitur bernomor raksasa `01`–`04` (`#e4e4e4` berubah vermilion saat hover). |
| `usp` (`.slide-usp`) | Frosted Glass Trio | Dark viewfinder background canvas dengan vertical gradient. 3 kartu frosted glass trio (`backdrop-filter: blur(12px)`, `bg-black/40`, 1px hairline border putih). Tiap kartu memiliki kicker, counter `01`–`03`, giant stat, headline, dan eksplanasi. |
| `pricing` (`.slide-pricing`) | Vertical Image Rail + Tier Matrix | Sisi kiri: 3-col vertical image rail dengan overlay "Siap mulai." dan sub-label pendampingan. Sisi kanan: 9-col container dengan 3 pricing tiers. Featured tier mengusung inverted black background (`#0a0a0a`), teks putih, dan tombol CTA solid vermilion. |
| `closing` (`.slide-closing`) | Rail Image + Contact Matrix | Sisi kiri: 3-col rail image dengan caption teknis rotasi 90° ("Langkah berikutnya"). Sisi kanan: 9-col container dengan kicker, headline, `.closing-desc`, `.closing-notes` (komitmen/benefit), `.closing-contacts` (grid 2 kolom ikon SVG + label mono + nilai), dan `.closing-cta` vermilion. Nilai kontak placeholder menjadi `Belum tersedia` — tidak pernah dikarang. |

### Imagery Guidelines & Asset Pipeline Slots

Pipeline aset mencari gambar yang cocok untuk tiap slide — **tanpa asset diawal pun build tetap jalan**:

1. **Deterministic Slot Mapping:**
   Membaca tag komentar gambar pada draf Markdown dengan satu parser toleran (`parseImageDirective`). Tiga bentuk diterima: `<!-- image: <slot> -->`, `<!-- image: <slot> <teks bebas yang langsung dipakai sebagai query> -->`, dan bentuk terstruktur `<!-- image: <slot> -- query: ... ; keywords: ... ; style: photo -->` yang boleh sebagian (`query`/`keywords`/`style` tidak wajib lengkap; satu bagian yang hilang tidak menghapus bagian lainnya). Slot directive yang didukung (`imageFetcher.SLOT_MAP`): `hero`, `problem`, `solution`, `services`, `ecosystem`, `metrics`, `differentiator`, `pricing`, `closing`, `macro`, `hands`, `viewfinder`, `lens`. Slot default per arketipe (`CINEMATIC_SLOT_MAP`): `cover→hero`, `problem→problem`, `product→macro`, `features→hands`, `usp→viewfinder`, `pricing→lens`, `closing→closing`. Directive selalu menang atas slot default.

2. **Tier cascade (urutan pencarian):**
   - **`search`** — query web image search **Openverse** (keyless, `api.openverse.org`) memakai `keywords` → `query` → `judul slide + slot`. Hasil diurutkan per orientasi slot (portrait/landscape). Bisa dimatikan dengan env `COMPRO_OFFLINE=1`.
   - **`catalog`** — fallback katalog Unsplash hardcode 10 URL (2 URL per kategori, dipilih anti-duplikat antar slide).
   - **`picsum`** — overflow pool katalog (mis. slide ke-3 di kategori yang sama) memakai Picsum ber-seed; foto ini **content-blind**, jadi dihitung terpisah di `build.log` supaya deck yang bergeser ke stok generik terlihat, bukan tersembunyi di balik label `catalog`.
   - **`generate`** — Pollinations AI dari `query:` (kalau search+catalog gagal). Hanya jalan bila `query` tidak kosong.
   - **`svg`** — fallback vektor lokal (`templates/assets/fallback/`), deck tidak pernah broken.

   Setiap unduhan divalidasi di level byte sebelum dipakai: respons yang bukan gambar (HTML/JSON dari CDN) dihapus dan tier berikutnya dijalankan. `build.log` menutup ringkasan dengan `[ASSETS] elapsed=… tiers(search=…,catalog=…,picsum=…,generate=…,svg=…,cached=…)`.
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

Dari root plugin (lokasi `plugin.json`):

```bash
node skills/builder/scripts/build-deck.js --name=<slug>
```

Contoh:
```bash
node skills/builder/scripts/build-deck.js --name=venturo-pro
```

Flag opsional: `--input=<path>` (markdown sumber eksplisit), `--output=<path>` (file HTML eksplisit), `--root=<path>` (root workspace). `--theme` sudah tidak ada dan diabaikan dengan peringatan.

Output diproduksi di `compros/<slug>/` (index.html, compro.md, assets/, reports/build.log, drafts/) pada root workspace hasil `detectProjectRoot()`.

> Nama script harus `skills/builder/scripts/build-deck.js`. `scripts/build-deck.js` **tidak ada** di repo ini dan akan berhenti dengan `MODULE_NOT_FOUND`.

## Verifikasi Perubahan

Setiap perubahan script builder, template, atau klasifikasi arketipe WAJIB diverifikasi dengan suite resmi dari root plugin:

```bash
npm test                 # = node scripts/test-all.js (offline-safe)
```

Suite ini mencakup parity classifier 7 arketipe + anti-drift manifest, kontrak renderer, golden DOM assertions, dan e2e density. Tes individual bisa dijalankan langsung, mis. `node scripts/test-cinematic-classifier.js`.

---

## Error Handling

| Skenario | Tindakan Builder |
|----------|------------------|
| File Markdown tidak ditemukan | Hentikan proses dan beri pesan: `Error: Markdown file not found at <path>` |
| File Markdown kosong | Hentikan proses dan beri pesan: `Error: Markdown file is empty` |
| URL gambar gagal diakses (bukan 200) | Generate vector SVG fallback, catat detail di `reports/build.log`, dan lanjutkan build tanpa error |
| Warna brand tidak didefinisikan | Gunakan default Aperture Vermilion (`#ff3b1d`), tulis `[WARN]` ke stderr + `Brand Color Src: default` ke `reports/build.log` |
| Placeholder kontak masih ada di draf | Render sebagai `Belum tersedia` (jangan pernah mengarang nomor/email/alamat) + daftarkan di bagian `Contact Placeholders` pada `reports/build.log` |
| Slide `product` tanpa angka metrik | Render `.stat-cell.no-metric` (label-only) + `console.warn`; jangan biarkan grid bolong |
| Slide arketipe `closing` tanpa kontak | Render headline + CTA saja + `console.warn` |
| Konten slide sangat panjang (>250 kata) | Split section menjadi slide berseri (Part 1, Part 2) dengan H2 berlanjut |
