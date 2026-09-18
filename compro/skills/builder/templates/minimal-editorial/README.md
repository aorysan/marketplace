# Minimal Editorial Template (`minimal-editorial`)

Sistem desain presentasi Company Profile korporat modern berbasis **Canva "Gray White Modern Company Profile" (Salford & Co. 1:1)**.

---

## 1. Identitas Visual & Filosofi Desain

Template `minimal-editorial` mengadaptasi estetika majalah korporat premium (*editorial lookbook*) dengan tata letak geometris asimetris, kanvas abu-abu lembut (*soft gray*), kartu putih melayang (*floating white cards*), serta aksen kontras arang (*charcoal*).

- **Target Resolusi:** 1920×1080 piksel (Native 16:9).
- **Arsitektur Zero-Void:** Memaksimalkan kanvas 1080p tanpa ruang kosong vertikal (*zero dead space*).
- **Hirarki Visual:** Tipografi editorial kontras tinggi dengan perpaduan judul display sans berwibawa dan teks isi yang mudah dibaca.

---

## 2. Design System Tokens (`theme.css`)

### Kanvas & Permukaan
- Kanvas Utama: `--canvas-bg: #F4F5F7;`
- Kartu / Permukaan: `--canvas-surface: #FFFFFF;`
- Border: `--surface-border: rgba(0, 0, 0, 0.08);`
- Subtle Border: `--surface-border-subtle: rgba(0, 0, 0, 0.04);`
- Elevation Shadow: `--surface-shadow: 0 12px 32px rgba(0, 0, 0, 0.04);`
- Hover Elevation: `--surface-shadow-hover: 0 20px 40px rgba(0, 0, 0, 0.08);`

### Kontras Solid & Arang
- Charcoal Solid: `--charcoal-solid: #232220;`
- Charcoal Hover: `--charcoal-hover: #171615;`
- Charcoal Subtle: `--charcoal-subtle: rgba(35, 34, 32, 0.05);`

### Tipografi
- Warna Headline: `--text-headline: #1A1D20;`
- Warna Body: `--text-body: #4A5568;`
- Warna Teks Muted: `--text-muted: #718096;`
- Warna Teks Inverse: `--text-inverse: #FFFFFF;`
- Font Display / Judul: `'Plus Jakarta Sans', sans-serif;` (Weight 700, 800)
- Font Body / Teks Isi: `'Inter', sans-serif;` (Weight 400, 500, 600)

### Warna Brand & Aksen
- Primary Brand: `--brand-primary: #009BAD;` (Venturo Teal)
- Dark Accent: `--brand-dark: #006D79;`
- Light Accent: `--brand-light: #38BDF8;`
- Brand Tint: `--brand-tint: rgba(0, 155, 173, 0.10);`
- Brand Border: `--brand-border: rgba(0, 155, 173, 0.35);`

---

## 3. Arketipe Layout (8 Layout Families / 9 Archetypes)

| Arketipe | Slot ID | Deskripsi Layout |
|---|---|---|
| `cover` | `hero` | Slide pembuka dengan visual fotografi arsitektur, title block, dan badge resmi |
| `welcome-problem` | `problem` | Layout split 2-kolom: narasi masalah industri & kartu konteks |
| `welcome-solution` | `solution` | Layout split 2-kolom: proposisi nilai & positioning solusi |
| `services` | `services` | Bento grid 3 atau 4 kartu layanan dengan ikon & fitur utama |
| `ecosystem` | `ecosystem` | Diagram alur / framework pilar metodologi terstruktur |
| `metrics` | `metrics` | Kartu stat callout dengan angka besar kontras tinggi & bukti kualitatif |
| `differentiator` | `differentiator` | Matriks perbandingan keunggulan kompetitif / kapabilitas kunci |
| `pricing` | `pricing` | Paket komersial bertingkat (*tiered pricing*) dengan highlight tier unggulan |
| `closing` | `closing` | Slide penutup dengan informasi kontak lengkap, badge legalitas, & CTA |

---

## 4. Struktur File Bundle

```text
skills/builder/templates/minimal-editorial/
├── manifest.json   # Registrasi metadata, slot, archetypes, & file pointer
├── shell.html      # Reveal.js HTML presentation shell (1920x1080)
├── theme.css       # Complete standalone stylesheet & CSS tokens
├── README.md       # Dokumentasi spesifikasi sistem desain
└── slides/         # Referensi visual slide Canva Salford & Co.
```
