# APERTURE Cinematic Minimalist Design System
> Scraped & extracted directly from Figma Make: [Product Presentation Slide](https://www.figma.com/make/9jRfjhszCQ8qN7jIttghn8/Product-Presentation-Slide?t=xBANIUQgQEB02NH8-1)
> Stored as standalone HTML/CSS in `assets/figma-presentation/` and original React/Tailwind source in `assets/figma-presentation/source/`.

---

## 🎨 Design Philosophy & Aesthetics

1. **Cinematic Dark & Light Contrast**: High impact, editorial typography with heavy full-bleed visuals, duotone/grayscale treatment, and crisp vermilion (`#ff3b1d`) accents.
2. **Oversized Typography Hierarchy**:
   - Hero headlines: 6rem to 9rem with ultra-tight leading (`leading: 0.85` to `0.95`).
   - Ghost background typography (`#f1f1f1`, text-22rem) for subtle editorial depth.
   - Monospaced kickers (`font-mono`, `text-[11px]`, `tracking-[0.3em]`, uppercase) acting as technical category badges.
3. **Information Density & Structured Grids**:
   - 12-column grid splits (3:9, 4:8) and 50/50 splits.
   - Clean 1px border dividers (`divide-border`, `bg-border` with `gap-px`) for metrics and pricing tiers.
   - Glassmorphism on dark slides: `backdrop-filter: blur(12px)` over darkened photography.

---

## 🗂️ Color Palette Tokens

| Token Name | Hex Value | Usage |
|---|---|---|
| `--background` | `#ffffff` | Light slide background |
| `--foreground` | `#0a0a0a` | Primary text and dark card background |
| `--muted-foreground` | `#6b6b6b` | Secondary text, captions, slide metadata |
| `--accent` | `#ff3b1d` / `#ff3b00` | Vermilion accent: kickers, active dots, featured buttons |
| `--border` | `#e4e4e4` | Clean hairline grid and card borders |
| `--ghost` | `#f1f1f1` | Giant decorative ghost letters |
| `--hover-bg` | `#fafafa` | Row hover highlight |
| Dark Surface | `#000000` | Cover slide and USP slide dark canvas |
| Glass Surface | `rgba(0, 0, 0, 0.45)` | Frosted glass cards on dark slides |

---

## ✍️ Typography Tokens

```css
--font-display: 'Archivo', sans-serif;   /* weights: 600, 700, 800 */
--font-body: 'Inter', sans-serif;         /* weights: 400, 500, 600 */
--font-mono: 'JetBrains Mono', monospace;/* weights: 400, 500 */
```

- **Google Fonts Import**:
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
```

---

## 📐 Slide Archetypes (6 Templates)

### 1. `cover` — Full-Bleed Cinematic Hero
- **Visual**: Full-bleed dark photography with double gradient overlay (radial/vertical fade to black).
- **Layout**: Full viewport flex column (top meta rail + giant headline bottom-anchored).
- **Elements**: Brand/division tag, status indicator with glowing accent dot (`● Now shipping`), vermilion kicker, massive headline (9rem), lead subtitle.

### 2. `problem` — Asymmetric Split with Ghost Watermark
- **Visual**: 4-col left grayscale imagery + 8-col right text.
- **Layout**: 12-column grid. Giant background ghost text ("NO") positioned absolute bottom-right.
- **Elements**: Kicker, bold headline, 3-item numbered list with hover interaction (`hover:bg-[#fafafa]`, num in vermilion, title + description right-aligned).

### 3. `product` — 50/50 Macro & Spec Matrix
- **Visual**: Left 50% macro product image with floating glass badge (`Machined aluminium · IP54`).
- **Layout**: 2-column grid. Right side contains headline, descriptive paragraph, and a 2x2 high-contrast stat block.
- **Elements**: 4 key metrics with big numbers (`0.9s`, `14`, `214g`, `140m`) and uppercase mono labels.

### 4. `features` — Rail Image + Giant Numbered List
- **Visual**: Left 3-col vertical image with 90° rotated technical caption rail (`[writing-mode:vertical-rl] rotate-180`).
- **Layout**: Right 9-col container. Top border divider with archetype indicator (`04 / features`).
- **Elements**: 4 feature rows with giant numbers (`01`–`04` in `#e4e4e4` that turn vermilion on hover), title, and right-aligned detail text.

### 5. `usp` / `why-it-wins` — Frosted Glass Trio
- **Visual**: Full-bleed dark viewfinder background with vertical gradient.
- **Layout**: Centered content with 3-column frosted glass cards (`backdrop-blur-sm`, `bg-black/40`, 1px white border).
- **Elements**: Each card features kicker tag, card counter (`01`), giant stat (`0.9s`, `14`, `214g`), title, and explanation.

### 6. `pricing` — Vertical Image Rail + Tier Matrix
- **Visual**: Left 3-col image rail with "Ship it." watermark and worldwide shipping tag.
- **Layout**: Right 9-col container with 3 pricing tiers.
- **Elements**:
  - Regular tier: Light background, black outline button.
  - Featured tier (`ONE Rig`): Inverted `#0a0a0a` black background, white text, vermilion filled CTA button.
  - Features checklist with vermilion bullet squares.

---

## 🕹️ Shell Chrome & Controls

- **Top Rail**:
  - Left: Brand title (`APERTURE`) + Mono subtitle (`Pocket Cinema · Product Deck`).
  - Right: Mono slide counter (`01 / 06`).
- **Progress Line**:
  - 3px height hairline bar at top of stage, fills dynamically from 0% to 100% with vermilion accent.
- **Bottom Rail**:
  - Left: Dot navigation for each slide with labels (`Cover`, `Problem`, `Product`, etc.). Active dot pulses vermilion.
  - Right: Minimalist square arrow buttons (`←` and `→`).
- **Keyboard Shortcuts**:
  - `ArrowRight` / `PageDown` / `Space`: Next slide.
  - `ArrowLeft` / `PageUp`: Previous slide.
  - `Home`: First slide.
  - `End`: Last slide.
