# Specification: Compro Plugin Visual Overhaul, Unified Folder Consolidation, and Skill Simplification

**Date:** 2026-09-08  
**Status:** Approved by User  
**Scope:** `D:/AryokPunya/Magang/compro` (Plugin `.claude/plugins/compro/` and build scripts)

---

## 1. Overview & Objectives

Pengujian plugin `compro` saat ini menghasilkan output slide (`compros/congen/index.html`) yang sangat sederhana (dump teks mentah markdown ke slide Reveal.js berlatar hitam tanpa tata letak visual, tanpa gambar/mockup, dan tanpa struktur kartu). Selain itu, artefak hasil eksekusi tersebar di root repo (`artifacts/`, `qa/`, dan `compros/congen/`).

Dokumen spesifikasi ini menetapkan perbaikan menyeluruh:
1. **Penyederhanaan Nama Skill**: Menghilangkan prefix `company-profile-` sehingga nama skill menjadi `writer`, `reviewer`, `builder`, `publisher`, dan `compro`.
2. **Integrasi Desain UI/UX Pro Max & Impeccable**: Memasukkan prinsip design system, palet dinamis, tipografi kelas atas (*Plus Jakarta Sans* + *Inter*), micro-spacing, dan visual hierarchy ke dalam skill `builder`.
3. **Overhaul Visual Setara `compro.pdf`**:
   - Layout per tipe slide: Hero 2-kolom, Problem dashed cards, Solution icon grid, Circular Ecosystem diagram, Smartphone UI mockups, Pricing cards ber-badge *"Best Seller"*, Promo container, dan Closing collaboration banner.
   - Dynamic Theming: Ekstraksi warna brand dinamis dari dokumen input (misal `#009BAD` Teal untuk Venturo Pro) dengan surface modern yang bersih.
4. **Smart Visual & Asset Pipeline**: Menyediakan mockup smartphone, diagram SVG, dan grafis otomatis sehingga slide tidak pernah kosong meskipun tanpa gambar eksternal.
5. **Konsolidasi Folder Terpadu**: Mengumpulkan 100% output per-projek ke dalam satu direktori `compros/<slug>/` (`index.html`, `compro.md`, `assets/`, `reports/`, `drafts/`).
6. **PDF Export Ready**: Dukungan cetak presisi 16:9 landscape yang identik dengan slide web.

---

## 2. Skill Architecture & Naming Simplification

Struktur folder di `.claude/plugins/compro/skills/` disederhanakan:

| Nama Lama | Nama Baru | Tanggung Jawab |
| :--- | :--- | :--- |
| `company-profile-writer` | **`writer`** | Menghasilkan draf markdown company profile berstruktur slide dari dokumen `input/`. |
| `company-profile-reviewer` | **`reviewer`** | Melakukan evaluasi kualitas 4 dimensi dan memberikan feedback revisi draf. |
| `company-profile-builder` | **`builder`** | Mengonversi markdown menjadi Reveal.js HTML slide 16:9 berdesain modern, meng-inject mockup/SVG/aset, dan menyatukan output folder. Mengadopsi panduan dari `ui-ux-pro-max` dan `impeccable`. |
| `company-profile-publisher` | **`publisher`** | Melakukan audit SEO & perbaikan metadata schema, serta deployment ke Vercel. |
| `compro` | **`compro`** | Orchestrator pipeline end-to-end yang memanggil `writer` → `reviewer` → `builder` → `publisher`. |

---

## 3. Unified Directory Structure

Semua artefak untuk satu profil perusahaan tersimpan secara terisolasi dan rapi di dalam foldernya masing-masing:

```text
compros/<slug>/
├── index.html              # Slide deck Reveal.js 16:9 interaktif & print-ready
├── compro.md               # Dokumen final profil dalam format Markdown
├── assets/                 # Aset lokal: logo, mockup frame, UI screens, diagram SVG, banner
├── reports/                # Laporan pengujian dan log kompilasi
│   ├── review-report.md    # Laporan review kualitas draf (Phase 2)
│   ├── seo-report.md       # Laporan SEO & metadata audit (Phase 4)
│   └── build.log           # Log perakitan slide dan image handling
└── drafts/                 # Riwayat draf kerja
    ├── 01-draft.md         # Output awal dari skill writer
    └── 02-final.md         # Draf terverifikasi yang disetujui reviewer
```

Root repository (`artifacts/` dan `qa/`) tidak lagi digunakan untuk menyimpan file sementara; seluruh proses langsung beroperasi di dalam subdirektori proyek target.

---

## 4. Visual Design System & Theming Engine

Skill `builder` mengadopsi standar dari `ui-ux-pro-max` dan `impeccable`:

### 4.1. Dynamic Brand Palette
Warna diekstrak secara dinamis dari `brand-story-guide.md` atau metadata input:
- `--brand-primary`: Warna aksen utama brand (misal Venturo Pro: `#009BAD` / Teal, default: `#2563EB` / Royal Blue).
- `--brand-primary-light`: Tint lembut untuk background badge / hover (`#E6F7F9` / `#EFF6FF`).
- `--brand-secondary`: Warna aksen pelengkap (misal `#F59E0B` Amber atau `#10B981` Emerald).
- `--brand-dark`: Navy elegan untuk heading teks (`#0F172A`).
- `--brand-muted`: Abu-abu netral untuk teks penjelas (`#64748B`).
- `--brand-surface`: Latar putih murni (`#FFFFFF`) dengan kartu berkontras halus (`#F8FAFC`).
- `--brand-border`: Border halus berestetika tinggi (`#E2E8F0`).

### 4.2. Tipografi
- **Headings (H1, H2, H3)**: `'Plus Jakarta Sans'`, sans-serif, weight 700/800, letter-spacing -0.02em.
- **Body Text & Lists**: `'Inter'`, sans-serif, line-height 1.6, weight 400/500.

### 4.3. Komponen Slide Khusus (Adaptasi `compro.pdf`)

1. **Hero Slide**:
   - Layout 2 kolom (60% konten teks, 40% visual).
   - Kiri: Badge kategori, H1 besar, sub-headline persuasif, pill statistik dengan ikon SVG modern.
   - Kanan: Visual device mockup atau ilustrasi hero beraksen brand.
2. **Problem Slide (Pain Points)**:
   - Header jelas: "Masalah yang Dihadapi / Pain Points".
   - Kartu masalah bertata letak rapi (1-kolom atau 2-kolom) dengan garis tepi halus beraksen (*dashed border cards*), penanda nomor/warning icon, dan teks keluhan pelanggan yang tajam.
3. **Solution Slide (Stress-Free Solutions)**:
   - Grid 2-kolom kartu solusi dengan ikon SVG spesifik (misal penghematan biaya, kecepatan waktu, konsistensi brand, sinkronisasi spreadsheet).
4. **Circular Ecosystem / Feature Diagram**:
   - Diagram arsitektur vektor SVG (mirip halaman 5 `compro.pdf`) yang menempatkan logo/nama brand di lingkaran pusat, dikelilingi orbit node-node fitur utama yang terhubung garis konektor elegan.
5. **Smartphone UI Mockups**:
   - Frame smartphone CSS realistis (speaker notch, bezel tipis, dynamic island, bayangan 3D halus) yang di dalamnya merender antarmuka aplikasi nyata (header bar, saldo/status, notifikasi WhatsApp AI, kartu tagihan).
   - Dilengkapi anotasi poin fitur di sampingnya dengan ikon centang checklist hijau.
6. **Pricing & Subscription Table**:
   - Kartu komparasi paket bertingkat dengan aksen kartu terpopuler (*highlight card*), badge pita *"Best Seller"*, harga promo dengan coretan harga asli (*strikethrough*), dan daftar fitur lengkap.
7. **Special Offer & Facility Card**:
   - Box penawaran terbatas dengan tenggat waktu, jaminan pendampingan (*support 1x24 jam*), dan ikon garansi.
8. **Closing / Let's Collaborate**:
   - Banner visual tim / kantor, lencana toko aplikasi (*App Store* & *Google Play*), serta kontak terstruktur (WhatsApp, Instagram, Website, dan Alamat kantor).

---

## 5. Smart Visual & Asset Pipeline

1. **Aset Eksternal (Jika Tersedia)**:
   - Jika ada file logo, foto, atau tangkapan layar di `input/` atau instruksi user, builder menyalinnya ke `compros/<slug>/assets/` dan menyematkannya ke slide.
2. **Aset Terintegrasi (Jika Tanpa Gambar Luar)**:
   - Frame smartphone dirender langsung melalui CSS/SVG dengan visual interface yang lengkap dan presisi.
   - Diagram ekosistem dirender secara native sebagai responsive inline SVG.
   - Ikon bullet point menggunakan SVG vector murni yang tajam di semua DPI.
   - Banner visual menggunakan gradasi dan motif teknologi modern berbasis CSS/SVG.
3. **Keandalan**: Semua aset tersimpan lokal atau ter-inline; zero broken links.

---

## 6. Reveal.js Configuration & PDF Export Ready

- **Slide Configuration**:
  - Ukuran: 1920 x 1080 (rasio 16:9).
  - Margin: 0.04 (memaksimalkan keterbacaan ruang slide tanpa terpotong).
  - Transition: `fade` atau `slide` halus.
  - Controls & Progress bar modern.
- **Print Stylesheet (`@media print`)**:
  - Ukuran cetak: `1920px 1080px landscape`.
  - Margin: 0, padding slide presisi.
  - `-webkit-print-color-adjust: exact` untuk mempertahankan warna background dan shadow.
  - Dukungan URL `index.html?print-pdf` sehingga user cukup menekan `Ctrl + P` untuk menyimpan sebagai PDF identik dengan `compro.pdf`.

---

## 7. Execution Plan & Implementation Steps

1. **Update Plugin Manifest & Skills**:
   - Ubah direktori skill: `company-profile-*` ➔ `writer`, `reviewer`, `builder`, `publisher`.
   - Update `SKILL.md` di tiap folder skill agar merefleksikan nama baru dan path folder `compros/<slug>/`.
   - Perbarui `compro` orchestrator skill.
2. **Enhance Builder Skill Templates & Engine**:
   - Perbarui `profile-shell.html` (Google Fonts *Plus Jakarta Sans* & *Inter*, konfigurasi print 16:9).
   - Tulis ulang `custom.css` (Design tokens, kartu pain-points, smartphone frame, pricing cards, diagram styles, print styles).
   - Perbarui `scripts/build-deck.js` untuk merender komponen slide interaktif, menangani aset/mockup SVG, dan menyatukan folder ke `compros/<slug>/`.
3. **Update Validation & Test Scripts**:
   - Perbarui skrip pengujian di `.claude/plugins/compro/scripts/` untuk menyesuaikan struktur baru.
4. **Re-generate & Validate Output**:
   - Jalankan build ulang untuk `compros/congen`.
   - Verifikasi tampilan visual di browser dan struktur foldernya.
