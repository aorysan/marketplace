# Compro v2.6 Design — Multi-Template (`--theme + folder`) + `modern` (congen6 Port)

- Version: 2.6.0 (minor, backward-compatible; default theme unchanged)
- Date: 2026-09-17
- Status: DRAFT — awaiting user review of this file before implementation plan
- Golden reference: `compros/congen6/index.html` (130 KB, 9 slides, Modern Editorial Tech)
- Prior spec line: `2026-09-15-canva-editorial-overhaul-and-workspace-sync-design.md` (v2.5.0)

## 1. Problem & Goal

Running the v2.5.0 plugin end-to-end does not reproduce `congen6` quality.
Reaching congen6 required manual throwaway scripts
(`build_deck.py`, `generate_final_deck.py`, `update_html.py`, `apply_refinements.py`).
Evidence:

- Different design system: plugin `editorial.css` (`#F4F5F7` + charcoal `#232220`,
  8 `canva-*` archetypes) vs congen6 (`#F8FAFC` + slate `#0F172A`, unified
  `editorial-slide-container` + `slide-header` + bento grids). The editorial
  renderers in `skills/builder/scripts/build-deck.js` (`renderEditorial*`) are
  generic and do not implement the `canva-*` splits from `editorial.css`.
- 5 latent bugs, all patched manually and logged in
  `compros/congen6/reports/build.log:48-54`: unclosed `<table>` (foster-parenting),
  asset dedup (`image-fetcher.js:124` always `urls[0]` → 8 identical photos),
  display specificity (Reveal `0,1,2` beats `.archetype-*` `0,1,0`), typography
  specificity (Reveal `h1-h6` beats `.section-title`), card clipping.
- Fragile writer → builder contract: writer asks 150–250 words/slide
  (`skills/writer/SKILL.md:17-20`) but congen6 works at 85–138 words
  (`reports/build.log:10-18`); differentiator/pricing tables and image slots are
  assembled by hand, not emitted by writer; `image-fetcher.js` (149 lines) is a
  stub with 2 URLs per category.
- Template images do not match slide content; no content-aware image selection.

Goal (agreed): with the improved plugin, `node scripts/build-deck.js
--name=<slug> --theme=<name>` produces a congen6-level deck with **minimal tuning**
(~90%+ correct, no manual CSS rewrite). `congen6` becomes one template
(`modern`) inside an extensible multi-template system; future templates are added
as folders. Scope: **builder + writer/reviewer** (publisher/SEO out of scope
except keeping existing behavior intact).

Non-goals: changing the default theme (stays `editorial`), JSON-IR rewrite of the
pipeline (rejected as over-engineering), touching deployment (Phase 6) behavior.

## 2. Architecture — Template Registry via `--theme + folder`

```
skills/builder/templates/<theme>/
  manifest.json   # { name, version, archetypes[10: 9 main + 1 generic social-proof],
                  # slots{...}, cssFile, shellFile }
  shell.html      # placeholders CSS_INLINE + SLIDES_INLINE (same shape as
                  # templates/editorial-shell.html:19,25) plus {{META}} for
                  # meta/OG/JSON-LD head tags
  theme.css       # full per-theme design system, no cross-theme sharing
skills/builder/scripts/
  build-deck.js        # dispatcher only: load manifest → require ./themes/<theme>.js
  themes/editorial.js  # moved as-is: existing renderCanva* (cover, welcome,
                       # services, ecosystem, metrics, differentiator, pricing, closing)
  themes/modern.js     # NEW: 9 renderers ported from congen6 (see §4)
```

Data flow (unchanged CLI): `--name=<slug> --theme=modern` → `detectProjectRoot`
(shared) → `parseAndSanitizeMarkdown` (shared) → per-theme `classify` →
per-theme `render*` → inline `theme.css` into `shell.html` → write
`compros/<slug>/index.html` → `postBuildSyncGuarantee()`.

Error handling: unknown `--theme` → list available themes, fall back to
`editorial` with a warning in `reports/build.log` (pipeline stays resumable).
Invalid `manifest.json` → hard fail `Error: invalid manifest for theme <name>`.

Compatibility: `editorial` remains the default; legacy `profile` keeps working.
Theme 3+ = new folder + manifest, zero dispatcher changes.

## 3. Builder Core Fixes (shared, all themes)

Port the five manual patches from `build.log:48-54` into permanent code:

1. **Unclosed table.** Close `</table></div>` in every table renderer; add a
   post-build structural assert: every `<section>` must be a direct child of
   `div.slides` and count must equal totalSlides, else fail naming the slide.
2. **Asset dedup.** Replace `urls[0]` in `image-fetcher.js:124` with
   `urls[(slotIndex + slugHash) % urls.length]`; expand `CURATED_IMAGE_CATALOG`
   to 30–50 distinct Unsplash direct-CDN IDs across office/team/tech/architecture/
   meeting (seeded from the distinct-md5 set in `congen6/assets/`); log md5 + bytes
   per file; Phase 3b fails the build on duplicate md5 or file < 10 KB.
3. **Display specificity.** Every archetype root (canva + modern) declares
   `display: grid/flex !important`, scoped as
   `.reveal .slides section.archetype-*`, with a comment citing Reveal `0,1,2`
   vs theme `0,1,0`.
4. **Typography specificity.** Replace bare `.section-title`/`.slide-title` with
   `.reveal .section-title`, `.reveal .slide-title`, `.reveal .hero-main-title`,
   etc. Modern scale (from congen6): hero 52, section 28–32, card 21–22, body
   13.5–15.5, big-number 42 (`#007A87`).
5. **Card clipping.** Audit padding + `line-height: 1.35–1.45` + `min-height: 0`
   on flex children + `overflow: hidden` on the 1080p container.

## 4. `templates/modern/` — congen6 Port

- `theme.css`: extracted `<style>` from `compros/congen6/index.html` (~1500 lines),
  deduped (`metrics-side-note` etc.), tokens locked to `#F8FAFC` / `#0F172A` /
  `#009BAD` / `#007A87`.
- `shell.html`: congen6 head (fonts, Reveal CDN, meta/OG/JSON-LD as `{{META}}`
  placeholders) + `Reveal.initialize({width:1920, height:1080, margin:0,
  center:false, transition:'none'})`.
- `scripts/themes/modern.js`: 9 main renderers consuming the shared parsers
  (`parseEditorialCards`, `extractBigNumberMetric`): `hero-layout-grid` 52/48,
  `two-col-layout-grid` 36/64 + `cards-vertical-stack`, `services-layout-grid`
  32/68 + 2x2, `ecosystem-grid-split` + GPU panel + orbit SVG, `metrics-layout-grid`
  + 2x2 + disclaimer strip, `diff-table` + pillars + callout, `pricing-cards-grid`
  (elevated), `closing-3col-grid`, **plus 1 generic-cards archetype for Social
  Proof / Testimonials** (3-column quote-card grid reusing the problem/solution
  card structure with quote marks + attribution). Slide count is therefore
  flexible (9–10): the social-proof archetype renders only when testimonial or
  portfolio-client data exists in the input docs; the deck is never forced to
  exactly 9 slides.
- 9 distinct image slots (hero/problem/metrics = distinct architecture-portrait
  IDs; solution = creative-meeting; services/ecosystem = tech-workspace;
  closing left/right = architecture-portrait + corporate-team).
- Hard rule: delete the hallucinated-default pattern (`defaultServices`,
  `fallbackCards`, `defaultMetrics` in `build-deck.js:1546-1564`). When data is
  missing, render what exists + warn in `build.log` (Zero Hallucination).

## 5. Hybrid Image Pipeline (search + generate, project-local, preview guarantee)

Writer emits one directive per slide (see §6):

```html
<!-- image: <slot> -- query: <1 sentence EN> ; keywords: <3-5 words> ; style: photo -->
```

Fetch order per slot (deterministic, shared core):

1. **Search** — keyword-score the expanded curated catalog (§3.2); take the
   highest-scoring image not already used by another slide (distinctness).
2. **Generate (Tier 2)** — on low score / download failure, request
   `https://image.pollinations.ai/prompt/<urlencoded_query>?width=800&height=1200&nologo=true`
   (portrait slots; `width=1600&height=900` for landscape slots), saved locally.
   Strict **5,000 ms timeout per request**; on timeout or HTTP error, cascade
   immediately to tier 3. Total asset-acquisition budget per build: **15 seconds**
   max (tracked in `build.log` as `[ASSETS] elapsed=Xs`).
   Note: AI generation often takes longer than 5 s on slow networks, so Tier 2
   will frequently fall through to SVG under this budget — that is the accepted
   trade-off for fast deterministic builds; the curated catalog (tier 1) carries
   the relevance load.
3. **Final fallback** — existing local vector SVG (never a broken image).

Guarantees: every `<img>` references a project-local file
`compros/<slug>/assets/slide-*.jpg` (never hotlinks, never template-static);
build-time validation (exists, > 10 KB, valid image header); distinct-md5 check;
`postBuildSyncGuarantee` copies generated images with the bundle; Phase 3b opens
the deck and verifies each image renders. Any validation failure cascades to the
next tier; the build only goes green when the preview is intact. Valid files are
not re-downloaded (`--force-assets` overrides).

## 6. Writer/Reviewer Contract (template-consumable markdown)

Writer (`skills/writer/SKILL.md`):

- 85–140 words/slide (replaces 150–250).
- Mandatory image directive per slide (§5 format).
- Pricing = 3-row markdown table `| Tier | Harga | Fitur (;-separated) |`,
  middle row is Pro.
- Differentiator = 4–5 column table + `**Intinya:** ...` honesty line.
- Metrics = bullets `- **<number>** <title> — <desc>` with `%`, `:`, `Rp`, `vX`
  formats so `extractBigNumberMetric` never falls back to `100%`.
- Keep Zero Hallucination + ≤ 40% verbatim repetition.

Reviewer (`skills/reviewer/SKILL.md`):

- Capacity checklist becomes 85–140 words, H1 per slide (unchanged shape).
- New **template-consumability** checklist → `REVISION_REQUIRED` when: image
  directive missing, pricing table not 3 parseable rows, differentiator < 4
  columns and bullets not convertible, metrics not matching the big-number regex,
  honesty callout missing while a competitor wins one aspect.
- Contact-placeholder + SEO behavior unchanged.

## 7. Testing

- Fixtures: add modern variants `test-fixtures/expected/01-draft.modern.md`,
  `02-final.modern.md` (image directives + parseable tables).
- New `scripts/test-theme-dispatch.js`: editorial default stays green; modern
  renders 9 direct-child sections.
- Specificity regression asserts: `!important` grid/flex roots and
  `.reveal .section-title` present in every `theme.css`.
- Asset tests (mocked downloads): distinct md5, > 10 KB, fallback chain ends in
  local SVG, files land in `compros/<slug>/assets/`.
- `test-writer-schema`: 85–140 words + image directive present.
  `test-reviewer-schema`: consumability checklist enforced.
- Golden: `compros/congen6/index.html` is the visual reference for
  `--theme=modern` via **DOM structural assertions + archetype checklist — never
  screenshot pixel-diff** (headless font rendering differs across Linux/macOS/
  Windows, making pixel diffs flaky). The four mandatory asserts:
  1. `<section>` count exactly equals totalSlides.
  2. Zero foster-parenting: no section outside root `.reveal .slides`.
  3. Every `<img>` references a local file > 10 KB with a unique md5.
  4. Key elements present per archetype (`.diff-table`, `.pricing-card`,
     big-number metric, orbit SVG, closing contact grid).

## 8. Rollout — v2.6.0

Bump `2.5.0 → 2.6.0` (minor: new template, backward-compatible): `plugin.json` +
each `manifest.json`, `node scripts/sync-plugin.js` (marketplace + global cache),
README "What's New in v2.6.0" section. Default stays `editorial`; `modern` is
opt-in via `--theme=modern`. Existing editorial users are unaffected.

## 9. Resolved During Review (2026-09-17)

1. **Keyless endpoint:** `image.pollinations.ai` Tier 2 with 5 s per-request
   timeout, 15 s total asset budget (§5). Accepted trade-off: slow networks fall
   through to SVG; tier 1 curated catalog carries relevance.
2. **Slide flexibility:** modern = 9 main + 1 generic social-proof archetype,
   9–10 slides (§4). Writer keeps 7–10 dynamic range; builder never forces 9.
3. **Golden-diff:** DOM structural assertions only, 4 mandatory asserts (§7).
