# Visual Hierarchy & Layout Composition Reference — 16:9 Slide Decks

> **Self-contained visual architecture guidelines for the `builder` skill.**  
> Synthesized from `impeccable` layout principles and `ui-ux-pro-max` UX standards, tailored for **1920×1080 widescreen Aperture Cinematic presentation decks (standalone Vanilla HTML5/CSS3/JS)**.

---

## 1. Presentation Canvas & Safe Zone Architecture

Corporate decks require strict structural discipline to look polished both in interactive browser view and in exported PDF print format.

- **Target Resolution:** Fixed 1920×1080 pixels (16:9 aspect ratio).
- **Deck Stage Configuration:**
  - Stage canvas: `1920×1080`
  - Outer safety margin: `4%` (`margin: 0.04`)
  - Scale range: `minScale: 0.2`, `maxScale: 2.0`
- **Safe Zone:** All primary content must remain within an inner bounding box of **1760×960 pixels** (80px inward from the canvas boundaries). Never place critical text or interactive targets against the viewport edge.
- **Slide Budget:** **One core concept per slide.** Maximum **250 words** or 3–4 card items per slide. If content exceeds this limit, chunk into subsequent slides.

---

## 2. Layout Composition by Slide Archetype

The template has exactly **7 archetypes** (SSOT: `CINEMATIC_ARCHETYPES` +
`CINEMATIC_SLOT_MAP` in `skills/builder/scripts/themes/modern.js`, mirrored in
`templates/modern/manifest.json` and asserted by
`scripts/test-cinematic-classifier.js`). This section replaces the earlier
per-theme layout catalogue; the canonical DOM for each layout is produced by its
renderer, never hand-written.

| # | Archetype | Default slot | Grid | Composition |
|---|-----------|--------------|------|-------------|
| 1 | `cover` | `hero` | 100% full-bleed dark canvas | Bottom-anchored giant headline (9rem) + lead subtitle over a double gradient overlay, brand tag + status pill in `.top-meta`, vermilion mono kicker, and the `.cover-stats` glass strip carrying the 2–3 key metrics |
| 2 | `problem` | `problem` | 4-col : 8-col (`.slide-problem`) | Left: desaturated photo with mono caption. Right: kicker, headline, giant `#f1f1f1` ghost watermark ("NO"), 3 numbered `.problem-item` rows (`01`–`03` vermilion) with `#fafafa` hover |
| 3 | `product` | `macro` | 50% : 50% (`.slide-product`) | Left: macro photo + floating `.badge-floating` glass badge. Right: kicker, headline, lead prose, `.stats-grid` 2×2 metric matrix |
| 4 | `features` | `hands` | 3-col : 9-col (`.slide-features`) | Left: rail photo with 90°-rotated `.rail-label` (`writing-mode: vertical-rl`). Right: header + `.sub-counter`, then ≤4 `.feature-row` items with giant `01`–`04` numbers that flip to vermilion on hover |
| 5 | `usp` | `viewfinder` | 3-card trio on a dark canvas (`.slide-usp`) | Full-bleed dark viewfinder photo, vertical gradient overlay, headline, optional `.usp-honesty` callout, and 3 `.usp-card` frosted glass cards (`backdrop-filter: blur(12px)`, hairline white border) each with kicker, counter, optional giant stat, title, detail |
| 6 | `pricing` | `lens` | 3-col : 9-col (`.slide-pricing`) | Left: rail photo with `Siap mulai.` overlay. Right: kicker, headline, `.pricing-grid` with ≤3 `.tier-card`s; the featured (middle) tier inverts to `#0a0a0a` with a vermilion CTA |
| 7 | `closing` | `closing` | 3-col : 9-col (`.slide-closing`) | Left: rail photo with rotated `Langkah berikutnya` caption. Right: kicker, headline, `.closing-desc`, optional `.closing-notes` list (commitments/benefits), `.closing-contacts` 2-column icon+label+value grid, and the `.closing-cta` |

### 2.1 Zero-Hallucination Composition Rules

1. **Render only what the draft contains.** Card lists are sliced to the layout
   capacity (problem ≤3, product ≤4, features ≤4, usp ≤3, pricing ≤3, closing
   contacts ≤4) and never padded with invented defaults.
2. **Empty grid + `console.warn`** is the contract for a slide with zero parsed
   items. Never substitute placeholder claims, metrics, testimonials or prices.
3. **Degrade, do not break.** A `product` slide whose bullets carry no figure
   renders label-only `.stat-cell.no-metric` cells; a `pricing` slide with no
   table/items falls back to the `features` list layout; a `closing` slide with no
   contacts still renders its headline + CTA.
4. **Contact data is never fabricated.** Reviewer placeholders
   (`[Nomor WhatsApp]`, `[Email Resmi]`, `[Alamat Kantor]`, …) render as the
   explicit `Belum tersedia` marker and are listed in `reports/build.log`. The
   CTA becomes a real `<a href>` only when the draft supplied a real e-mail/URL.
5. **Localized chrome.** The deck is `<html lang="id">`, so every renderer default
   (kicker, rail label, CTA label) is Bahasa Indonesia and overridable per slide.

### 2.2 Slide Budget

One core concept per slide: `# ` heading, a 1-line tagline/prose intro, and 3–4
bullets of `**Judul** — 8–12 kata`. The reviewer rejects >6 bullets, >60 words, or
any single bullet >20 words; the builder splits anything denser into
`Lanjutan: [Title] (Part N)` slides rather than truncating facts.

---
## 3. Contrast Ratio Standards (WCAG AA / AAA)

Visual accessibility is non-negotiable. Text must remain effortlessly readable under challenging projection environments (ambient office lighting, low-contrast projectors).

### 3.1 Compliance Targets

| Element Type | WCAG AA Minimum | WCAG AAA Target | Builder Standard |
|--------------|-----------------|-----------------|------------------|
| **Normal Body Text** (< 24px regular) | `4.5 : 1` | `7.0 : 1` | `>= 7.0 : 1` |
| **Large Headings** (>= 24px or >= 18px bold) | `3.0 : 1` | `4.5 : 1` | `>= 4.5 : 1` |
| **UI Components & Icons** (SVG glyphs, borders) | `3.0 : 1` | `4.5 : 1` | `>= 3.5 : 1` |
| **Card Borders & Dividers** | `1.5 : 1` | `3.0 : 1` | Visible subtle rim (`rgba(255,255,255,0.08)`) |

### 3.2 Slide Deck Color Contrast Audit

Dark rows computed against the slide background `--brand-surface` (`#0f172a`); light-deck row computed against `#FFFFFF`:

| Token | Hex Value | Contrast Ratio | Result |
|-------|-----------|----------------|--------|
| `--brand-text-primary` | `#f8fafc` | **16.8 : 1** | PASS (AAA) |
| `--brand-text-secondary` | `#cbd5e1` | **10.5 : 1** | PASS (AAA) |
| `--brand-text-muted` | `#94a3b8` | **5.8 : 1** | PASS (AA Normal, AAA Large) |
| `--brand-primary` (Venturo Teal) | `#009BAD` | **4.7 : 1** | PASS (AA Normal, AAA Large) |
| `--color-success` | `#10b981` | **5.4 : 1** | PASS (AA Normal, AAA Large) |
| `--color-problem` (Warning Red) | `#ef4444` | **4.6 : 1** | PASS (AA Normal, AAA Large) |
| `--text-headline` on `#FFFFFF` (light deck) | `#0B3B82` | **10.7 : 1** | PASS (AAA) |

### 3.3 Strict Anti-Patterns to Avoid

1. **Gray-on-Dark Failure:** Never use `#64748b` (slate-500) or darker for body text on `#0f172a`. The contrast is `< 3.2:1`, failing WCAG AA.
2. **Color-Alone Semantics:** Never indicate status by color alone. Every error/problem must feature a warning icon or label; every success must feature a checkmark.
3. **Ghost Buttons with Invisible Borders:** All button containers must have at least `rgba(255,255,255,0.15)` border or a solid background fill.

---

## 4. Scannability & Visual Anchor Points

Slide presentations are not books; executives scan before they read.

### 4.1 Eye-Path Optimization (Z-Pattern & F-Pattern)

1. **Primary Anchor (Anchor 1):** Upper-left slide title (H1/H2). Sets the topic immediately.
2. **Secondary Anchor (Anchor 2):** High-contrast visual element on the right (Smartphone mockup, Ecosystem diagram, or Best Seller card).
3. **Tertiary Anchor (Anchor 3):** Big number stat badges or CTA button at bottom-left or bottom-center.

### 4.2 The Squint Test Verification

Before approving slide markup:
> *Apply a 10px blur filter. If the observer cannot immediately tell: (1) what the slide is about, (2) which card is most important, and (3) what the primary metric or action is — the visual hierarchy has failed and spacing/font-size contrast must be widened.*

### 4.3 Visual Anchor Techniques

- **Eyebrow Tags:** Use small uppercase pills above titles (`PENAWARAN KHUSUS`, `FITUR UNGGULAN`) to orient the viewer.
- **Accent Glow:** Place a soft radial gradient behind primary visual assets to naturally draw the viewer's gaze.
- **Typographic Scale Jump:** Ensure at least a `2x` font-size jump between card headings (`22px`) and card body (`15px`).

---

## 5. Micro-Interactions & Transitions

Polished transitions create perceived technical excellence without distracting from presentation content.

### 5.1 Card Hover Dynamics

```css
.card {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.25s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: var(--brand-card-border-hover);
}
```

### 5.2 Transition Performance Rules

1. **Hardware Accelerated Only:** Only animate `transform` and `opacity`. Never animate `width`, `height`, `margin`, or `padding` (causes layout reflow / jank).
2. **Timing Budget:** Keep micro-interactions between **150ms and 300ms**. Faster than 150ms feels jarring; slower than 400ms feels sluggish.

---

## 6. Print & PDF Export Parity

Slide presentations must export seamlessly to PDF via browser print (`Ctrl+P`):

```css
@media print {
  /* Set exact 16:9 page dimensions */
  @page {
    size: 1920px 1080px landscape;
    margin: 0;
  }

  body, .deck-container {
    background-color: var(--background) !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Disable hover translations and interactive shadows in print */
  .card, .phone-frame, .ecosystem-diagram {
    transform: none !important;
    break-inside: avoid !important;
  }
}
```
