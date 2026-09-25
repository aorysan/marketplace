# Modern Template (`modern`) — Aperture Cinematic Minimalist

Sistem desain presentasi Company Profile sinematik berbasis **Aperture Cinematic Minimalist** (scrape Figma 1:1), runtime standalone zero-dependency (Vanilla HTML5/CSS3/JS).

---

## 1. Identitas Visual & Filosofi Desain

Template `modern` mengusung estetika cinematic editorial: kontras dark/light penuh full-bleed visual, tipografi display berbobot tinggi, kicker monospaced teknis, dan aksen vermilion.

- **Target Resolusi:** 1920×1080 piksel (Native 16:9).
- **Runtime:** Standalone Vanilla HTML5/CSS3/JS — tanpa CDN Reveal.js atau library eksternal.
- **Tipografi:** *Archivo* untuk display headline, *Inter* untuk body, *JetBrains Mono* untuk category kickers/counter/label.

---

## 2. Design System Tokens (`theme.css`)

### Surface & Palette
- Background: `--background: #ffffff;`
- Foreground: `--foreground: #0a0a0a;`
- Muted: `--muted-foreground: #6b6b6b;`
- Accent: `--accent: var(--brand-primary, #ff3b1d);`
- Border: `--border: #e4e4e4;`
- Ghost: `--ghost: #f1f1f1;`
- Hover: `--hover-bg: #fafafa;`
- Dark Surface: `#000000` (cover / USP canvas)
- Glass Surface: `rgba(0, 0, 0, 0.45)` (frosted cards on dark slides)

### Tipografi
- Display: `--font-display: 'Archivo', sans-serif;` (weights 600–800)
- Body: `--font-body: 'Inter', sans-serif;` (weights 400–600)
- Mono: `--font-mono: 'JetBrains Mono', monospace;` (weights 400–500)

---

## 3. Arketipe Layout (7 Core)

**SSOT:** daftar ini harus identik dengan `CINEMATIC_ARCHETYPES` +
`CINEMATIC_SLOT_MAP` di `scripts/themes/modern.js` dan `archetypes`/`slots` di
`manifest.json`. Dijaga otomatis oleh `scripts/test-cinematic-classifier.js`.

| Arketipe | Slot default | Deskripsi Layout |
|---|---|---|
| `cover` | `hero` | Full-bleed cinematic hero, gradient overlay ganda, status pill, headline raksasa, **glass stat strip** untuk 2–3 statistik kunci |
| `problem` | `problem` | 12-col split (4-col grayscale image + 8-col text), ghost watermark "NO", 3-item numbered list |
| `product` | `macro` | 50/50 macro image + spec matrix, floating glass badge, 2×2 stat block (degradasi ke label-only saat bullet tidak membawa angka) |
| `features` | `hands` | Rail image vertikal + 4 baris fitur bernomor `01`–`04` |
| `usp` | `viewfinder` | Dark canvas full-bleed + 3 frosted glass cards |
| `pricing` | `lens` | Vertical image rail + 3 tier matrix (featured tier inverted) |
| `closing` | `closing` | Rail image "Langkah berikutnya" + headline, `closing-notes` (komitmen/benefit), `closing-contacts` (matriks 2-kolom ikon+label+nilai), dan CTA vermilion |

**Fallback:** arketipe `pricing` tanpa tabel/item apa pun turun ke layout
`features`; arketipe `closing` tanpa kontak tetap render headline + CTA tanpa
matriks kontak (selalu ada `console.warn`).

---

## 4. Struktur File Bundle

```text
skills/builder/templates/modern/
├── manifest.json   # Registrasi metadata tema, 7 archetypes, slots, renderer
├── shell.html      # Standalone Aperture deck shell (1920x1080)
├── theme.css       # Aperture Cinematic stylesheet & tokens
└── README.md       # Dokumentasi spesifikasi template modern
```

---

## 5. Shell Chrome & Controls

- **Top rail:** Brand title + subtitle kiri, slide counter (`01 / 06`) kanan.
- **Progress line:** Hairline 3px di atas stage, terisi vermilion mengikuti progres slide.
- **Bottom rail:** Dot navigation per slide (label + active pulse vermilion) + tombol ←/→.
- **Keyboard:** `ArrowRight`/`PageDown`/`Space` next; `ArrowLeft`/`PageUp` prev; `Home`/`End` first/last.

---

## 6. Asset Slot Fallback

Cascading fallback per slot: Openverse image search ➔ curated Unsplash CDN ➔
Lorem Picsum ➔ local SVG.

- Slot `.jpg` direferensikan sebagai `assets/slide-N-<slot>.jpg`.
- Fallback SVG di-inline sebagai `data:image/svg+xml;base64,...` — **bukan** `<img src="assets/*.svg">` (zero broken image, golden assertion aman walau network Tier-3).
- `resolveSlideParams` memakai slot default arketipe hanya bila draf tidak membawa
directive `<!-- image: <slot> -->`; directive selalu menang.

---

## 7. Bahasa & Localization

Deck dirender sebagai `<html lang="id">`, jadi **semua default chrome berbahasa
Indonesia**: `Masalahnya`, `Cara lama`, `Produk`, `Fitur utama`,
`Semua yang Anda butuhkan`, `Mengapa kami`, `Pilih paket`, `Siap mulai.`,
`Pendampingan dari awal`, `Hubungi kami`, `Langkah berikutnya`. Setiap default bisa
ditimpah dari slide (`kicker`, `caption`, `railLabel`, `railTitle`, `railSub`).
