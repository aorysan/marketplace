# Template Consolidation & Standardization Design Spec

**Date:** 2026-09-17  
**Status:** Validated & Approved by User  
**Authors:** Aryo Adi Putro (User), Antigravity Agent  
**Target Scope:** `compro` plugin (`skills/builder/templates`)

---

## 1. Background & Problem Statement

Sistem generator presentasi Company Profile (`compro` plugin) saat ini memiliki template yang belum terstandardisasi dan tersebar di dua lokasi yang berbeda:
1. **Template 1 (Canva Salford & Co. / Eks-Editorial):** Terletak di `.claude/plugins/compro/skills/builder/templates/`, namun file-filenya masih terpecah antara subfolder `editorial/` dan file longgar di root template (`editorial.css`, `editorial-shell.html`). Selain itu, belum ada tangkapan layar `slides/` dan dokumentasi terpadu di dalam folder tersebut.
2. **Template 2 (Canva Ingoude Company / Eks-Template2):** Masih berada di luar direktori builder, yaitu di `input/template2/` (dan salinan root `./template2`). Folder ini baru berisi data scraping (`README.md`, `slides.json`, dan 15 screenshot `slides/`), namun belum memiliki kode runtime (`manifest.json`, `shell.html`, `theme.css`) untuk dapat dieksekusi langsung oleh builder.
3. **Penamaan Belum Deskriptif:** Kedua template belum memiliki identitas nama yang mencerminkan gaya desain visualnya secara eksplisit.

---

## 2. Goals & Key Decisions

1. **Konsolidasi ke Direktori Builder:** Memindahkan seluruh data Template 2 ke dalam folder resmi builder: `.claude/plugins/compro/skills/builder/templates/`.
2. **Standardisasi Format Mandiri (*Self-Contained Bundle*):** Setiap template wajib memiliki struktur file yang simetris dan mandiri:
   - `manifest.json` (metadata, mapping archetype & slots, nama renderer)
   - `shell.html` (Reveal.js template shell dengan metadata injection)
   - `theme.css` (design system tokens, typography, bento grid layouts)
   - `README.md` (dokumentasi sistem desain, token warna, hierarki layout)
   - `slides/` (tangkapan layar slide referensi Canva HD)
   - `slides.json` (data ekstraksi komponen visual Canva jika tersedia)
3. **Penamaan Tema Berdasarkan Karakteristik Gaya Visual:**
   - **`minimal-editorial`** (Template 1): Gaya korporat editorial terinspirasi Canva Salford & Co. dengan kanvas abu-abu lembut (`#F4F5F7`), kartu putih melayang (`#FFFFFF`), aksen charcoal (`#232220`), dan tipografi editorial berwibawa.
   - **`electric-modern`** (Template 2): Gaya kontras tinggi (*high-contrast modern*) terinspirasi Canva Ingoude Company dengan paduan Dark Slate Navy (`#122029`), kanvas putih bersih (`#ffffff`), aksen **Electric Lime / Neon Yellow-Green (`#dbff00`)**, pill badges, dan rounded cards (`#f5f5f5`).
4. **Jaminan Kompatibilitas Mundur (*Backward Compatibility*):**
   - Engine `build-deck.js` menyediakan alias otomatis dari `editorial` ke `minimal-editorial`. Panggilan CLI lama seperti `--theme=editorial` akan tetap bekerja 100% tanpa error.
   - Root `templates/` dibersihkan dari file-file CSS/HTML yang tercecer.

---

## 3. Directory Structure Specification

### Direktori Sebelum:
```text
skills/builder/templates/
├── editorial/
│   └── manifest.json
├── modern/
│   ├── manifest.json
│   ├── shell.html
│   └── theme.css
├── profile/
│   └── manifest.json
├── editorial-shell.html
├── editorial.css
├── profile-shell.html
├── custom.css
└── assets/
input/template2/
├── README.md
├── slides.json
└── slides/ (15 PNGs)
```

### Direktori Sesudah:
```text
skills/builder/templates/
├── minimal-editorial/                     # [Template 1: Canva Salford & Co.]
│   ├── manifest.json                      # cssFile: "theme.css", shellFile: "shell.html"
│   ├── shell.html                         # Dipindahkan & dirapikan dari editorial-shell.html
│   ├── theme.css                          # Dipindahkan & dirapikan dari editorial.css
│   ├── README.md                          # Dokumentasi sistem desain Salford & Co.
│   └── slides/                            # Referensi visual slide HD
│
├── electric-modern/                       # [Template 2: Canva Ingoude Company]
│   ├── manifest.json                      # Deklarasi 10+ archetypes & slots
│   ├── shell.html                         # Reveal.js presentation shell
│   ├── theme.css                          # High-contrast tokens (#122029, #dbff00, #ffffff)
│   ├── README.md                          # Dipindahkan dari input/template2/README.md
│   ├── slides.json                        # Dipindahkan dari input/template2/slides.json
│   └── slides/                            # 15 file slide_01.png - slide_15.png
│
├── modern/                                # [Template 3: Bento Grid Modern Dark Slate]
│   ├── manifest.json
│   ├── shell.html
│   └── theme.css
│
├── profile/                               # [Legacy Corporate Slate Cyan]
│   ├── manifest.json
│   ├── shell.html                         # Dipindahkan dari profile-shell.html
│   └── theme.css                          # Dipindahkan dari custom.css
│
└── assets/                                # Shared SVG vector fallbacks
    └── fallback/
        ├── hero-fallback.svg
        ├── problem-fallback.svg
        ├── solution-fallback.svg
        ├── services-fallback.svg
        ├── metrics-fallback.svg
        └── closing-fallback.svg
```

---

## 4. Visual System & Token Specification: `electric-modern`

### 4.1 Token Warna (`theme.css`)
```css
:root {
  /* Canvas & Surface System */
  --canvas-bg: #ffffff;                    /* Pure crisp white main background */
  --canvas-dark: #122029;                  /* Dark Slate Navy for hero & closing covers */
  --canvas-surface: #f5f5f5;               /* Surface card gray container */
  --canvas-surface-hover: #ebebeb;
  --surface-border: rgba(18, 32, 41, 0.08);/* Subtle border */
  --surface-border-subtle: rgba(18, 32, 41, 0.04);
  --surface-shadow: 0 10px 30px rgba(18, 32, 41, 0.05);
  --surface-shadow-hover: 0 18px 36px rgba(18, 32, 41, 0.1);

  /* Contrast Solids & Accents */
  --slate-navy-solid: #122029;            /* Deep corporate slate navy */
  --accent-lime: #dbff00;                 /* Electric Lime / Neon Yellow-Green primary accent */
  --accent-lime-hover: #c8eb00;
  --accent-lime-glow: rgba(219, 255, 0, 0.4);
  --slate-subtle: #2b485f;                /* Dark pill / secondary tab */
  --slate-muted: #598196;                 /* Muted teal slate for captions */
  --olive-lime: #96ae00;                  /* Secondary lime accent */

  /* Typography Colors */
  --text-headline: #122029;
  --text-body: #334155;
  --text-muted: #64748b;
  --text-inverse: #ffffff;
  --text-on-lime: #122029;                /* High contrast text on neon lime */

  /* Corner Radii */
  --radius-pill: 9999px;                  /* Pill badge shape */
  --radius-card: 20px;                    /* Rounded cards */
  --radius-card-lg: 24px;
}
```

### 4.2 Tipografi
* **Display / Headline:** `Plus Jakarta Sans`, sans-serif (700, 800) uppercase tracked
* **Body / Description:** `Inter`, sans-serif (400, 500, 600)
* **Badges & Numbers:** `Plus Jakarta Sans`, sans-serif (600, 700)

### 4.3 Karakteristik Komponen Visual
1. **Pill Badges:** Kapsul bulat (`border-radius: 9999px`) berwarna latar `--accent-lime` dengan teks gelap `--slate-navy-solid`.
2. **Cover & Closing Slides:** Latar belakang penuh Dark Slate Navy (`#122029`) berpadu dengan aksen teks putih dan badge Electric Lime.
3. **Content Slides:** Latar belakang putih (`#ffffff`), kartu abu-abu (`#f5f5f5`), dan border lembut untuk kenyamanan membaca.

---

## 5. Engine Updates & Backward Compatibility (`build-deck.js`)

### 5.1 Resolusi Manifest (`loadThemeManifest`)
* Menambahkan `minimal-editorial` dan `electric-modern` ke daftar tema resmi.
* Mengimplementasikan mapping alias:
  ```javascript
  const THEME_ALIASES = {
    'editorial': 'minimal-editorial'
  };
  ```
  Jika input adalah `'editorial'`, engine secara transparan menyelesaikannya ke `'minimal-editorial'`.
* Path file `manifest.json`, `shellFile`, dan `cssFile` di-resolve langsung di dalam folder tema `templates/<theme-name>/`.

### 5.2 Standarisasi Manifest File
Setiap `manifest.json` tema wajib mematuhi skema:
```json
{
  "name": "electric-modern",
  "version": "2.6.0",
  "archetypes": ["cover", "profile", "welcome", "story", "problem", "solution", "services", "ecosystem", "metrics", "differentiator", "pricing", "closing"],
  "slots": {
    "cover": "hero",
    "profile": "profile",
    "welcome": "welcome",
    "story": "story",
    "problem": "problem",
    "solution": "solution",
    "services": "services",
    "ecosystem": "ecosystem",
    "metrics": "metrics",
    "differentiator": "differentiator",
    "pricing": "pricing",
    "closing": "closing"
  },
  "cssFile": "theme.css",
  "shellFile": "shell.html",
  "renderer": "electric-modern"
}
```

---

## 6. Verification & Testing Plan

1. **Uji Validitas File Struktur:**
   - Script verifikasi untuk mengecek kehadiran `manifest.json`, `shell.html`, `theme.css`, `README.md`, dan `slides/` di setiap subfolder tema.
2. **Uji Theme Dispatcher (`scripts/test-theme-dispatch.js`):**
   - Memastikan `loadThemeManifest('minimal-editorial')` sukses.
   - Memastikan `loadThemeManifest('electric-modern')` sukses.
   - Memastikan `loadThemeManifest('editorial')` mengarah ke `minimal-editorial` tanpa warning / error.
   - Memastikan fallback tema tidak dikenal tetap aman.
3. **Uji Kompilasi E2E Deck:**
   - Menjalankan `build-deck.js` menggunakan `--theme=electric-modern` dan `--theme=minimal-editorial` untuk memastikan file presentasi HTML ter-generate dengan inlined CSS dan placeholder slide yang terisi penuh.
4. **Verifikasi Test Suite Global Plugin:**
   - Menjalankan `node scripts/test-all.js` dan memastikan seluruh pengujian berstatus PASS.
