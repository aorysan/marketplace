# Insightify HTML Output & Skill Restructure — Design Spec

- **Date:** 2026-08-20
- **Status:** Draft (pending review)
- **Scope:** Rework Insightify plugin output from a VitePress-deployable website to a single artifact-style HTML document; restructure 7 skills → 4 stage skills + 1 orchestrator.
- **Reference:** Artifact example `d4a1b3fd-2069-437c-822d-5df697a97e3d`; design discussion 2026-08-20.

## 1. Goals

1. Final output is a **single self-contained HTML file** (`index.html`) that *looks* like a website but is **not a deployable website** and has **no JavaScript** — a long static document with clean typography (artifact-style).
2. **Product Knowledge Base is the primary output** (one file), consistent with the reference image note.
3. Restructure the plugin from 7 skills to **5 files**: orchestrator `insightify` + 4 stage skills `planner`, `writer`, `reviewer`, `builder`.
4. Remove all VitePress machinery (npm, `.vitepress/`, hero `index.md`, config.js, sidebar, `docs:dev`).

## 2. Skill Restructure

| New skill | Replaces | Folder | Command |
|---|---|---|---|
| `insightify` (orchestrator) | `insightify` (unchanged role) | `skills/insightify/SKILL.md` | `/insightify` |
| `planner` | `ingest` + `extract` + `plan` | `skills/planner/` | `/planner` |
| `writer` | `write` | `skills/writer/` | `/writer` |
| `reviewer` | `review` | `skills/reviewer/` | `/reviewer` |
| `builder` | `build` | `skills/builder/` | `/builder` |

Old folders `skills/ingest/`, `skills/extract/`, `skills/plan/`, `skills/write/`, `skills/review/`, `skills/build/` are deleted after assets are moved.

### Asset moves

| Asset | From | To |
|---|---|---|
| `code-parser.js`, `html-parser.js`, `pdf-parser.js` | `skills/ingest/parsers/` | `skills/planner/parsers/` |
| `extraction-schema.md` | `skills/extract/references/` | `skills/planner/references/` |
| `plan-template.md` | `skills/plan/templates/` | `skills/planner/templates/` |
| `api-template.md`, `guide-template.md`, `faq-template.md` | `skills/write/templates/` | `skills/writer/templates/` |
| `review-criteria.md` | `skills/review/references/` | `skills/reviewer/references/` |
| (deleted) `vitepress-config.js`, `index-template.md`, `sidebar-template.js` | `skills/build/templates/` | — |

### Skill contents

- **`planner/SKILL.md`**: internal phases Ingest → Extract → Plan → user approval → save plan. Reuses ingest instructions (1–4), extract instructions (1–2), plan instructions (1–5). References parsers, extraction schema, plan template via new relative paths.
- **`writer/SKILL.md`**, **`reviewer/SKILL.md`**: existing content, renamed command references.
- **`builder/SKILL.md`**: reworked output (see §4).

## 3. Output Structure (`insight/<project-name>/`)

```
insight/<project-name>/
├── index.html              # single artifact-style document (no JS)
├── knowledge-base.md       # PRIMARY output — one file
├── docs/
│   ├── intake/             # copy of ingest results (from .insightify/sources/)
│   ├── plan/               # copy of approved plan.md
│   ├── markdown/           # writer pages (source of index.html render)
│   └── review/             # copy of review report
└── .insightify/            # internal workspace
    ├── sources/            # source-XXX.md (per source) + manifest.md
    ├── knowledge/          # 7 category files (unchanged, internal)
    ├── plan.md
    └── review/
```

- `OUT_DIR = "insight/<project-name>/"` (unchanged relative to workspace root).
- All stage data lives in `.insightify/`; `docs/` holds copies; `index.html` and `knowledge-base.md` are built by `builder`.
- `docs/markdown/*.md` are the render source; editing them + re-running `/builder` re-renders `index.html`.

## 4. Builder (`builder`) Behavior

1. Read `docs/markdown/*.md` + `docs/plan/` + `docs/intake/`.
2. Concatenate all pages in plan writing order into one markdown document, then render to **one** `index.html` (inline CSS, **no JS**, no dependencies).
3. Header: project title & description from knowledge base / plan (`{{TITLE}}`, `{{HEADER}}`).
4. **Product Overview section**: render `product.md` + `features.md` from `.insightify/knowledge/` as a grid of product cards + feature list.
5. **Documentation pages**: render all markdown pages in sequence, each as a `<section class="doc-page">` with a label, separated by a horizontal rule.
6. **Process section**: static workflow diagram (4 steps) showing Planner → Writer → Reviewer → Builder with In/Out labels, rendered via CSS flexbox.
7. Assemble `knowledge-base.md` from the 7 `.insightify/knowledge/*.md` files, with per-category headings and preserved source citations — one file in output.
8. Copy `docs/intake`, `docs/plan`, `docs/review` from `.insightify` (archive).
9. Validate internal links (now anchors within the single document); no orphan pages.
10. Completion summary: open `index.html`; no `npm install` or `npm run docs:dev`.

Implicit dependencies for builder: `docs/markdown/*` (writer), `.insightify/knowledge/` (planner), `.insightify/plan.md` (planner), `.insightify/sources/` (planner). External: none (no npm).

### New templates

- `skills/builder/templates/index-html-template.html` — placeholder: `{{TITLE}}`, `{{HEADER}}`, `{{CONTENT}}`, `{{STYLE}}`.
- `skills/builder/templates/build-html.mjs` — small markdown→HTML renderer (headings, paragraphs, code, links, tables, lists, blockquote/citations) + doc-joiner + knowledge-base assembler + product-overview builder.

### Removed

- `skills/build/templates/vitepress-config.js`
- `skills/build/templates/index-template.md`
- `skills/build/templates/sidebar-template.js`
- Generated output `package.json` (with vitepress scripts) — no longer created.

### index.html structure (artifact-style)

```
┌────────────────────────────────────────────────┐
│  INSIGHTIFY GENERATED DOCUMENTATION · vX.Y.Z  │  ← kicker + version
│  <Product Name>                                │  ← from product_metadata
│  <Tagline / description>                       │  ← from product_metadata.tagline
│────────────────────────────────────────────────│
│  PRODUCT                                       │  ← label
│  Product Overview                              │
│  ┌──────────────┬──────────────┐               │
│  │ Product Name │ Version      │               │  ← from product.md
│  │ Company      │ Audience     │               │  ← from product.md + features.md
│  └──────────────┴──────────────┘               │
│  Features: • Core Feature 1 • Core Feature 2  │  ← from features.md
│  > Source: source-XXX.md § section             │  ← preserved citations
│────────────────────────────────────────────────│
│  <DOC SECTION LABEL>                           │  ← e.g. USER GUIDE
│  ## Page Title                                 │  ← from docs/markdown/*.md
│  ...content...                                 │
│────────────────────────────────────────────────│
│  (repeated for each planned page in order)     │
│────────────────────────────────────────────────│
│  PROCESS                                       │
│  Documentation Pipeline                        │
│  [Planner] → [Writer] → [Reviewer] → [Builder] │  ← static CSS flexbox
│  > Primary output = Product Knowledge Base     │
│────────────────────────────────────────────────│
│  Generated by Insightify │ Company · Date      │  ← footer
└────────────────────────────────────────────────┘
```

**Styling (inline CSS, no JS)**:
- Fonts: **Space Grotesk** (headings), **Inter** (body), **JetBrains Mono** (code) — loaded from Google Fonts with fallback stacks.
- Palette: neutral background (light/dark via `prefers-color-scheme` + explicit theme tokens), single accent color (default #16705e teal, configurable via template).
- Dark mode: automatic via `prefers-color-scheme`; tokens redefined in `@media` and `[data-theme="dark"]` for correct rendering in all viewer states.
- Layout: single-column, max-width ~860px, centered; sections separated by subtle borders; responsive down to mobile.
- No interactive components: no tabs, no sidebar, no search, no dark-mode toggle — pure static document.

## 5. Orchestrator (`insightify`)

Four sequential steps, one per skill:

```
/insightify
   ├─ 1. planner     → sources + knowledge + approved plan
   ├─ 2. writer      → docs/markdown/*.md
   ├─ 3. reviewer    → review → send revisions back to writer (max 3 iterations)
   └─ 4. builder     → index.html + docs/ archive + knowledge-base.md
```

- No more "Stage 1…Stage 6"; orchestrator calls the 4 skills by name.
- Progress indicators and resilience rules from the current orchestrator are preserved, adapted to the 4-step flow and new names.
- `--resume [--from-step N]` detects step completion from `.insightify/` state; `/builder` is idempotent (re-render from `docs/markdown/`).
- CLI argument parsing (`--project`, `--source`, `--config`, `--dry-run`) unchanged.

## 6. Knowledge Base

- Internal: `.insightify/knowledge/` remains **7 category files** (product, features, terminology, api, workflows, constraints, unanswered) — unchanged, used by extract & plan.
- Output: **`knowledge-base.md`** — single file assembled by builder from the 7 categories, with headings per category, preserved YAML frontmatter (stripped) and source citations. This is the **primary output** per the reference image.

## 7. Manifest & Metadata Updates

- `.claude-plugin/plugin.json`: description → e.g. "Generate artifact-style documentation and a knowledge base from files and URLs"; keywords → drop `vitepress`; version bump to `4.0.0` (breaking change: output format).
- `.claude-plugin/marketplace.json`: same description.
- `README.md` + root `package.json`: remove vitepress references and `docs:dev` instructions; document `/insightify` and the 4 stage skills; note no npm dependency for output.

## 8. Test Updates

| Test file | Change |
|---|---|
| `tests/ingest-parsers.test.js` | parser import path → `skills/planner/parsers/…` |
| `tests/extract-schema.test.js` | schema import path → `skills/planner/references/…` |
| `tests/plan-template.test.js` | plan template path → `skills/planner/templates/…` |
| `tests/write-templates.test.js` | write templates path → `skills/writer/templates/…` |
| `tests/review-criteria.test.js` | review criteria path → `skills/reviewer/references/…` |
| `tests/build-templates.test.js` | rewrite: assert new HTML template contains placeholders (`{{TITLE}}` etc.) and no VitePress traces |
| `tests/orchestrator.test.js` | assert orchestrator references `planner`, `writer`, `reviewer`, `builder` and no "Stage N" labels |
| `tests/scaffold.test.js` | version assertion 1.0.0 → 4.0.0 (currently stale) |
| `tests/integration/pipeline.test.js` | replace `sidebar-template` import with `build-html.mjs`; end-to-end assert single `index.html` with concatenated pages + product overview + workflow |

## 9. Out of Scope

- Functionality of parsers, extraction schema, plan template, review criteria — **unchanged** (only paths/names change).
- No backend, build step, or npm output for the generated artifact.
- No interactive JS/Tabs in `index.html`.
- Input format (Intake JSON) — unchanged; only output rendering changes.

## 10. Rollout / Cleanup

1. Move assets & create new skill folders (names + descriptions updated).
2. Rewrite `builder/SKILL.md` + new templates + `build-html.mjs`.
3. Update orchestrator, manifests, README, package.json.
4. Update tests.
5. Run `npm test` — all green.
6. Remove old folders & confirm nothing references them.