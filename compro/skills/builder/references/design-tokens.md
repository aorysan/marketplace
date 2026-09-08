# Design Tokens Reference — Corporate Slide Presentations

> **Self-contained design intelligence for the `builder` skill.**  
> Derived from `ui-ux-pro-max` and `impeccable` systems, tailored specifically for **1920×1080 (16:9) corporate presentation decks (Reveal.js)**.

---

## 1. Dynamic HSL Brand Color System

Slides use dynamic HSL (Hue, Saturation, Lightness) color tokens. By defining the primary brand color as HSL components, the entire color palette (tints, shades, surfaces, borders, glow effects) is procedurally generated without requiring manual hex code lookups.

### 1.1 Base Variables

```css
:root {
  /* =======================================================
     BRAND HSL PARAMETERS (Injected per client / company)
     Default: Venturo Teal (#009BAD) -> H: 186, S: 100%, L: 34%
     ======================================================= */
  --brand-h: 186;
  --brand-s: 100%;
  --brand-l: 34%;

  /* Dynamic Brand Tokens */
  --brand-primary: hsl(var(--brand-h), var(--brand-s), var(--brand-l));
  --brand-primary-light: hsl(var(--brand-h), var(--brand-s), calc(var(--brand-l) + 18%));
  --brand-primary-dark: hsl(var(--brand-h), var(--brand-s), calc(var(--brand-l) - 12%));
  --brand-primary-subtle: hsla(var(--brand-h), var(--brand-s), var(--brand-l), 0.12);
  --brand-primary-glow: hsla(var(--brand-h), var(--brand-s), var(--brand-l), 0.28);

  /* Secondary & Complementary Accents */
  --brand-secondary: hsl(calc(var(--brand-h) + 35), 90%, 52%); /* Warm accent / highlight */
  --brand-secondary-light: hsl(calc(var(--brand-h) + 35), 95%, 65%);
  --brand-secondary-subtle: hsla(calc(var(--brand-h) + 35), 90%, 52%, 0.15);

  /* Dark Canvas & Surface Tones (Deep Corporate Tech Slate) */
  --brand-dark: #090d16;          /* Deepest canvas backdrop */
  --brand-surface: #0f172a;       /* Standard slide background */
  --brand-surface-elevated: #1e293b; /* Elevated container / modal */
  --brand-card-bg: rgba(255, 255, 255, 0.04);
  --brand-card-bg-hover: rgba(255, 255, 255, 0.07);
  --brand-card-border: rgba(255, 255, 255, 0.08);
  --brand-card-border-hover: hsla(var(--brand-h), var(--brand-s), 50%, 0.4);

  /* Text & Typography Hierarchy */
  --brand-text-primary: #f8fafc;  /* 98% white, contrast ratio ~16.8:1 against --brand-surface */
  --brand-text-secondary: #cbd5e1;/* Slate-300, contrast ratio ~10.5:1 */
  --brand-text-muted: #94a3b8;    /* Slate-400, contrast ratio ~5.8:1 */
  --brand-text-inverse: #0f172a;  /* Dark text on bright badge/pill */

  /* Functional Semantic Status Colors */
  --color-problem: #ef4444;       /* Red-500 for pain points */
  --color-problem-subtle: rgba(239, 68, 68, 0.12);
  --color-problem-border: rgba(239, 68, 68, 0.35);

  --color-success: #10b981;       /* Emerald-500 for checkmarks, solutions, traction */
  --color-success-subtle: rgba(16, 185, 129, 0.12);
  --color-success-border: rgba(16, 185, 129, 0.35);

  --color-warning: #f59e0b;       /* Amber-500 for alerts, urgency badges */
  --color-warning-subtle: rgba(245, 158, 11, 0.12);
  --color-warning-border: rgba(245, 158, 11, 0.35);
}
```

### 1.2 Preset Industry Palettes

When generating company profiles for specific industries, inject these corresponding HSL values into `--brand-h`, `--brand-s`, `--brand-l`:

| Industry / Theme | Hue (`--brand-h`) | Saturation (`--brand-s`) | Lightness (`--brand-l`) | Primary Hex | Vibe / Personality |
|------------------|-------------------|--------------------------|-------------------------|-------------|--------------------|
| **Tech / IT (Venturo)** | `186` | `100%` | `34%` | `#009BAD` | Modern, trustworthy, crisp |
| **Enterprise / B2B SaaS** | `220` | `90%` | `56%` | `#2563EB` | Corporate, authoritative, secure |
| **Fintech / Wealth** | `158` | `82%` | `38%` | `#0D9488` | Stable, prosperous, precise |
| **Creative / Agency** | `265` | `85%` | `62%` | `#8B5CF6` | Innovative, bold, premium |
| **Health / Medical** | `199` | `89%` | `48%` | `#0284C7` | Clean, reassuring, sterile |
| **Industrial / Logistics** | `28` | `95%` | `50%` | `#F97316` | Dynamic, energetic, dependable |

---

## 2. Typography Scale (1920×1080 16:9 Presentation)

Presentation typography requires larger optical sizing and tighter leading than standard desktop web pages to ensure instant legibility at 1920×1080 resolution when viewed across a boardroom or projected on display screens.

### 2.1 Font Family Pairings

- **Titles, Headings, Numbers & Badges:** `Plus Jakarta Sans`, sans-serif (Weights: `600`, `700`, `800`)
  - *Rationale:* Geometric, high-energy sans-serif with bold apertures that command authority in pitch decks.
- **Body, Captions, Features & Tables:** `Inter`, -apple-system, BlinkMacSystemFont, sans-serif (Weights: `400`, `500`, `600`)
  - *Rationale:* Neutral, tall x-height, engineered for micro-reading and scannability without visual fatigue.
- **Metrics & Monetary Figures:** `Plus Jakarta Sans` with `font-variant-numeric: tabular-nums` to eliminate layout wobble during presentation view.

### 2.2 Scale Breakdown

| Role | Font Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Font Family | Usage |
|------|----------------|------------|--------|-------------|----------------|-------------|-------|
| **Display / Hero H1** | `56px` | `3.5rem` | `800` | `1.12` | `-0.025em` | Plus Jakarta Sans | Hero slide company title |
| **Slide Title (H1)** | `44px` | `2.75rem` | `800` | `1.18` | `-0.02em` | Plus Jakarta Sans | Main slide header |
| **Section Header (H2)** | `32px` | `2.0rem` | `700` | `1.25` | `-0.015em` | Plus Jakarta Sans | Content section groupings |
| **Card Header (H3)** | `22px` | `1.375rem` | `700` | `1.30` | `-0.01em` | Plus Jakarta Sans | Feature/problem card titles |
| **Big Stat Number** | `68px` | `4.25rem` | `800` | `1.0` | `-0.03em` | Plus Jakarta Sans | Traction & KPI highlights |
| **Lead / Tagline** | `22px` | `1.375rem` | `500` | `1.45` | `0` | Inter | Hero tagline / intro lead |
| **Body Regular** | `16px` | `1.0rem` | `400` | `1.6` | `0` | Inter | Card descriptions, body text |
| **Table & List Item** | `15px` | `0.9375rem` | `500` | `1.5` | `0` | Inter | Pricing rows, feature bullets |
| **Pill / Badge / Meta** | `12px` | `0.75rem` | `700` | `1.0` | `+0.05em` | Plus Jakarta Sans | Caps badges, status indicators |

### 2.3 Typographic Rules & Constraints

1. **Line Measure Limit:** Body paragraphs must not exceed **60 characters per line** (`max-width: 55ch`). Runaway text lines in 16:9 slides kill scannability.
2. **Squint Contrast:** Primary headings (`--brand-text-primary`) must have at least `2.5x` the visual weight of body copy.
3. **No All-Caps Paragraphs:** Reserve uppercase only for short badges and eyebrow labels (`text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem;`).
4. **Dark Surface Readability:** Use slightly elevated line-height (`1.6` vs standard `1.5`) and lighter font weights (`400`/`500` with antialiasing `-webkit-font-smoothing: antialiased`) when rendering light text against dark background.

---

## 3. Spacing Scale (8-Point Base System)

Strict adherence to an 8-point geometric scale prevents arbitrary layout gaps and ensures mathematical rhythm across slide components.

| Token Name | Value (px) | Relative (rem) | Typical Role in Slide Deck |
|------------|------------|----------------|----------------------------|
| `--space-1` | `4px` | `0.25rem` | Badge padding inline, micro-gaps between icon and text |
| `--space-2` | `8px` | `0.5rem` | List item vertical spacing, small tag padding |
| `--space-3` | `12px` | `0.75rem` | Input padding, compact card internal padding |
| `--space-4` | `16px` | `1.0rem` | Standard gap between card title and body |
| `--space-5` | `20px` | `1.25rem` | Gap between grid items in dense lists |
| `--space-6` | `24px` | `1.5rem` | Standard card internal padding (`padding: var(--space-6)`) |
| `--space-8` | `32px` | `2.0rem` | Grid gap between columns in 2-col or 3-col layouts |
| `--space-10` | `40px` | `2.5rem` | Margin below slide title, separating header from content |
| `--space-12` | `48px` | `3.0rem` | Section outer separation |
| `--space-16` | `64px` | `4.0rem` | Hero layout split gap, slide canvas padding safe zone |
| `--space-20` | `80px` | `5.0rem` | Major slide boundary margins |

---

## 4. Border Radius Scale

Consistent curvature defines the modern, friendly yet precise aesthetic of corporate software presentations:

| Token Name | Value | Applied To |
|------------|-------|------------|
| `--radius-sm` | `6px` | Small status badges, inline code tags, table cells |
| `--radius-md` | `10px` | Buttons, dropdown triggers, icon container boxes |
| `--radius-lg` | `16px` | Standard cards (Feature cards, Problem cards, Pricing tiers) |
| `--radius-xl` | `24px` | Highlighted feature containers, Smartphone outer bezel |
| `--radius-2xl`| `36px` | Device frames, floating showcase panels |
| `--radius-full`| `9999px`| Pill badges, download store buttons, avatar circles |

---

## 5. Elevation & 3D Drop Shadow Tokens

Corporate slide presentations rely on multi-layered ambient occlusion shadows to lift cards off the dark background and establish depth.

```css
:root {
  /* Subtle border rim for dark-mode card separation */
  --border-rim: 1px solid rgba(255, 255, 255, 0.08);
  --border-rim-highlight: 1px solid hsla(var(--brand-h), var(--brand-s), 55%, 0.4);

  /* Elevation 1: Flat resting card */
  --shadow-resting: 
    0 4px 12px -2px rgba(0, 0, 0, 0.3),
    0 1px 3px 0 rgba(0, 0, 0, 0.2),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05);

  /* Elevation 2: Hovered card / interactive element */
  --shadow-hover: 
    0 16px 32px -6px rgba(0, 0, 0, 0.45),
    0 6px 12px -2px rgba(0, 0, 0, 0.25),
    0 0 24px -2px hsla(var(--brand-h), var(--brand-s), var(--brand-l), 0.2),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1);

  /* Elevation 3: Highlighted Tier (Best Seller Pricing Card) */
  --shadow-featured: 
    0 24px 48px -8px rgba(0, 0, 0, 0.55),
    0 12px 24px -4px hsla(var(--brand-h), var(--brand-s), var(--brand-l), 0.35),
    inset 0 1px 0 0 hsla(var(--brand-h), var(--brand-s), 70%, 0.4);

  /* Elevation 4: 3D Smartphone Device Shadow */
  --shadow-device: 
    0 32px 64px -12px rgba(0, 0, 0, 0.65),
    0 16px 32px -8px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.12),
    0 0 40px -8px hsla(var(--brand-h), var(--brand-s), var(--brand-l), 0.25);

  /* Ambient Backdrop Glows */
  --glow-radial: radial-gradient(circle at 50% 30%, hsla(var(--brand-h), var(--brand-s), var(--brand-l), 0.15) 0%, transparent 70%);
}
```

---

## 6. CSS Custom Properties Implementation Template

When assembling slides, the builder automatically emits this consolidated CSS variable block into `templates/custom.css` or the inlined slide `<style>` header:

```css
:root {
  /* Dynamic Hue */
  --brand-h: 186;
  --brand-s: 100%;
  --brand-l: 34%;

  /* Brand Palette */
  --brand-primary: hsl(var(--brand-h), var(--brand-s), var(--brand-l));
  --brand-primary-light: hsl(var(--brand-h), var(--brand-s), calc(var(--brand-l) + 18%));
  --brand-primary-dark: hsl(var(--brand-h), var(--brand-s), calc(var(--brand-l) - 12%));
  --brand-primary-subtle: hsla(var(--brand-h), var(--brand-s), var(--brand-l), 0.12);
  --brand-secondary: hsl(calc(var(--brand-h) + 35), 90%, 52%);
  --brand-dark: #090d16;
  --brand-surface: #0f172a;
  --brand-card-bg: rgba(255, 255, 255, 0.04);
  --brand-card-border: rgba(255, 255, 255, 0.08);

  /* Typography */
  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Radius & Shadows */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  --shadow-card: 0 4px 12px -2px rgba(0,0,0,0.3), 0 1px 3px 0 rgba(0,0,0,0.2);
  --shadow-featured: 0 24px 48px -8px rgba(0,0,0,0.55), 0 0 24px hsla(var(--brand-h), var(--brand-s), var(--brand-l), 0.35);
}
```
