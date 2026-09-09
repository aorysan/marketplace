# Visual Hierarchy & Layout Composition Reference — 16:9 Slide Decks

> **Self-contained visual architecture guidelines for the `builder` skill.**  
> Synthesized from `impeccable` layout principles and `ui-ux-pro-max` UX standards, tailored for **1920×1080 widescreen presentation decks (Reveal.js)**.

---

## 1. Presentation Canvas & Safe Zone Architecture

Corporate decks require strict structural discipline to look polished both in interactive browser view and in exported PDF print format.

- **Target Resolution:** Fixed 1920×1080 pixels (16:9 aspect ratio).
- **Reveal.js Configuration:**
  - `width: 1920`
  - `height: 1080`
  - `margin: 0.04` (4% outer safety margin)
  - `minScale: 0.2`, `maxScale: 2.0`
- **Safe Zone:** All primary content must remain within an inner bounding box of **1760×960 pixels** (80px inward from the canvas boundaries). Never place critical text or interactive targets against the viewport edge.
- **Slide Budget:** **One core concept per slide.** Maximum **250 words** or 3–4 card items per slide. If content exceeds this limit, chunk into subsequent slides.

---

## 2. Layout Composition by Slide Archetype

### 2.1 Slide 1: Hero / Corporate Title
*Purpose:* Establish brand authority, instant value proposition, and credible key metrics within 3 seconds.

```
+------------------------------------------------------------------------------------+
|  [Eyebrow Badge: CATEGORY / INDUSTRY]                                              |
|                                                                                    |
|  Massive Punchy Headline (H1, 56px)           +---------------------------------+  |
|  One-Line Value Proposition Tagline (22px)    |                                 |  |
|                                               |  Showcase Visual Container      |  |
|  Executive summary paragraph (max 3 lines)    |  - 3D Realistic Smartphone      |  |
|                                               |    Mockup or Vector Platform    |  |
|  [================ Key Metrics Bar ===============] |    Asset with Radial Glow       |  |
|  | 500K+ Active | 99.9% Uptime | 4.9/5 Rating |  +---------------------------------+  |
|  +--------------------------------------------+                                    |
+------------------------------------------------------------------------------------+
```

- **Layout Structure:** 2-column asymmetric split (60% content left, 40% visual right) or centered high-impact hero.
- **Visual Anchor:** The high-contrast H1 headline paired with the floating 3D device preview.
- **Metric Bar:** 3 prominent metric chips (`.hero-stats`), featuring `68px` numbers in `--brand-primary` with `14px` descriptive labels below.

---

### 2.2 Slide 2: Problem / Pain Points
*Purpose:* Validate customer friction with high emotional resonance before introducing the solution.

```
+------------------------------------------------------------------------------------+
|  [SLIDE TITLE: Tantangan & Masalah Industri]                                       |
|  Sub-headline explaining the friction context in 1 line                             |
|                                                                                    |
|  +-----------------------+  +-----------------------+  +------------------------+  |
|  | [!] Warning Badge     |  | [!] Warning Badge     |  | [!] Warning Badge      |  |
|  | Pain Point Title (H3) |  | Pain Point Title (H3) |  | Pain Point Title (H3)  |  |
|  |                       |  |                       |  |                        |  |
|  | Description of acute  |  | Description of acute  |  | Description of acute   |  |
|  | operational loss or   |  | operational loss or   |  | operational loss or    |  |
|  | bottleneck.           |  | bottleneck.           |  | bottleneck.            |  |
|  |                       |  |                       |  |                        |  |
|  | [Tag: -45% Efisiensi] |  | [Tag: High Cost]      |  | [Tag: Manual Process]  |  |
|  | (Dashed Red Border)   |  | (Dashed Red Border)   |  | (Dashed Red Border)    |  |
|  +-----------------------+  +-----------------------+  +------------------------+  |
+------------------------------------------------------------------------------------+
```

- **Visual Cue:** `.problem-card` features a distinctive **dashed border** (`border: 2px dashed rgba(239, 68, 68, 0.4)`), a subtle red tint background (`rgba(239, 68, 68, 0.04)`), and a red warning indicator badge.
- **Card Content:** Problem icon SVG (alert triangle, hourglass, or broken chain), H3 heading, concise 2–3 line explanation, and an impact badge highlighting the cost of inaction.

---

### 2.3 Slide 3: Solution / Value Proposition
*Purpose:* Present the product as the definitive answer with clear capability pillars.

```
+------------------------------------------------------------------------------------+
|  [SLIDE TITLE: Solusi Komprehensif Kami]                                           |
|  Value proposition lead sentence                                                   |
|                                                                                    |
|  +--------------------------------------+  +-------------------------------------+ |
|  | [*] SVG Brand Icon (48x48 rounded)   |  | [*] SVG Brand Icon (48x48 rounded)  | |
|  | Feature Pillar Title (H3)            |  | Feature Pillar Title (H3)           | |
|  | Clear explanation of mechanism        |  | Clear explanation of mechanism       | |
|  |                                      |  |                                     | |
|  | [v] Benefit checkmark bullet 1       |  | [v] Benefit checkmark bullet 1      | |
|  | [v] Benefit checkmark bullet 2       |  | [v] Benefit checkmark bullet 2      | |
|  | (Solid Brand Border + Subtle Glow)   |  | (Solid Brand Border + Subtle Glow)  | |
|  +--------------------------------------+  +-------------------------------------+ |
+------------------------------------------------------------------------------------+
```

- **Visual Cue:** Solid borders with brand hover states (`--brand-card-border-hover`), vector SVG icons enclosed in 48×48px rounded containers with `--brand-primary-subtle` background.
- **Typography:** Contrast between bold feature headings (`Plus Jakarta Sans 700`) and green checkmark benefit points (`--color-success`).

---

### 2.4 Slide 4: Circular Ecosystem Diagram
*Purpose:* Showcase end-to-end integration, architecture, or workflow synergy at a glance.

```
                                  [ Satellite Node 1 ]
                                    (Mobile Platform)
                                           |
                [ Satellite Node 4 ]       |       [ Satellite Node 2 ]
                 (Cloud Analytics)    \    |    /     (Admin Console)
                                       \   |   /
                                     +------------+
                                     | BRAND HUB  |
                                     |  (Engine)  |
                                     +------------+
                                       /   |   \
                 [ Satellite Node 5 ] /    |    \  [ Satellite Node 3 ]
                  (API Integrations)       |        (Payment Gateway)
                                           |
                                  [ Satellite Node 6 ]
                                   (Automated AI Pipeline)
```

- **Composition:** Central hub circle (brand core with glowing animated border) connected to 4–6 orbiting satellite feature nodes via vector lines (`stroke: var(--brand-card-border)`).
- **Fallback Rule:** When an external diagram image is unavailable, the builder must render this as an **inline SVG** vector graphic with crisp vector typography.

---

### 2.5 Slide 5: Smartphone UI Mockup Showcase
*Purpose:* Make digital software tangible, realistic, and instantly credible.

```
+------------------------------------------------------------------------------------+
|  Platform Experience Showcase                                                      |
|                                                                                    |
|  Feature Callouts (Left)           +-----------------------+  Capability Highlights |
|  - Real-time notification updates  |  [ ( ) Dynamic Island]|  - Intuitive UX design |
|  - Instant asset sync              |  |-------------------|  - 99.9% uptime        |
|  - Multi-user collaboration        |  | App Screen Content |  - Secure auth         |
|                                    |  | - Status Header    |                        |
|                                    |  | - Balance / KPIs   |                        |
|                                    |  | - Action Buttons   |                        |
|                                    |  | - Data Feed List   |                        |
|                                    |  |-------------------|  |                        |
|                                    |  |   [=== Home Bar =] |  |                        |
|                                    |  +--------------------+  |                        |
|                                    | (Realistic 3D Shadow) |                        |
+------------------------------------------------------------------------------------+
```

- **Smartphone Frame Anatomy:**
  - Outer Chassis: Rounded rectangle (`border-radius: 36px`, `border: 3px solid #334155`).
  - Top Bezel: Dynamic Island pill (`width: 90px; height: 18px; border-radius: 9px; background: #000;`).
  - Internal Screen: Glass screen UI container with status bar, interactive feed preview, and bottom home indicator bar (`width: 100px; height: 4px; border-radius: 2px; background: #94a3b8;`).
  - Drop Shadow: Heavy 3D elevation (`--shadow-device`).

---

### 2.6 Slide 6: Pricing Table with "Best Seller" Tier
*Purpose:* Remove buying friction and channel decision-makers toward the target package.

```
+------------------------------------------------------------------------------------+
|  Paket Investasi & Lisensi                                                         |
|                                                                                    |
|  +--------------------+  +----------------------------+  +--------------------+    |
|  | Starter Tier       |  | *** BEST SELLER BADGE ***  |  | Enterprise Tier    |    |
|  | Rp 2.500.000 / bln |  | Pro / Growth Tier          |  | Custom Quote       |    |
|  |                    |  | Rp 5.000.000 / bln         |  |                    |    |
|  | [ ] 5 User seat    |  | (Coret: Rp 7.500.000)      |  | [v] Unlimited seat |    |
|  | [ ] Basic reports  |  |                            |  | [v] 24/7 SLA       |    |
|  | [ ] Email support  |  | [v] 25 User seat           |  | [v] Dedicated AM   |    |
|  |                    |  | [v] Advanced AI Analytics  |  |                    |    |
|  | [ Pilih Starter ]  |  | [v] Priority 24/7 Support  |  | [ Hubungi Sales ]  |    |
|  |                    |  |                            |  |                    |    |
|  |                    |  | [ Mulai Uji Coba Pro ]     |  |                    |    |
|  |                    |  | (Elevated 1.04x Scale)     |  |                    |    |
|  +--------------------+  +----------------------------+  +--------------------+    |
+------------------------------------------------------------------------------------+
```

- **Featured Card Rules:**
  - The middle or target tier must be elevated using `transform: scale(1.04);` and accented with `--brand-primary` border and `--shadow-featured`.
  - Must include a floating ribbon or top badge: `BEST SELLER` or `PALING POPULER`.
  - Highlighted CTA button in solid brand gradient (`background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-light))`).

---

### 2.7 Slide 7: Closing Banner & App Store Badges
*Purpose:* Convert momentum into concrete contact and app store downloads.

```
+------------------------------------------------------------------------------------+
|  +==============================================================================+  |
|  | SIAP MENTRANSFORMASI BISNIS ANDA?                                            |  |
|  | Hubungi tim kami hari ini untuk sesi demonstrasi gratis dan konsultasi.     |  |
|  |                                                                              |  |
|  | [ Apple App Store Badge ]        [ Google Play Store Badge ]                 |  |
|  +==============================================================================+  |
|                                                                                    |
|  +-------------------+ +--------------------+ +-----------------+ +--------------+  |
|  | [WA] WhatsApp     | | [@] Email Official | | [W] Website     | | [P] Kantor   |  |
|  | +62 812-3456-7890 | | hello@company.com  | | www.company.com | | Jakarta, ID  |  |
|  +-------------------+ +--------------------+ +-----------------+ +--------------+  |
+------------------------------------------------------------------------------------+
```

- **App Store & Google Play Pills:** Styled buttons with official vector logos, black background (`#000000`), white text, and rounded pill border (`border-radius: 9999px; border: 1px solid rgba(255,255,255,0.2)`).
- **Contacts Grid:** 4-column balanced card grid with verified clickable links (`wa.me`, `mailto:`, `https://`).

---

### 2.8 Slide 7: Differentiator Table Archetype
*Purpose:* Establish clear competitive advantages, transparent market positioning, and honest trade-offs across alternatives to build rapid enterprise trust.

```
+------------------------------------------------------------------------------------+
|  [Eyebrow Badge: KEUNGGULAN KOMPETITIF]                                            |
|  Mengapa Memilih Solusi Kami Dibandingkan Alternatif Lain                          |
|                                                                                    |
|  +------------------------------------------------------------------------------+  |
|  | Fitur / Dimensi    | Brand Kami (Hero)| Kompetitor A| Kompetitor B| Manual   |  |
|  | (28% Col Width)    | (22% Highlighted)| (16% Width) | (16% Width) | (18% W)  |  |
|  |--------------------+------------------+-------------+-------------+----------|  |
|  | Model Biaya        | [v] Flat Bulanan | [x] Per-item| [x] Per-item| [x] Boros|  |
|  | Standar Brand DNA  | [v] AI Otomatis  | [x] Manual  | [x] Nihil   | [!] Acak |  |
|  | Integrasi Alur     | [v] 1 Terpadu    | [!] Parsial | [x] Terpisah| [x] Silo |  |
|  | Setup Infrastruktur| [!] Butuh GPU    | [v] Cloud   | [v] Cloud   | [v] Nihil|  |
|  +------------------------------------------------------------------------------+  |
|                                                                                    |
|  +------------------------------------------------------------------------------+  |
|  | [!] CATATAN TRANSPARANSI (HONESTY CALLOUT):                                  |  |
|  | "Kami terbuka tentang trade-off — lihat baris Setup Infrastruktur.           |  |
|  |  On-premise GPU menjamin 100% kedaulatan data tanpa vendor lock-in cloud."   |  |
|  +------------------------------------------------------------------------------+  |
+------------------------------------------------------------------------------------+
```

- **Table Layout & Column Widths:**
  - 4–5 column grid/table structure with deliberate asymmetric column weighting:
    - **Capability / Dimension Column:** `26%–30%` width, left-aligned, establishing the evaluation criteria clearly.
    - **Brand Hero Column (`.brand-col`):** `20%–24%` width, elevated visual prominence.
    - **Competitor & Manual Columns:** `16%–18%` width each, equally distributed for objective comparison.
  - Table container (`.table-container`) bound within the inner safe zone (`1760×960px`), with subtle border dividers (`border-bottom: 1px solid var(--brand-border)`).
- **Brand Column Highlight (`.brand-col`):**
  - Highlighted with subtle brand tint background (`var(--brand-primary-subtle)`, ~10–12% opacity) applied to both `<th>` and all `<td>` cells in the column.
  - Accentuated with subtle vertical borders (`border-left: 2px solid var(--brand-primary); border-right: 2px solid var(--brand-primary)`) to create an anchor pillar that immediately draws the eye upon slide transition.
  - Bold typography in brand color (`--brand-text-primary` and `--brand-primary-light`) reinforcing the solution's identity.
- **Dual-Coded Icon Treatments (Check / Cross / Warn):**
  - Strict compliance with WCAG 1.4.1 (never convey information by color alone):
    - **Positive / Checkmark (`.comparison-check`):** Vector check icon in `--color-success` (`#10b981`, >= 5.4:1 contrast) paired with explicit descriptive text (e.g., "Flat Bulanan", "AI Otomatis").
    - **Negative / Cross (`.comparison-cross`):** Vector cross icon in `--color-problem` (`#ef4444`, >= 4.6:1 contrast) paired with succinct friction copy (e.g., "Per-item", "Manual", "Terpisah").
    - **Warning / Trade-off (`.comparison-warn`):** Vector alert triangle icon in amber warning tone (`#f59e0b`, >= 4.5:1 contrast) indicating partial support, technical prerequisite, or manual intervention.
- **Honesty Callout Box (`.honesty-callout`):**
  - Positioned directly below the table with `margin-top: 18px` to anchor the conclusion of the comparison.
  - Glassmorphic card styling with `border: 1px solid var(--brand-card-border)`, background tint, and an inline SVG information icon (`20×20px`).
  - **Psychological Principle:** Radical transparency (explicitly calling out where a competitor or alternative has a simpler aspect, like cloud hosting vs. on-premise GPU) builds immense credibility and disarms buyer skepticism during enterprise reviews.
- **Visual Scanning & Contrast Principles:**
  - Designed for horizontal **F-pattern scanning**: evaluators anchor on the left feature row header, jump to the brand column for immediate verification, and contrast against competitors on the right.
  - Header aligns strictly to the left in accordance with the *Badge-Title Alignment Consistency Rule* for left-aligned tabular data.

---

### 2.9 Slide 8: Social Proof / Testimonials Archetype
*Purpose:* Reinforce enterprise credibility, reduce purchase anxiety, and validate performance claims via peer testimonials and recognized client logos.

```
+------------------------------------------------------------------------------------+
|               [Eyebrow Badge: BUKTI KEPERCAYAAN & REPUTASI]                        |
|             Dipercaya oleh Pemimpin Industri & Mitra Terkemuka                     |
|                                                                                    |
|  +------------------------------------+    +------------------------------------+  |
|  | ["] Decorative Quote SVG (32px)    |    | ["] Decorative Quote SVG (32px)    |  |
|  | "Implementasi platform memangkas   |    | "Solusi paling andal dan intuitif  |  |
|  |  waktu operasional hingga 60%      |    |  yang pernah diadopsi enterprise   |  |
|  |  dalam kuartal pertama adopsi."    |    |  kami. Kolaborasi tim melesat."    |  |
|  |                                    |    |                                    |  |
|  | — Budi Santoso, CTO                |    | — Siti Wulandari, VP Ops           |  |
|  |   PT Finansial Mandiri (Fintech)   |    |   Nusantara Logistics (Supply)     |  |
|  +------------------------------------+    +------------------------------------+  |
|                                                                                    |
|  +==============================================================================+  |
|  | LOGO TRUST BAR (Grayscale SVG logos, opacity 0.65, hover to full color)      |  |
|  |  [ Logo 1 ]     [ Logo 2 ]     [ Logo 3 ]     [ Logo 4 ]     [ Logo 5 ]      |  |
|  |  ATAU FALLBACK PILLS: [PT Finansial] [Nusantara Log] [Astra Corp] [Telko]    |  |
|  +==============================================================================+  |
+------------------------------------------------------------------------------------+
```

- **Layout & Grid Composition:**
  - 2-column balanced grid (`.testimonials-grid`, `grid-template-columns: repeat(2, 1fr); gap: 28px;`) for high-impact executive testimonials (or 3-column when 3 concise quotes are provided).
  - Centered slide header layout strictly complying with the *Badge-Title Alignment Consistency Rule* (`text-align: center;`, with `.badge-eyebrow` centered via `margin-inline: auto`).
  - Cards use standard container styling (`background: var(--brand-card-bg); border: 1px solid var(--brand-card-border); border-radius: var(--radius-lg); padding: 32px 30px;`).
- **Quote Cards & Typography:**
  - Prominent decorative quote icon (`.quote-icon`, 32×32px SVG, `color: var(--brand-primary-light)` at 30%–40% opacity) positioned above the quote text.
  - Quote copy (`.testimonial-quote`): styled in `17px–19px`, `line-height: 1.6`, font weight 400/500 in `--brand-text-primary` (`#f8fafc`).
  - Focus quotes on tangible outcomes: operational hours saved, ROI percentage, deployment speed, or system uptime rather than generic flattery.
- **Client Attribution Hierarchy:**
  - Author info container (`.testimonial-attribution`) pairing an avatar circle (`.author-avatar`, 44×44px, initial monogram or photo, `border-radius: 50%`) with structured metadata.
  - 3-level typographic hierarchy:
    - **Author Name (`.author-name`):** `15px`, bold (`font-weight: 700`), `--brand-text-primary`.
    - **Title / Role (`.author-title`):** `13px`, `--brand-text-secondary`.
    - **Company / Sector (`.author-company`):** `13px`, `--brand-text-muted` or `--brand-primary-light`.
- **Grayscale Trust Bar & Fallback Pills:**
  - Bottom-anchored trust badge strip (`.trust-logo-bar`) centered horizontally with `display: flex; justify-content: center; gap: 36px–48px;`.
  - **Grayscale Treatment:** External brand logos must use `filter: grayscale(100%) opacity(0.65)` on dark backgrounds (`#0f172a`) to eliminate jarring color dissonance and preserve deck visual unity; smoothly transitions to `filter: grayscale(0%) opacity(1)` on `:hover`.
  - **Fallback Company Pills (`.company-pill`):** When SVG logos are unavailable, render client names in elegant pill badges (`border-radius: 9999px; border: 1px solid var(--brand-card-border); background: var(--brand-card-bg); padding: 8px 18px; font-size: 13px; font-weight: 600; color: var(--brand-text-secondary);`).

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

Computed against the slide background `--brand-surface` (`#0f172a`):

| Token | Hex Value | Contrast Ratio | Result |
|-------|-----------|----------------|--------|
| `--brand-text-primary` | `#f8fafc` | **16.8 : 1** | PASS (AAA) |
| `--brand-text-secondary` | `#cbd5e1` | **10.5 : 1** | PASS (AAA) |
| `--brand-text-muted` | `#94a3b8` | **5.8 : 1** | PASS (AA Normal, AAA Large) |
| `--brand-primary` (Venturo Teal) | `#009BAD` | **4.7 : 1** | PASS (AA Normal, AAA Large) |
| `--color-success` | `#10b981` | **5.4 : 1** | PASS (AA Normal, AAA Large) |
| `--color-problem` (Warning Red) | `#ef4444` | **4.6 : 1** | PASS (AA Normal, AAA Large) |

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

Slide presentations must export seamlessly to PDF via browser print (`Ctrl+P` / Reveal print mode):

```css
@media print {
  /* Set exact 16:9 page dimensions */
  @page {
    size: 1920px 1080px landscape;
    margin: 0;
  }

  body, .reveal {
    background-color: var(--brand-surface) !important;
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
