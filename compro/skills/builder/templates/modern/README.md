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

## 3. Arketipe Layout (6 Core)

| Arketipe | Slot ID | Deskripsi Layout |
|---|---|---|
| `cover` | `hero` | Full-bleed cinematic hero, gradient overlay ganda, status pill, headline raksasa |
| `problem` | `problem` | 12-col split (4-col grayscale image + 8-col text), ghost watermark "NO", numbered list |
| `product` | `macro` | 50/50 macro image + spec matrix, floating glass badge, 2×2 stat block |
| `features` | `hands` | Rail image vertikal + 4 baris fitur bernomor `01`–`04` |
| `usp` | `viewfinder` | Dark canvas full-bleed + 3 frosted glass cards |
| `pricing` | `lens` | Vertical image rail + 3 tier matrix (featured tier inverted) |

---

## 4. Struktur File Bundle

```text
skills/builder/templates/modern/
├── manifest.json   # Registrasi metadata tema, 6 archetypes, slots, renderer
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

Cascading fallback per slot: Direct Unsplash CDN ➔ Lorem Picsum ➔ local SVG.

- Slot `.jpg` direferensikan sebagai `assets/slide-N-<slot>.jpg`.
- Fallback SVG di-inline sebagai `data:image/svg+xml;base64,...` — **bukan** `<img src="assets/*.svg">` (zero broken image, golden assertion aman walau network Tier-3).
