# Design Tokens Reference — Aperture Cinematic Minimalist

> **Self-contained design intelligence for the `builder` skill.**  
> Derived from the Figma Make *Product Presentation Slide* design system, tailored specifically for **1920×1080 (16:9) Aperture Cinematic Minimalist presentation decks (standalone zero-dependency HTML5/CSS3/JS presentation engine)**.

---

## 1. Aperture Cinematic Color Palette System

The Aperture Cinematic Minimalist deck uses a high-contrast editorial color system with crisp vermilion (`#ff3b1d`) accents, light-mode and dark-mode slide canvases, and subtle ghost watermarks.

### 1.1 Official Color Tokens

| Token Name | Hex / Value | Usage & Role |
|---|---|---|
| `--background` | `#ffffff` | Light slide background canvas |
| `--foreground` | `#0a0a0a` | Primary text and dark card background |
| `--muted-foreground` | `#6b6b6b` | Secondary text, captions, slide metadata, mono labels |
| `--accent` | `var(--brand-primary, #ff3b1d)` | Vermilion accent: category kickers, active dots, featured CTA |
| `--accent-glow` | `rgba(255, 59, 29, 0.2)` | Glowing pulse on active status dot and interactive elements |
| `--border` | `#e4e4e4` | Clean hairline 1px grid, matrix, and card borders |
| `--ghost` | `#f1f1f1` | Giant decorative ghost watermark letters (22rem) |
| `--hover-bg` | `#fafafa` | Row hover highlight in list and feature items |
| Dark Surface | `#000000` | Full-bleed black canvas for `cover` and `usp` slides |
| Glass Surface | `rgba(0, 0, 0, 0.45)` | Frosted glass cards on dark slides (`backdrop-filter: blur(12px)`) |

### 1.2 Brand Color Dynamic Overrides

The primary accent defaults to vermilion (`#ff3b1d`), but client brand colors can be dynamically injected via `--brand-primary`:

```css
:root {
  /* Dynamic Client Brand Override (Defaults to Vermilion #ff3b1d) */
  --brand-primary: #ff3b1d;

  /* Official Aperture Cinematic Minimalist Tokens */
  --background: #ffffff;
  --foreground: #0a0a0a;
  --muted-foreground: #6b6b6b;
  --accent: var(--brand-primary, #ff3b1d);
  --accent-glow: rgba(255, 59, 29, 0.2);
  --border: #e4e4e4;
  --ghost: #f1f1f1;
  --hover-bg: #fafafa;
}
```

### 1.3 Preset Industry Accent Palettes

When generating company profiles for specific industries, `--brand-primary` can be adapted while preserving the Aperture Cinematic contrast foundation:

| Industry / Theme | Accent Hex | Personality | Accent Role |
|---|---|---|---|
| **Cinematic / Hardware (Default)** | `#ff3b1d` | Bold, precise, editorial | Vermilion kickers & CTAs |
| **Tech / IT Enterprise** | `#009bad` | Modern, authoritative, crisp | Teal kickers & active dots |
| **B2B SaaS / Corporate** | `#2563eb` | Authoritative, secure, structured | Royal blue highlights |
| **Fintech / Wealth** | `#0d9488` | Stable, prosperous, precise | Deep emerald accents |
| **Creative Agency / Design** | `#8b5cf6` | Innovative, expressive, bold | Violet accents & buttons |
| **Industrial / Logistics** | `#f97316` | Dynamic, energetic, dependable | Amber-orange accents |

---

## 2. Typography Scale (1920×1080 16:9 Presentation)

Presentation typography requires large optical hierarchy, tight display leading, and clean monospaced meta labels to command attention across the 1920×1080 canvas.

### 2.1 Font Family Tokens

```css
--font-display: 'Archivo', -apple-system, BlinkMacSystemFont, sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

**Google Fonts Import:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
```

### 2.2 Scale Breakdown

| Role | Size | Weight | Line Height | Tracking | Font Family | Usage |
|---|---|---|---|---|---|---|
| **Giant Hero Headline** | `6rem` – `9rem` | `800` | `0.88` | `-0.04em` | Archivo | Cover slide company title |
| **Slide Title (H1)** | `2.5rem` – `3.25rem` | `700` | `1.05` | `-0.03em` | Archivo | Main slide headline |
| **Section Header (H2)** | `1.5rem` – `2.0rem` | `600` | `1.20` | `-0.02em` | Archivo | Section headings & card titles |
| **Big Stat Number** | `3.5rem` – `5.0rem` | `800` | `0.95` | `-0.03em` | Archivo | Spec matrix & USP stat counters |
| **Lead / Subtitle** | `1.125rem` – `1.25rem` | `400` | `1.45` | `0` | Inter | Hero lead & section intros |
| **Body Regular** | `0.9375rem` – `1.0rem` | `400` | `1.60` | `0` | Inter | Explanatory copy, card bodies |
| **Category Kicker** | `11px` (`0.6875rem`) | `500` | `1.0` | `+0.30em` | JetBrains Mono | Uppercase category tags |
| **Slide Counter & Meta** | `12px` (`0.75rem`) | `500` | `1.0` | `+0.15em` | JetBrains Mono | Deck header `01 / 06` counter |
| **Ghost Watermark** | `18rem` – `22rem` | `800` | `0.80` | `-0.05em` | Archivo | Decorative backdrop letters |

### 2.3 Typographic Rules & Constraints

1. **Ultra-Tight Display Leading:** Large Archivo headlines must maintain tight line-height (`0.85` to `0.95`) to preserve cinematic punch without vertical bloat.
2. **Monospaced Category Kickers:** Category labels must always be rendered in `JetBrains Mono`, uppercase, with letter-spacing `0.3em` and accent color `--accent`.
3. **Line Measure Limit:** Body paragraphs must not exceed **55 characters per line** (`max-width: 50ch`) to guarantee scan speed.
4. **Contrast Integrity:** Body text on light slides must maintain a minimum contrast ratio of `7:1` against `--background` (`#ffffff`), using `#0a0a0a` or `#6b6b6b`.

---

## 3. Spacing Scale (8-Point Base System)

Strict adherence to an 8-point geometric scale ensures mathematical rhythm and grid harmony across slides:

| Token Name | Value (px) | Value (rem) | Typical Usage in Deck Shell |
|---|---|---|---|
| `--space-1` | `4px` | `0.25rem` | Kicker dot gap, micro-margins |
| `--space-2` | `8px` | `0.5rem` | Tag padding, dot navigation spacing |
| `--space-3` | `12px` | `0.75rem` | Spec matrix cell padding |
| `--space-4` | `16px` | `1.0rem` | Standard gap between title and description |
| `--space-6` | `24px` | `1.5rem` | Card padding, feature list row gap |
| `--space-8` | `32px` | `2.0rem` | Grid gap between columns in 2-col or 3-col layouts |
| `--space-10` | `40px` | `2.5rem` | Header-to-content separation margin |
| `--space-12` | `48px` | `3.0rem` | Major section outer separation |
| `--space-16` | `64px` | `4.0rem` | Viewport stage padding safe zone |
| `--space-20` | `80px` | `5.0rem` | Hero title bottom offset |

---

## 4. Grid Architecture & Archetype Layouts

The Aperture Cinematic presentation shell enforces structured 12-column and 50/50 splits:

| Archetype | Grid Split | Layout Structure | Key Components |
|---|---|---|---|
| `cover` | 100% Full Viewport | Full-bleed dark photography with double gradient overlay | Brand tag, live status dot, vermilion kicker, giant headline bottom-anchored, lead subtitle |
| `problem` | 4-col : 8-col | 12-column asymmetric split | Left: grayscale image. Right: kicker, H1, giant ghost watermark ("NO"), 3-item numbered list with hover highlight |
| `product` | 50% : 50% | 2-column balanced split | Left: macro photo with floating glass badge. Right: headline, lead prose, 2x2 spec matrix stat block |
| `features` | 3-col : 9-col | Rail image + wide list | Left: rail photo with 90° rotated technical caption rail. Right: 4 feature rows with giant numbers `01`–`04` |
| `usp` | 3-Column Trio | Centered dark viewfinder canvas | 3 frosted glass cards (`backdrop-filter: blur(12px)`), hairline white border, kicker, counter, giant stat |
| `pricing` | 3-col : 9-col | Image rail + tier matrix | Left: rail photo with watermark ("Ship it."). Right: 3-column pricing matrix, inverted featured tier with vermilion CTA |

---

## 5. Elevation, Borders & Micro-Interactions

Unlike legacy presentations with heavy 3D drop shadows, Aperture Cinematic relies on clean hairline borders, glassmorphism, and responsive motion:

### 5.1 Hairline Borders & Glass Surfaces

```css
/* 1px Hairline Borders */
--border-hairline: 1px solid var(--border);
--border-glass: 1px solid rgba(255, 255, 255, 0.15);

/* Frosted Glassmorphism (USP Cards & Badges) */
.glass-surface {
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

### 5.2 Micro-Interactions & State Transitions

1. **Hairline Progress Bar:**
   - 3px high progress bar at top of stage.
   - Smooth expansion: `transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);`.
   - Background: `var(--accent)`.
2. **Dot Navigation & Counter:**
   - Footer dot indicator for each slide; active dot highlights with `var(--accent)`.
   - Slide counter dynamically updates (`01 / 06`) on navigation.
3. **Interactive Numbered Rows:**
   - Numbers `01`–`04` on `problem` and `features` slides transition from `#e4e4e4` to `var(--accent)` on row hover.
   - Row background highlights smoothly to `var(--hover-bg)` (`#fafafa`).
4. **Keyboard Navigation:**
   - Arrow keys (`ArrowRight`, `ArrowLeft`), `Space`, `PageDown`, `PageUp`, `Home`, and `End` support instant slide navigation without external libraries.

---

## 6. Semantic Component Classes

The presentation shell and slide renderers utilize standardized CSS classes:

### 6.1 Shell Chrome Classes
- `.deck-container`: Root container filling `100vw` × `100vh` with `overflow: hidden`.
- `.deck-header`: Top chrome containing `.brand-wrapper` and `.slide-counter`.
- `.brand-title`: Bold display brand name in the header rail.
- `.brand-sub`: Monospaced subtitle in the header rail.
- `.deck-progress-track`: 3px hairline container track across the top stage.
- `.deck-progress-bar`: Dynamic colored fill bar indicating presentation progress.
- `.deck-stage`: Main stage containing all slide sections (1920×1080 fixed canvas).
- `.deck-footer`: Bottom chrome containing `.deck-nav-dots` and `.deck-nav-arrows`.
- `.arrow-btn`: Square navigation buttons (`←` and `→`).

### 6.2 Slide Archetype Classes
- `.slide-item`: Base class for every presentation slide.
- `.slide-cover`: Full-bleed cinematic hero slide.
- `.slide-problem`: 12-column asymmetric problem slide with ghost watermark.
- `.slide-product`: 50/50 macro image and spec matrix slide.
- `.slide-features`: Vertical rail image and giant numbered feature list slide.
- `.slide-usp`: Dark viewfinder slide with frosted glass cards.
- `.slide-pricing`: Vertical image rail with 3-column tier matrix.

### 6.3 Content & Typography Classes
- `.mono-kicker`: Monospaced uppercase category kicker in `JetBrains Mono`.
- `.kicker-dot`: Live status glowing dot (`● Now shipping`).
- `.ghost-watermark`: Giant absolute background text (`#f1f1f1`).
- `.spec-matrix`: 2×2 high-contrast metric stat grid.
- `.stat-big-num`: Big metric number (`0.9s`, `14`, `214g`, `99.9%`).
- `.stat-mono-label`: Monospaced uppercase metric label.
- `.glass-card`: Frosted glass container with backdrop blur.
- `.pricing-featured`: Inverted dark card for the highlighted pricing tier.
- `.btn-cta`: Call-to-action button with vermilion fill or crisp border.

---

## 7. Official CSS Variables Template (`:root`)

The authoritative CSS variable block defined in `skills/builder/templates/modern/theme.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  /* Surface & Canvas Tokens */
  --background: #ffffff;
  --foreground: #0a0a0a;
  --muted-foreground: #6b6b6b;

  /* Accent & Interaction Tokens */
  --accent: var(--brand-primary, #ff3b1d);
  --accent-glow: rgba(255, 59, 29, 0.2);
  --border: #e4e4e4;
  --ghost: #f1f1f1;
  --hover-bg: #fafafa;

  /* Typography Tokens */
  --font-display: 'Archivo', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```
