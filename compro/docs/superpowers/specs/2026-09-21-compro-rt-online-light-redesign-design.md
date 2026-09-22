# Compro RT Online Light Redesign — Design Spec (v2.8.0)

- Date: 2026-09-21
- Scope: overwrite `modern` template in place (no new `--theme` flag)
- Source style: `assets/compro/` (RT Online PDF, 15 slides 1920x1080) — style reference only, not hardcoded assets
- Problem: PDF pages 6-9 dense (slide-06 = 11 bullets two-column small text + right photo strip, no cards/icons)

## 1. Goals / Non-goals

Goals:
- Light readable deck: canvas `#FFFFFF`, headline `#0B3B82`, body `#334155`, accent Venturo `#009BAD`.
- No text-heavy slides: max 4 cards or 6 bullets or 60 words per slide; overflow auto-splits into Part 2/3.
- Images adapt to client content (dynamic query pipeline), not fixed RT Online photos.
- Single-template builder preserved (`templates/modern/` only).

Non-goals:
- No new theme dispatcher, no `--theme` flag.
- No pixel-clone of PDF, no hardcoded `key-assets/` PNGs as defaults.
- No pricing/IA change, no publisher/deploy change.

## 2. Architecture (files touched)

- `skills/builder/templates/modern/theme.css` — overwrite to light system (section 3). Keep HSL vars `--brand-h/s/l` for per-client tint.
- `skills/builder/templates/modern/manifest.json` — bump 2.6.0 → 2.8.0; archetypes add `feature-split`, `feature-cards`.
- `skills/builder/templates/modern/README.md` — document light tokens + 2 new archetypes.
- `skills/builder/references/design-tokens.md` — light palette, typography unchanged (Plus Jakarta Sans + Inter), contrast rules.
- `skills/builder/references/visual-hierarchy.md` — add `feature-split` / `feature-cards` composition + density rules.
- `skills/builder/SKILL.md` — update chunking (§ deterministic chunking + archetype mapping + image pipeline note).
- `skills/writer/SKILL.md` — budget 85-140 → 40-60 words/slide; bullet format `**Title** — 8-12 word desc`; prioritization rule for overflow.
- `skills/reviewer/SKILL.md` — add density checklist (reject >6 bullets, >60 words, bullet >20 words).
- `scripts/build-deck.js` + `themes/modern.js` (renderer) — deterministic splitter + new renderers.
- `test-fixtures/expected/` — add condensed golden fixtures.

## 3. Design tokens (light)

```css
--canvas-bg: #FFFFFF;
--text-headline: #0B3B82;
--text-body: #334155;
--text-muted: #64748B;
--brand-primary: #009BAD;
--brand-dark: #007A87;
--surface-border: rgba(11, 59, 130, 0.10);
--surface-shadow: 0 4px 20px -2px rgba(11, 59, 130, 0.08);
--radius-lg: 16px;
```

Type scale unchanged: H1 44px / H2 32px / H3 22px / body 16px / badge 12px uppercase. Body max 55ch, contrast body-on-white ≥ 4.5:1 (WCAG AA).

## 4. Components (approved: option A cards)

`feature-cards` (default for dense feature slides):
- Grid 2x2, card: SVG Lucide icon 28px + H3 22px + 1-line desc 15px Inter, white bg, radius 16px, border hover brand.
- Capacity: max 4 cards/slide. Overflow mapping: 5-8 points → 4 + remainder (Part 2); 9-12 points → 4+4+rest (Part 3). Continuation title: `Lanjutan: [Title] (Part N)`.
- Example (Warga & Iuran 11 pts → 4+4+3; Mobile Apps 8 pts → 4+4).

`feature-split` (hero / narrative / WA AI / closing):
- Left 78%: eyebrow badge + H1 `#0B3B82` + lead 22px + optional 2-col mini-cards.
- Right 22%: adaptive photo, radius 16px, brand overlay 20%, full-height 1080p.
- Replaces dense 2-col small-text PDF layout with breathing room.

Bullet condense rule: `**Hak Akses** — Atur peran Ketua/Sekretaris/Bendahara` (2-3 word title + 8-12 word desc). No 3-line paragraphs.

## 5. Data flow

1. Writer drafts 40-60 words/slide, 1 image directive per slide: `<!-- image: <slot> -- query: <1 EN sentence> ; keywords: <3-5> ; style: photo -->`. Overflow: rank top 4, mark rest for Part 2 (no fact dropping).
2. Reviewer blocks density violations + existing Zero Hallucination / ≤40% overlap / Zero Competitor Leak checks.
3. Builder maps dense `services`/`solution` → `feature-cards`; `hero`/`closing`/`ecosystem` → `feature-split`. Slot names in image directives are unchanged (`hero`, `problem`, `solution`, `services`, `ecosystem`, `metrics`, `differentiator`, `pricing`, `closing`); `feature-cards` consumes `services`/`solution` slots, `feature-split` consumes `hero`/`solution`/`closing`/`ecosystem` slots. Splitter counts bullets/words, emits Part slides.
4. Image pipeline per slide: Unsplash direct CDN → Picsum → inline SVG fallback. `key-assets/` only style reference. All generated SVGs inlined (`<svg>`, never `<img src="assets/*.svg">`).
5. Logs: `[CHUNK]`, `[COLOR]`, `[IMAGE]` to `compros/<slug>/reports/build.log`.

## 6. Error handling

| Case | Behavior |
|---|---|
| Markdown missing/empty | Stop: `Error: Markdown file not found at <path>` / `empty` |
| Image HEAD ≠ 200 / offline | Inline SVG fallback, log, continue |
| Brand color undetected | Fallback H186 S100% L34% (`#009BAD`), log |
| Over-budget slips past reviewer | Builder force-splits Part 1/2, never silently truncates |
| Legacy `<img src="assets/*.svg">` on rebuild | Auto-inline to `<svg>` |

## 7. Testing

- `node scripts/test-all.js` green; new condensed golden `02-final.modern.md` (40-60 words, `**Title** — desc` bullets) + HTML assertions (≤4 cards, ≤6 bullets, ≤60 words/slide).
- Phase 3b via bundled `impeccable` (`critique`, `audit`): overflow, balance, contrast checks.
- Manual: build from `assets/compro/input-drafts/` → pages 6-9 must yield ~7-8 card slides, none text-dense.
- Post-change: `node scripts/sync-plugin.js`.

## 8. Decisions log

- Overwrite `modern` (not new theme) — user approved.
- Hybrid condense + split — user approved.
- Adaptive images (not fixed `key-assets/`) — user custom answer: content varies, images must follow content.
- Layout A (2x2 cards) — user approved ("ikut rekomendasimu").
