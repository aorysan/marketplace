# Specification: Canva Editorial Slide Deck Overhaul & Plugin Cache Synchronization

**Date:** 2026-09-11  
**Status:** Approved by User  
**Scope:** `scripts/build-deck.js`, `templates/editorial.css`, `templates/editorial-shell.html`, `.claude/plugins/compro/`, `scripts/sync-plugin.js`

---

## 1. Problem Statement & Root Cause Analysis

Pengujian plugin `compro` pada target `congen4` menghasilkan tampilan yang identik dengan versi terdahulu (`congen3`) dengan gaya tema hitam pekat yang dinilai kurang menarik oleh pengguna. Pengguna telah menyediakan referensi template Canva (*Gray White Modern Company Profile / Salford & Co.*) di `docs/canva-reference/`, namun template tersebut belum terefleksi pada output akhir.

### Akar Masalah:
1. **Out-of-sync Plugin Cache:** Claude Code mengeksekusi plugin dari cache `~/.claude/plugins/cache/aorysan-marketplace/compro/2.3.0/skills/builder/scripts/build-deck.js`. File di cache tersebut (dan subfolder plugin `.claude/plugins/compro/`) masih versi lama (34 KB) yang meng-hardcode pemanggilan tema lama `profile-shell.html` dan `custom.css` (tema gelap).
2. **Parser Regresi pada Engine Editorial Root:** Skrip `scripts/build-deck.js` di root repo yang mendukung `--theme=editorial` mengalami bug fatal:
   - Frontmatter stripper meloloskan metadata `Meta Title:` dan `Meta Description:` ke H1 pertama, sehingga Hero slide menampilkan raw metadata string.
   - Fungsi `parseEditorialBulletCards` gagal menangkap bullet points markdown format `- **Bold**: text` atau `- text`, mengakibatkan Slide Masalah, Solusi, Layanan, dan Arsitektur ter-render kosong melompong (hanya judul).
3. **Ketiadaan Asset Slotting Visual:** Slide editorial yang ada saat ini hanya menampilkan teks tanpa komposisi visual terstruktur seperti pada referensi Canva.

---

## 2. Goals & Design Principles

1. **Faithful Canva Salford & Co. Adaptation:**
   - Kanvas abu-abu terang lembut (`#F4F5F7`), kartu putih bersih (`#FFFFFF`) dengan border halus (`rgba(0,0,0,0.06)`) dan bayangan lembut (`0 12px 32px rgba(0,0,0,0.04)`).
   - Kontras aksen Charcoal (`#232220`) untuk top navigation bar, primary buttons, dan closing container.
   - Identitas brand dinamis Venturo Pro Teal (`#009BAD`) untuk nomor urut tebal (`01`, `02`), pill badge, dan border highlight.
2. **100% Self-Contained Procedural SVG:**
   - Tidak bergantung pada URL foto eksternal atau file raster lokal.
   - Seluruh elemen visual (device mockup Titanium smartphone, diagram orbit ekosistem, icon box, indikator status) di-generate sebagai inline `<svg>`.
3. **Robust Markdown Chunking (Zero Empty Slides):**
   - Parser wajib mengekstrak kartu secara deterministik dari format bullet point, daftar bernomor, maupun paragraf biasa.
   - Metadata header dibersihkan secara tuntas sebelum segmentasi H1.
4. **Single-Command Plugin Cache Sync:**
   - Skrip utilitas `scripts/sync-plugin.js` menyinkronkan seluruh perubahan template, CSS, dan engine build ke `.claude/plugins/compro/` dan cache `~/.claude/plugins/cache/aorysan-marketplace/compro/2.3.0/`.

---

## 3. Detailed Architecture & Technical Components

### 3.1. Markdown Parsing & Metadata Sanitizer (`scripts/build-deck.js`)

#### Sanitasi Input
Sebelum pemotongan slide berdasarkan `^# ` (H1), lakukan sanitasi ketat:
```javascript
// Hapus seluruh blok YAML frontmatter jika ada
let cleaned = md.replace(/^---[\s\S]*?---\s*/m, '');
// Hapus baris metadata tersisa (Meta Title, Meta Description)
cleaned = cleaned.replace(/^Meta Title:.*$/gim, '').replace(/^Meta Description:.*$/gim, '');
// Trim whitespace awal
cleaned = cleaned.trim();
```

#### Robust Card Extractor
Fungsi `parseEditorialCards(content)`:
1. Pisahkan paragraf pembuka (deskripsi slide sebelum bullet pertama).
2. Deteksi semua baris bullet (`^[-*]\s+(.*)$`) atau numbered list (`^\d+\.\s+(.*)$`).
3. Untuk setiap bullet:
   - Jika ada pola `**Heading**: Deskripsi` atau `**Heading** — Deskripsi`, jadikan `Heading` sebagai title kartu dan sisa teks sebagai body.
   - Jika tanpa bold, potong 3–5 kata pertama sebagai title kartu, sisa kalimat sebagai body.
4. Fallback jika tidak ada bullet sama sekali: pecah teks berdasarkan double newline (`\n\n`), setiap paragraf menjadi satu kartu naratif.
5. Jaminan: jika section markdown memiliki teks, jumlah kartu minimal 1 (tidak pernah menghasilkan kontainer kosong).

---

### 3.2. Canva Layout Archetypes & Visual System (`templates/editorial.css`)

Slide dibagi ke dalam 8 arketipe visual:

1. **`archetype-hero-cover` (Slide 1):**
   - Top Nav Bar: Logo teks kiri, tombol solid "Company Profile" kanan.
   - Main Body (Split 60/40):
     - Kolom kiri: Kartu putih floating dengan badge kategori, H1 judul perusahaan, tagline persuasif, paragraf ringkas, tombol solid charcoal & outline teal.
     - Kolom kanan: Procedural Titanium Smartphone UI mockup dengan dynamic island, preview antarmuka aplikasi video AI, dan indikator status.

2. **`archetype-narrative-split` (Slide 2 Masalah & Slide 3 Solusi):**
   - Kolom kiri (35%): Badge kategori (`Tantangan` / `Solusi`), H2 judul, paragraf pengantar, slot visual SVG status (Shield Warning untuk masalah, Rocket/Sparkle untuk solusi).
   - Kolom kanan (65%): Susunan kartu vertikal dengan nomor indeks besar tebal (`01`, `02`, `03`) beraksen warna brand, judul kartu semi-bold, dan uraian penjelasan.

3. **`archetype-services-grid` (Slide 4 Layanan Unggulan):**
   - Header atas: Eyebrow badge + H2.
   - Grid 2x2 kartu putih simetris (4 item):
     - Icon box SVG 44×44px dengan background tint halus (`rgba(0, 155, 173, 0.10)`).
     - Heading item H3 tebal.
     - Uraian kapabilitas fitur.

4. **`archetype-ecosystem-orbit` (Slide 5 Arsitektur & Ekosistem):**
   - Header atas: Eyebrow badge + H2.
   - Split 50/50:
     - Sisi kiri: Circular Orbit Ecosystem diagram SVG (Core node Venturo Pro terhubung garis orbit ke 4 satelit: Brand DNA, GPU Pipeline, Google Sheets Sync, AI Copilot).
     - Sisi kanan: Kartu detail penjelasan alur produksi.

5. **`archetype-metrics-contact` (Slide 6 Pencapaian / Traction):**
   - Header atas: Eyebrow badge + H2.
   - Grid 3–4 kartu metrik horizontal:
     - Angka statistik besar (*Plus Jakarta Sans*, weight 800, ukuran 40px) beraksen brand teal.
     - Label penjelasan ringkas di bawah angka.

6. **`archetype-differentiator` (Slide 7 Mengapa Kami):**
   - Header atas: Eyebrow badge + H2.
   - Tabel perbandingan modern atau split perbandingan:
     - Kolom Kiri: "Cara Konvensional / SaaS Cloud" (border dashed merah/abu-abu).
     - Kolom Kanan: "Cara Venturo Pro" (kartu putih ber-border teal dan highlight shadow).

7. **`archetype-pricing-cards` (Slide 8 Paket & Kerjasama):**
   - Header atas: Eyebrow badge + H2.
   - Grid 3 kartu paket bertingkat:
     - Starter / Basic.
     - Pro (Pita badge *"Best Seller"*, border brand teal, elevasi shadow lebih tinggi).
     - Custom / Enterprise.
     - Tombol CTA pada setiap kartu.

8. **`archetype-closing-cta` (Slide 9 Hubungi Kami / Closing):**
   - Kontainer Charcoal `#232220` lebar penuh dengan sudut membulat 16px di atas kanvas abu-abu.
   - Teks judul putih elegan, ajakan kolaborasi, tombol CTA WhatsApp/Web.
   - Grid kontak 4 kolom: WhatsApp, Email Resmi, Alamat Studio/Kantor, dan Link Registrasi.

---

### 3.3. Plugin Synchronization Pipeline (`scripts/sync-plugin.js`)

Skrip otomatisasi berbasis Node.js yang menyinkronkan aset dari root repositori ke lingkungan runtime Claude Code:

1. **Target Folder 1 (Repositori Lokal Plugin):**
   - `.claude/plugins/compro/skills/builder/scripts/build-deck.js`
   - `.claude/plugins/compro/skills/builder/scripts/asset-generator.js`
   - `.claude/plugins/compro/skills/builder/templates/editorial.css`
   - `.claude/plugins/compro/skills/builder/templates/editorial-shell.html`
   - `.claude/plugins/compro/skills/builder/SKILL.md` (Update instruksi default tema)

2. **Target Folder 2 (Claude Code Plugin Cache Global):**
   - `~/.claude/plugins/cache/aorysan-marketplace/compro/2.3.0/skills/builder/scripts/`
   - `~/.claude/plugins/cache/aorysan-marketplace/compro/2.3.0/skills/builder/templates/`
   - `~/.claude/plugins/cache/aorysan-marketplace/compro/2.3.0/skills/builder/SKILL.md`

3. **Logging & Verification:**
   - Mencatat status file ter-copy dan checksum ukuran byte untuk memastikan integritas sinkronisasi.

---

## 4. Verification & Testing Plan

1. **Unit Test Parsing:**
   - Jalankan parsing terhadap `compros/congen4/drafts/02-final.md`.
   - Pastikan seluruh 9 slide menghasilkan kartu konten valid (zero slide kosong).
   - Pastikan slide 1 tidak mengandung kata `Meta Title:` atau `Meta Description:`.
2. **End-to-End Build Test:**
   - Jalankan: `node scripts/build-deck.js --name=congen4 --theme=editorial`
   - Periksa file output `compros/congen4/index.html`.
3. **Automated Visual Verification:**
   - Gunakan headless/browser inspection atau visual review untuk memverifikasi:
     - Latar belakang kanvas `#F4F5F7` aktif.
     - Semua elemen SVG ter-inline (tidak ada broken image icon).
     - Kartu bernomor `01`, `02` tersusun rapi tanpa teks terpotong.
4. **Plugin Sync Verification:**
   - Jalankan `node scripts/sync-plugin.js`.
   - Verifikasi bahwa hash file di cache plugin identik dengan root repo.
