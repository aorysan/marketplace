# Canva Editorial Slide Design System & Dynamic Template Adapter — Spec

**Created:** 2026-09-10  
**Status:** Approved by User, Ready for Plan  
**Authors:** Aryo Adi Putro (User), Antigravity Agent  
**Reference Template:** Canva "Gray White Modern Company Profile Presentation" ([canva.link/b69g141hevqo03n](https://canva.link/b69g141hevqo03n))  
**Target Intake:** Venturo Pro AI Content Generator (`input/brand_story_guide.md`, `input/business_knowledge_base.md`)

---

## 1. Background & Goals

### 1.1 Problem Statement
Hasil uji coba pembuatan Company Profile sebelumnya (`congen` & `congen2`) menghasilkan slide presentasi yang cenderung seragam: berbasis tema gelap (*dark corporate tech*) Reveal.js dengan aksen cyan neon pekat. Tampilan tersebut terasa terlalu generik dan tidak mencerminkan estetika desain modern yang diinginkan user.

### 1.2 Objective
Mengembangkan sistem template presentasi baru bernama **`editorial`** yang mengadaptasi bahasa visual dari template Canva **"Gray White Modern Company Profile Presentation"**:
- **Estetika Elegan & Terang:** Kanvas abu-abu terang lembut (*warm light gray*), kartu putih melayang (*floating white cards*), tipografi editorial tegas, dan aksen charcoal pekat.
- **Harmonisasi Brand Intake:** Memadukan warna resmi **Venturo Teal (`#009BAD`)** dan **Venturo Dark Teal (`#006D79`)** sebagai aksen utama (badge, nomor urut, tombol CTA, highlight metrik), bukan sekadar meniru warna asli Canva.
- **Aset Relevan:** Mengganti foto arsitektur gedung Canva dengan **Mockup Smartphone 9:16 (video vertikal ber-brand)** dan **kartu alur kerja UI/pipeline**.
- **Reusable & Dinamis:** Menjadi template modular yang menyesuaikan secara otomatis dengan panjang dan isi materi intake Markdown — **bukan di-hardcode kaku 10 slide**.

---

## 2. Design System & Design Tokens (`editorial.css`)

### 2.1 Color Hierarchy & Surface System
```css
:root {
  /* Canvas & Base Surface */
  --canvas-bg: #F4F5F7;               /* Neutral soft off-white canvas */
  --canvas-surface: #FFFFFF;          /* Pure crisp white card background */
  --surface-border: rgba(0, 0, 0, 0.08); /* Crisp subtle border */
  --surface-border-subtle: rgba(0, 0, 0, 0.04);
  --surface-shadow: 0 12px 32px rgba(0, 0, 0, 0.04);
  --surface-shadow-hover: 0 20px 40px rgba(0, 0, 0, 0.08);

  /* Contrast Blocks (Canva Style) */
  --charcoal-solid: #232220;         /* Deep warm charcoal for buttons & contrast */
  --charcoal-hover: #171615;
  --charcoal-subtle: rgba(35, 34, 32, 0.05);

  /* Typography Colors */
  --text-headline: #1A1D20;          /* High-contrast dark charcoal */
  --text-body: #4A5568;              /* Soft dark slate for comfortable reading */
  --text-muted: #718096;             /* Caption & secondary note */
  --text-inverse: #FFFFFF;           /* Text on dark/accent surfaces */

  /* Brand Accents (Venturo Pro Intake) */
  --brand-primary: #009BAD;          /* Documented Venturo Teal */
  --brand-dark: #006D79;             /* Venturo Dark Teal */
  --brand-light: #38BDF8;            /* Complementary cyan highlight */
  --brand-tint: rgba(0, 155, 173, 0.10); /* Subtle pill badge background */
  --brand-border: rgba(0, 155, 173, 0.35);

  /* Functional Status */
  --status-problem: #E53E3E;
  --status-problem-bg: rgba(229, 62, 62, 0.08);
  --status-success: #38A169;
  --status-success-bg: rgba(56, 161, 105, 0.08);
}
```

### 2.2 Typography & Scale
- **Display Font:** `Plus Jakarta Sans`, sans-serif (Weights: 700, 800). All-caps uppercase untuk judul slide utama (`letter-spacing: -0.01em` hingga `0.02em`).
- **Body Font:** `Inter`, sans-serif (Weights: 400, 500, line-height: 1.6).
- **Numbering & Badges:** Angka 2 digit tebal (`01`, `02`, `03`) berukuran besar sebagai penanda visual section yang kuat.

---

## 3. Catalog 10 Layout Archetypes

Template ini menyediakan 10 komponen layout yang dirancang modular:

| No | Archetype Class | Inspirasi Canva | Pemetaan Konten Intake | Elemen Utama |
|---|---|---|---|---|
| **01** | `.archetype-hero-cover` | Slide 01 (Cover) | Judul Perusahaan, Tagline, Primary CTA | Top navigation bar, split container (mockup HP 9:16), floating white title card, dual CTA buttons |
| **02** | `.archetype-narrative-split` | Slide 02 (About) | Problem & Dilema Biaya Creator | 50-50 split: Lead visual mockup di kiri, teks narasi di kanan + 2 kartu inset perbandingan |
| **03** | `.archetype-mission-pillars` | Slide 03 (Mission) | 2 Pilar Nilai Inti | 2 kartu kolom terstruktur ber-badge nomor besar `01` (Brand DNA) & `02` (Local GPU Predictable Cost) |
| **04** | `.archetype-workflow-3col` | Slide 04 (Vision) | Alur Pipeline Produk | 3 kolom vertikal: integrasi Google Sheets, orkestrasi copilot, dan 3 langkah eksekusi |
| **05** | `.archetype-features-staggered` | Slide 05 (Facilities) | Fitur Utama Software | Kolom kiri berisi 2 kartu fitur bernomor, kolom kanan berisi multi-frame visual timeline & subtitle editor |
| **06** | `.archetype-persona-cards` | Slide 06 (Team) | Target Audiens / Persona | 3 kartu persona terpisah: Creator Mikro, Brand Kecil & UMKM, Solo Marketer/Agency |
| **07** | `.archetype-services-grid` | Slide 07 (Services) | Paket Layanan & Format | Grid 2x2 kartu bernomor `01` s/d `04`: Script-to-video, auto-subtitles, batch sync, multi-platform |
| **08** | `.archetype-portfolio-gallery` | Slide 08 (Portfolio) | Showcase Video Ber-Brand | Galeri 4 frame video vertikal 9:16 dengan tag kategori (Edukasi, Promo Produk, Teaser) |
| **09** | `.archetype-metrics-contact` | Slide 09 (Contact & Stats) | Perbandingan Hemat Biaya & Info | 2 kartu counter metrik statistik besar + blok detail kontak WhatsApp & URL |
| **10** | `.archetype-closing-cta` | Slide 10 (Closing) | Call-to-Action Penutup | Judul besar penutup, diapit frame preview, dan tombol utama "Mulai Setup Brand DNA" |

---

## 4. Dynamic Intake-to-Archetype Chunking Engine

Sistem ini **tidak mengunci presentasi pada 10 slide**. Builder menganalisis Markdown intake dan memilih archetype secara dinamis:

```
                  Markdown Intake File
                           │
                           ▼
                 Parse Sections (H1/H2)
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
    Slide Ke-1                         Slide Berikutnya
(Selalu Cover)                         Analisis Pola Konten
  .archetype-hero-cover                      │
                                             ├─ Narasi panjang / Problem ➔ .archetype-narrative-split
                                             ├─ 2 poin pilar utama      ➔ .archetype-mission-pillars
                                             ├─ 3 langkah / workflow    ➔ .archetype-workflow-3col
                                             ├─ 3–4 fitur spesifik      ➔ .archetype-services-grid
                                             ├─ Data angka / statistik  ➔ .archetype-metrics-contact
                                             ├─ Galeri / output         ➔ .archetype-portfolio-gallery
                                             └─ Bagian akhir / kontak   ➔ .archetype-closing-cta
```

### Aturan Adaptasi Ukuran:
1. **Intake Ringkas (4–6 section):** Deck yang dihasilkan hanya 4–6 slide, memilih archetype yang paling relevan.
2. **Intake Lengkap (8–10 section):** Deck memanfaatkan katalog archetype secara penuh.
3. **Pemberian Fallback:** Jika section tidak memiliki pola khusus, sistem menggunakan layout kartu editorial standar (`.archetype-standard-editorial`) yang tetap bersih dan konsisten.

---

## 5. File Structure & Modifications

### 5.1 Template Files Baru (Plugin compro)
- **`templates/editorial/profile-shell.html`** (atau disimpan di `.claude/plugins/compro/skills/builder/templates/editorial-shell.html`):
  - Shell presentasi Reveal.js dengan tema warna default editorial.
  - Preconnect Google Fonts `Plus Jakarta Sans` dan `Inter`.
- **`templates/editorial/editorial.css`** (atau `custom-editorial.css`):
  - Berisi seluruh definisi design tokens dan 10 layout archetype.

### 5.2 Updates pada `scripts/build-deck.js`
- Menambahkan parameter CLI `--theme` (opsi: `editorial` [default] atau `legacy-dark`).
- Memperluas fungsi render slide untuk mendeteksi semantic tag Markdown atau memilih layout archetype berdasarkan struktur konten.
- Mengintegrasikan styling frame mockup smartphone (rasio 9:16) dan kartu alur kerja.

---

## 6. Verification & Quality Gate

### 6.1 Automated / Script Testing
1. **End-to-End Build Test:** Jalankan `node scripts/build-deck.js --theme=editorial` dengan input `input/brand_story_guide.md`. Pastikan exit code 0 dan file `index.html` terbentuk.
2. **Short Intake Test:** Jalankan build dengan sample markdown 4-slide. Pastikan output hanya 4 slide dan tidak ada layout yang pecah.
3. **SEO & Accessibility Audit:** Jalankan `node scripts/seo-audit.js` untuk memastikan heading hierarchy (`H1`, `H2`), contrast ratio, dan semantic HTML tetap valid.

### 6.2 Visual Inspection di Browser
- Buka slide hasil build di browser lokal.
- Verifikasi font Google Fonts ter-load sempurna.
- Verifikasi kontras teks pada kartu putih dan background abu-abu terang.
- Uji navigasi keyboard (panah kanan/kiri, spasi, overview mode Esc, dan tombol navigasi Reveal.js).

---

*Spec ini siap untuk ditinjau oleh user sebelum melangkah ke pembuatan implementation plan.*
