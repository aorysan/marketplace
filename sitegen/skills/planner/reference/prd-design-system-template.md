# PLAN-DESIGN-SYSTEM — [Nama Brand]

> Dokumen ini berisi spesifikasi teknis design system yang wajib digunakan oleh skill `generator` saat membuat kode setiap halaman. Dibuat oleh skill `planner` mode `design-system`, berdasarkan PLAN-GLOBAL.md. Semua nilai harus spesifik (angka, hex code, weight) — DILARANG nilai ambigu.

---

## 1. Color System

### Primary Palette
| Token Name | Hex | Penggunaan |
|---|---|---|
| `--color-primary` | [#XXXXXX] | CTA button, accent utama, link aktif |
| `--color-primary-light` | [#XXXXXX] | Hover state button, background highlight ringan |
| `--color-primary-dark` | [#XXXXXX] | Pressed state, shadow pada elemen primary |

### Secondary Palette
| Token Name | Hex | Penggunaan |
|---|---|---|
| `--color-secondary` | [#XXXXXX] | Section background alternating, card accent |
| `--color-secondary-light` | [#XXXXXX] | Subtle background highlight |
| `--color-secondary-dark` | [#XXXXXX] | Border, divider |

### Neutral Palette
| Token Name | Hex | Penggunaan |
|---|---|---|
| `--color-dark` | [#XXXXXX] | Background utama (dark mode), heading teks |
| `--color-gray-800` | [#XXXXXX] | Body teks utama |
| `--color-gray-500` | [#XXXXXX] | Placeholder, caption, teks sekunder |
| `--color-gray-100` | [#XXXXXX] | Background section light |
| `--color-white` | `#FFFFFF` | Background card, teks on dark |

### Semantic Colors
| Token Name | Hex | Penggunaan |
|---|---|---|
| `--color-success` | `#22C55E` | Status berhasil, badge aktif |
| `--color-error` | `#EF4444` | Validasi error, pesan gagal |
| `--color-warning` | `#F59E0B` | Peringatan, status pending |
| `--color-info` | `#3B82F6` | Informasi, tooltip |

> **Aturan Kontras Warna (WAJIB):** Primary gelap → Secondary HARUS terang (dan sebaliknya). DILARANG 2 warna gelap berdampingan sebagai pasangan utama.

---

## 2. Typography Scale

| Token | Font Family | Size | Weight | Line-Height | Penggunaan |
|---|---|---|---|---|---|
| `--text-h1` | [Font Heading] | 3rem / 48px | 700 | 1.2 | Hero headline, page title utama |
| `--text-h2` | [Font Heading] | 2.25rem / 36px | 700 | 1.3 | Section title |
| `--text-h3` | [Font Heading] | 1.75rem / 28px | 600 | 1.4 | Sub-section title, card title besar |
| `--text-h4` | [Font Heading] | 1.25rem / 20px | 600 | 1.5 | Accordion title, list heading |
| `--text-body-lg` | [Font Body] | 1.125rem / 18px | 400 | 1.6 | Hero subheadline, lead paragraph |
| `--text-body` | [Font Body] | 1rem / 16px | 400 | 1.6 | Paragraf umum, deskripsi card |
| `--text-body-sm` | [Font Body] | 0.875rem / 14px | 400 | 1.5 | Caption, label, badge |
| `--text-caption` | [Font Body] | 0.75rem / 12px | 400 | 1.4 | Footer teks, timestamp |

> **Aturan Copyfitting (dari planner/SKILL.md):**
> - Hero headline (H1): maksimal 7 kata / 25-40 karakter
> - Section title (H2): maksimal 5 kata
> - CTA button text: maksimal 3 kata

---

## 3. Spacing Scale (berbasis 4px grid)

| Token | Value | Penggunaan Umum |
|---|---|---|
| `--space-1` | 4px | Gap ikon dengan teks, micro spacing |
| `--space-2` | 8px | Padding internal badge, gap elemen kecil |
| `--space-3` | 12px | Gap dalam card kompak |
| `--space-4` | 16px | Padding card standar, gap list item |
| `--space-6` | 24px | Margin bawah heading, gap antar elemen sedang |
| `--space-8` | 32px | Padding section horizontal (mobile) |
| `--space-12` | 48px | Padding section vertikal (tablet) |
| `--space-16` | 64px | Padding section vertikal (desktop) |
| `--space-24` | 96px | Gap antar section besar |

---

## 4. Border Radius System

| Token | Value | Penggunaan |
|---|---|---|
| `--radius-sm` | 4px | Badge, tag kecil |
| `--radius-md` | 8px | Input field, dropdown |
| `--radius-lg` | 12px | Card standar, button |
| `--radius-xl` | 16px | Card besar, modal |
| `--radius-2xl` | 24px | Hero card, featured section |
| `--radius-full` | 9999px | Pill button, avatar, tag rounded |

---

## 5. Grid & Layout System

| Breakpoint | Kondisi Width | Container Max-Width | Jumlah Kolom |
|---|---|---|---|
| Mobile (sm) | < 640px | 100% dengan padding 16px | 4 |
| Tablet (md) | 640px – 1024px | 720px | 8 |
| Desktop (lg) | 1024px – 1280px | 1024px | 12 |
| Wide (xl) | > 1280px | 1200px | 12 |

> **Catatan untuk Generator:** Gunakan nilai container max-width ini sebagai acuan lebar konten. Semua section WAJIB responsif di keempat breakpoint ini.

---

## 6. Component Specs

### 6.1. Button Variants

| Variant | Background | Text Color | Border | Padding | Hover State |
|---|---|---|---|---|---|
| Primary | `--color-primary` | `#FFFFFF` | Tidak ada | 12px 24px | Darken 10%, `transform: scale(1.02)` |
| Secondary | Transparan | `--color-primary` | 2px solid `--color-primary` | 10px 22px | Fill dengan primary, text menjadi white |
| Ghost | Transparan | `--color-gray-800` | Tidak ada | 12px 24px | Background `--color-gray-100` |
| Danger | `--color-error` | `#FFFFFF` | Tidak ada | 12px 24px | Darken 10% |

> **Aturan CTA Utama Halaman:** Gunakan variant Primary. Padding minimum: 16px 32px. Font size: `--text-body` (16px).

### 6.2. Card Style

| Property | Value |
|---|---|
| Background | `--color-white` |
| Border Radius | `--radius-lg` (12px) |
| Shadow Default | `0 2px 8px rgba(0, 0, 0, 0.08)` |
| Padding | `--space-6` (24px) |
| Hover Shadow | `0 8px 24px rgba(0, 0, 0, 0.12)` |
| Hover Transform | `translateY(-2px)` |
| Transition | `all 0.2s ease` |

### 6.3. Navbar Style

| Property | Value |
|---|---|
| Background | Glassmorphism: `backdrop-filter: blur(12px); background: rgba(255, 255, 255, 0.85)` |
| Position | `sticky top-0` |
| Z-Index | `1000` |
| Height Desktop | 72px |
| Height Mobile | 64px |
| Logo | WAJIB menggunakan aset dari `public/assets/` — DILARANG teks placeholder |

### 6.4. Form & Input Style

| Property | Value |
|---|---|
| Border Default | `1px solid --color-gray-300` |
| Border Radius | `--radius-md` (8px) |
| Padding | 12px 16px |
| Focus Border | `--color-primary` |
| Focus Shadow | `0 0 0 3px rgba(primary, 0.2)` |
| Error State Border | `--color-error` |
| Placeholder Color | `--color-gray-500` |
