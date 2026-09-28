# Insightify — Design Specification

**Date:** 2026-08-14
**Status:** Draft v2 (Enhanced)
**Author:** Brainstorming session
**Last Updated:** 2026-08-14

---

## 1. Overview

Insightify is a multi-platform plugin that generates complete documentation websites from source files and URLs. It ingests content, extracts product knowledge, plans documentation structure, writes pages, reviews quality, and builds a VitePress site — all through a 6-stage sequential pipeline orchestrated by a single entry point.

### Platforms

- **Claude Code** (primary)
- **Gemini CLI**
- **OpenCode**

### Trigger

- `/insightify` — interactive, asks for project name and sources
- `/insightify <url>` — URL provided directly, asks for project name
- Per-stage commands: `/insightify-ingest`, `/insightify-extract`, `/insightify-plan`, `/insightify-write`, `/insightify-review`, `/insightify-build`

### LLM Usage

Uses whatever model the user has active on their platform. No separate API key required.

### Final Outputs

1. **Documentation Website** — VitePress-ready site with auto-generated config, sidebar, navigation, and hero page
2. **Product Knowledge Base** — Structured Markdown files with YAML frontmatter

---

## 2. Architecture

### Approach: Multi-Skill Pipeline with Per-Stage Folders

Each of the 6 stages is an independent skill with its own folder containing supporting files (parsers, templates, references). A central orchestrator skill manages the sequential flow and stage dependencies.

### Project Structure

```
insightify/
├── skills/
│   ├── insightify.md                  ← Entry point / orchestrator
│   ├── ingest/
│   │   ├── ingest.md                  ← Stage 1 skill
│   │   └── parsers/
│   │       ├── pdf-parser.js
│   │       ├── html-parser.js
│   │       └── code-parser.js
│   ├── extract/
│   │   ├── extract.md                 ← Stage 2 skill
│   │   └── references/
│   │       └── extraction-schema.md
│   ├── plan/
│   │   ├── plan.md                    ← Stage 3 skill
│   │   └── templates/
│   │       └── plan-template.md
│   ├── write/
│   │   ├── write.md                   ← Stage 4 skill
│   │   └── templates/
│   │       ├── guide-template.md
│   │       ├── api-template.md
│   │       └── faq-template.md
│   ├── review/
│   │   ├── review.md                  ← Stage 5 skill
│   │   └── references/
│   │       └── review-criteria.md
│   └── build/
│   │   ├── build.md                   ← Stage 6 skill
│   │   └── templates/
│   │       ├── vitepress-config.js
│   │       ├── sidebar-template.js
│   │       └── index-template.md
├── .claude-plugin/
│   └── plugin.json
├── .gemini-plugin/
├── .opencode/
├── CLAUDE.md
└── README.md
```

### Stage Execution Rules

- Stages execute sequentially: 1 → 2 → 3 → 4 → 5 → 6
- Independent tasks inside a stage may run in parallel
- Stage 5 (Reviewer) can send work back to Stage 4 (Writer), max 3 iterations
- Stage 3 (Planner) requires user approval before Stage 4 starts
- Stage 4 (Writer) output requires user review before Stage 5 starts
- Stage 6 (Builder) only runs after documentation is approved

### Dual-Mode Stage Skills

Each stage skill operates in two modes:

1. **Orchestrated** — called by `insightify.md`, path and context pre-set
2. **Standalone** — called directly by user via its own command (e.g., `/insightify-extract`), handles its own input

---

## 3. Data Flow & Stage Communication

All stages communicate through a **workspace directory** (`.insightify/`) inside the user's output directory. Each stage reads from predecessor outputs and writes to its own designated location.

### Runtime Output Structure

```
<project-name>/                         ← output dir (user-named)
├── .insightify/                        ← workspace (intermediate state)
│   ├── sources/                        ← Stage 1 output
│   │   ├── manifest.md
│   │   ├── source-001.md
│   │   └── ...
│   ├── knowledge/                      ← Stage 2 output
│   │   ├── product.md
│   │   ├── features.md
│   │   ├── terminology.md
│   │   ├── api.md
│   │   ├── workflows.md
│   │   ├── constraints.md
│   │   └── unanswered.md
│   ├── plan.md                         ← Stage 3 output
│   └── review/                         ← Stage 5 output
│       └── review-report.md
│
├── docs/                               ← Stage 4 output → Stage 6 transforms
│   ├── index.md
│   ├── getting-started.md
│   └── ...
│
├── .vitepress/                         ← Stage 6 output
│   └── config.js
│
├── knowledge-base/                     ← Stage 6 output (finalized KB)
│   ├── product.md
│   ├── features.md
│   └── ...
│
├── package.json                        ← Stage 6 output
└── README.md                           ← Stage 6 output
```

### Stage Data Dependencies

| Stage | Reads | Writes |
|---|---|---|
| 1. Ingest | User-provided files/URLs | `.insightify/sources/` |
| 2. Extract | `.insightify/sources/` | `.insightify/knowledge/` |
| 3. Plan | `.insightify/knowledge/` | `.insightify/plan.md` |
| 4. Write | `.insightify/plan.md` + `.insightify/knowledge/` | `docs/` |
| 5. Review | `docs/` + `.insightify/knowledge/` + `.insightify/plan.md` | `.insightify/review/review-report.md` |
| 6. Build | `docs/` + `.insightify/knowledge/` | `.vitepress/` + `knowledge-base/` + `package.json` + `README.md` |

---

## 4. Stage 1 — Source Ingestion

### Purpose

Read all user-provided files and URLs, parse them into a uniform format, normalize to Markdown, and store with provenance metadata.

### Supported Input Types

| Type | Parser | Dependency |
|---|---|---|
| `.md`, `.txt`, `.rst`, `.adoc` | Direct copy (minimal cleanup) | None |
| `.pdf` | `pdf-parser.js` | `pdf-parse` (npm) |
| `.html` | `html-parser.js` | `cheerio` (npm) |
| `.js`, `.ts`, `.py` | `code-parser.js` | None (regex-based) |
| URL | Fetch + `html-parser.js` | `cheerio` (npm) |

### Output Format

**manifest.md:**

```markdown
---
generated: 2026-08-14T10:30:00Z
total_sources: 5
---

# Source Manifest

| # | Type | Origin | File | Status |
|---|------|--------|------|--------|
| 001 | file/pdf | ./docs/whitepaper.pdf | source-001.md | success |
| 002 | url | https://example.com/docs | source-002.md | success |
| 003 | file/js | ./src/api.ts | source-003.md | failed: parse error |
```

**Normalized source file (source-001.md):**

```markdown
---
source_id: "001"
type: "file/pdf"
origin: "./docs/whitepaper.pdf"
ingested_at: "2026-08-14T10:30:00Z"
size_bytes: 245000
parser: "pdf-parser"
---

# [Original filename or page title]

[Normalized markdown content...]
```

### Error Handling

- Failed sources are logged in manifest with status `failed` and reason
- Pipeline continues with remaining sources — does not abort

---

## 5. Stage 2 — Knowledge Extraction

### Purpose

Read all normalized sources and extract product knowledge into structured categories using the LLM.

### Extraction Categories

| Category | File | What is Extracted |
|---|---|---|
| Product Overview | `product.md` | Name, description, target audience, value proposition |
| Features | `features.md` | Feature list with descriptions, sourced |
| Terminology | `terminology.md` | Domain-specific terms and definitions |
| API/Technical | `api.md` | Endpoints, methods, parameters, responses, auth |
| Workflows | `workflows.md` | Step-by-step user procedures |
| Constraints | `constraints.md` | Limitations, requirements, known issues |
| Unanswered | `unanswered.md` | Gaps, contradictions, ambiguities |

### Output Format

Each knowledge file uses structured Markdown with YAML frontmatter:

```markdown
---
category: "features"
extracted_from:
  - source-001.md
  - source-003.md
confidence: "high"
extracted_at: "2026-08-14T10:35:00Z"
---

# Features

## Authentication
OAuth 2.0 based authentication supporting Google, GitHub, and email/password.

> **Source:** source-001.md (whitepaper.pdf, section 3.2)
```

### Key Behaviors

- Extraction per category runs in **parallel** (each is independent)
- Every extracted fact is **traced back to source** via blockquote citations
- Confidence levels: `high` (explicit in source), `medium` (inferred), `low` (ambiguous)
- `unanswered.md` captures honest gaps — the plugin does not fabricate
- Large sources are chunked per source then results merged

---

## 6. Stage 3 — Documentation Planner

### Purpose

Analyze the knowledge base and design information architecture: which pages to create, for whom, in what order, with what dependencies.

### Output: plan.md

```markdown
---
project: "MyApp"
generated_at: "2026-08-14T10:40:00Z"
status: "approved"
total_pages: 6
audience: "developers"
---

# Documentation Plan: MyApp

## Overview
[Product summary and documentation goals]

## Audience
- **Primary:** [target]
- **Secondary:** [target]

## Pages

### 1. [Page Name]
- **Purpose:** [what this page accomplishes]
- **Audience:** [who reads this]
- **Sources:** [which knowledge files to use]
- **Sections:** [list of sections]
- **Dependencies:** [which pages must exist first]
- **Priority:** high | medium | low

[...repeat for each page...]

## Page Dependency Graph
[Visual representation of page dependencies]

## Writing Order
[Ordered list based on dependency resolution]
```

### User Approval Flow

1. Plan is presented in chat with a summary (page count, audience, priorities)
2. User approves or provides revision feedback
3. If revised, planner re-generates with feedback
4. Loop until user approves
5. Approved plan saved to `.insightify/plan.md` with `status: approved`

---

## 7. Stage 4 — Documentation Writer

### Purpose

Execute the approved plan by generating documentation pages using knowledge base content, with parallel workers respecting page dependencies.

### Wave-Based Execution

Pages are written in waves based on the dependency graph from the plan:

```
Wave 1: Pages with no dependencies        → parallel
Wave 2: Pages depending on wave 1          → parallel (after wave 1 completes)
Wave 3: Pages depending on wave 2          → parallel (after wave 2 completes)
...
```

This ensures pages that cross-reference earlier pages have accurate content to reference.

### Per-Page Writing Process

1. Read plan entry (purpose, audience, sections)
2. Read relevant knowledge files (listed in plan)
3. Read pages from previous waves (for cross-referencing)
4. Select appropriate template (guide / api / faq / glossary)
5. Generate content
6. Add metadata frontmatter
7. Write to `docs/`

### Output Format

Pure markdown with minimal metadata frontmatter (not VitePress-specific):

```markdown
---
title: "Getting Started"
description: "First-time setup and quick start guide"
audience: "all"
sources:
  - product.md
  - workflows.md
---

# Getting Started

[Content...]
```

### User Review Flow (Post-Write Checkpoint)

1. Summary displayed: file list, word counts per page, total
2. User reviews the generated files
3. If revision needed: user specifies which pages and what to change
4. Writer does **targeted re-write** of only specified pages
5. When user approves: continue to Stage 5

---

## 8. Stage 5 — Documentation Reviewer

### Purpose

Automated quality review across 5 dimensions, run in parallel. Generates a review report and can send targeted fixes back to the Writer.

### Review Dimensions

| Dimension | What is Checked | Compared Against |
|---|---|---|
| Accuracy | Facts match source material? | `.insightify/knowledge/` |
| Completeness | All planned sections written? | `.insightify/plan.md` |
| Consistency | Terms, tone, style uniform? | All `docs/*` cross-compared |
| Structure | Heading hierarchy, flow, links? | Documentation best practices |
| Usability | Examples, clarity, audience fit? | `plan.md` audience definition |

### Review Report Format

```markdown
---
reviewed_at: "2026-08-14T11:00:00Z"
iteration: 1
verdict: "changes_needed" | "approved"
total_issues: 4
by_severity:
  critical: 1
  major: 2
  minor: 1
---

# Review Report — Iteration N

## Verdict: ⚠️ Changes Needed | ✅ Approved

### Critical Issues
[...]

### Major Issues
[...]

### Minor Issues
[...]

## Pages Needing Revision
[list]

## Pages Approved ✅
[list]
```

### Revision Loop

1. Review all pages → generate report
2. If issues found → send targeted fixes to Writer (specific pages + specific issues)
3. Writer re-writes only affected pages
4. Re-review only fixed pages
5. Repeat until approved or max 3 iterations reached

### Safety Valve (Max 3 Iterations)

After 3 iterations with remaining issues:
- Stop the loop
- Report remaining issues to user
- User decides: fix manually, approve as-is, or retry (reset counter)

---

## 9. Stage 6 — Documentation Builder

### Purpose

Transform pure markdown docs into a VitePress-ready site and finalize the Knowledge Base output.

### Builder Responsibilities

1. **Transform docs for VitePress** — inject VitePress-specific frontmatter, fix internal links, add navigation metadata
2. **Generate `.vitepress/config.js`** — site config, theme, nav bar, sidebar (auto-generated from plan's dependency graph)
3. **Generate `index.md`** — hero/landing page with product info from knowledge base
4. **Generate `package.json`** — with VitePress dependency and dev/build/preview scripts
5. **Generate `README.md`** — setup instructions
6. **Finalize `knowledge-base/`** — copy from `.insightify/knowledge/` to final location
7. **Validate** — all internal links resolve, all pages in sidebar, no orphans, valid frontmatter

### VitePress Frontmatter Transformation

Writer's metadata frontmatter is transformed into VitePress-compatible format:

Before (Writer output):
```markdown
---
title: "Getting Started"
description: "First-time setup"
audience: "all"
sources:
  - product.md
---
```

After (Builder transforms):
```markdown
---
title: "Getting Started"
description: "First-time setup"
head:
  - - meta
    - name: "audience"
      content: "all"
outline: [2, 3]
---
```

### Validation Checklist

- All pages listed in sidebar
- All internal links resolve (no broken references)
- No orphan pages (unreachable from sidebar/nav)
- All pages have valid frontmatter
- `index.md` exists with hero layout
- `.vitepress/config.js` is valid JavaScript
- `package.json` has VitePress dependency

### Completion Output

```
🎉 insightify complete!

📁 Output: myapp-docs/
├── docs/           6 pages (~11,400 words)
├── .vitepress/     Site configuration
├── knowledge-base/ 6 knowledge files
├── package.json    Ready to install
└── README.md       Setup instructions

🚀 To preview your docs:
   cd myapp-docs
   npm install
   npm run dev
```

---

## 10. Orchestrator Logic

### Entry Point Behavior

```
/insightify           → Ask project name → Ask sources → Full pipeline
/insightify <url>     → Ask project name → URL as source → Full pipeline
/insightify-<stage>   → Stage runs standalone with user-provided input
```

### Pipeline Flow (Pseudocode)

```
1. INIT
   ├── Parse arguments
   ├── Ask project name
   ├── Ask sources (if not provided)
   └── Create output directory

2. STAGE 1: INGEST   → .insightify/sources/
3. STAGE 2: EXTRACT  → .insightify/knowledge/
4. STAGE 3: PLAN     → .insightify/plan.md
   └── ❓ USER APPROVAL (approve/revise loop)
5. STAGE 4: WRITE    → docs/
   └── ❓ USER REVIEW (targeted revision)
6. STAGE 5: REVIEW   → .insightify/review/review-report.md
   └── 🔄 REVISION LOOP (max 3, targeted fixes back to Writer)
7. STAGE 6: BUILD    → .vitepress/ + knowledge-base/ + package.json + README.md
   └── ✅ DONE
```

### Error Handling

- Source ingestion failure (URL timeout, parse error): skip and warn, continue others
- Extraction failure for a category: write to `unanswered.md`
- Review loop exceeds 3 iterations: stop, report to user, let user decide

### Orchestrator Resilience

The orchestrator MUST implement the following error handling behaviors:

| Scenario | Behavior |
|---|---|
| Stage 1 partial failure | Log failed sources in manifest with `status: failed`, continue pipeline with successful sources |
| Stage 2 category failure | Write empty file with `confidence: "none"` and note in `unanswered.md` |
| Stage 3 approval timeout | After 5 min no response, present summary again; after 10 min, exit with plan saved as `draft` |
| Stage 4 write failure (single page) | Log error, continue other pages in wave; report failed pages to user |
| Stage 5 review crash | Retry once; if persistent, skip review and proceed to Build with warning |
| Any stage: workspace corruption | Detect missing `.insightify/`, offer to resume from last completed stage or restart |

### CLI Argument Parsing

The entry point `/insightify` supports the following invocation patterns:

| Invocation | Behavior |
|---|---|
| `/insightify` | Interactive: prompt for project name, then prompt for sources (files/URLs, one per line, empty line to finish) |
| `/insightify <url>` | Use URL as first source, prompt for project name, then prompt for additional sources |
| `/insightify --project <name> --source <path> [--source <url> ...]` | Non-interactive: all inputs provided via flags |
| `/insightify --config <path>` | Read project name and sources from `insightify.config.json` |
| `/insightify --dry-run` | Show execution plan (stages, estimated pages) without running |
| `/insightify --resume [--from-stage N]` | Resume from last completed stage or specified stage |

**Argument Precedence:** CLI flags > Config file > Interactive prompts

### Configuration File (Optional)

`insightify.config.json` at project root or `--config` path:

```json
{
  "projectName": "my-docs",
  "outputDir": "./my-docs-output",
  "sources": [
    "./docs/*.md",
    "./src/**/*.ts",
    "https://example.com/api-docs"
  ],
  "templates": {
    "guide": "custom-guide-template.md",
    "api": "custom-api-template.md"
  },
  "stages": {
    "extract": { "parallelCategories": true },
    "review": { "maxIterations": 3, "dimensions": ["accuracy", "completeness", "consistency", "structure", "usability"] }
  },
  "vitepress": {
    "theme": "default",
    "logo": "./assets/logo.svg"
  }
}
```

### Progress Reporting

During pipeline execution, the orchestrator MUST display progress for long-running stages:

| Stage | Progress Indicator |
|---|---|
| 1. Ingest | `⏳ Ingesting: [===----] 3/5 sources (pdf-parser: 2, html-parser: 1)` |
| 2. Extract | `⏳ Extracting: [======-] 6/7 categories (features, api, terminology...)` |
| 3. Plan | `⏳ Planning: generating plan...` (fast, no progress bar) |
| 4. Write | `⏳ Writing: Wave 2/4 — [======--] 3/5 pages (getting-started.md, api-reference.md...)` |
| 5. Review | `⏳ Reviewing: [========] 5/5 dimensions (iteration 1/3)` |
| 6. Build | `⏳ Building: generating config, sidebar, index...` |

Progress updates every 2 seconds or on stage completion, whichever comes first.

### Stage 3 — Plan Approval Loop (Detailed)

The interactive approval flow:

```
1. Planner generates plan.md
2. Orchestrator displays summary:
   📝 Documentation Plan: MyApp
   🎯 Audience: developers (primary), product-managers (secondary)
   📄 Pages: 8 total (5 high, 2 medium, 1 low priority)
   🔄 Dependencies: 3 waves (Wave 1: 3 pages, Wave 2: 3 pages, Wave 3: 2 pages)
   📊 Est. words: ~15,000
3. Prompt: "Approve plan? [Y/n/revise] "
   - Y/y/Enter → save plan with status: "approved", continue to Stage 4
   - n → exit pipeline, plan saved as "rejected"
   - revise → prompt: "What changes? (e.g., 'add FAQ page', 'merge API pages', 'change audience to beginners')"
4. On revision: Planner re-generates with feedback, return to step 2
5. Max 3 revision cycles; on 4th, force approval or exit
```

### Dry-Run Output Format

```
/insightify --dry-run --project myapp --source ./src --source https://docs.example.com

🔍 DRY RUN — Insightify Pipeline Plan
──────────────────────────────────────────────────────────────────────────────

Project: myapp
Output: ./myapp-docs/
Sources: 2 (1 local dir, 1 URL)

Estimated Pipeline:
  Stage 1 (Ingest):    ~15 files → .insightify/sources/
  Stage 2 (Extract):   7 categories → .insightify/knowledge/
  Stage 3 (Plan):      ~8 pages, 3 waves → .insightify/plan.md
  Stage 4 (Write):     8 pages → docs/ (~15k words)
  Stage 5 (Review):    5 dimensions × up to 3 iterations
  Stage 6 (Build):     VitePress site + knowledge-base/

Estimated time: ~45-60 seconds
Estimated output: ~50 files, ~200 KB

Run without --dry-run to execute.
```

---

## 11. User Checkpoints Summary

| Checkpoint | When | User Action |
|---|---|---|
| **Plan Approval** | After Stage 3 | Approve plan or request revisions (chat-based) |
| **Doc Review** | After Stage 4 | Review generated files, request targeted changes or continue |
| **Review Escalation** | After Stage 5 (3rd iteration) | Fix manually, approve as-is, or retry |

---

## 12. Dependencies

### npm Dependencies (for parsers)

| Package | Purpose | Used By |
|---|---|---|
| `pdf-parse` | PDF to text extraction | `pdf-parser.js` |
| `cheerio` | HTML content extraction | `html-parser.js` |

### Runtime Dependencies

| Dependency | Purpose |
|---|---|
| VitePress | Documentation site framework (installed in output project) |
| Node.js | Required for parsers and VitePress (v18+ recommended) |

### Development Dependencies (for testing)

| Package | Purpose |
|---|---|
| Node.js built-in `node:test` | Unit and integration test runner |
| Test fixtures | Sample PDFs, HTML, code files in `tests/fixtures/` |

---

## 13. Testing Strategy

### Test Categories

| Category | Scope | Location | Command |
|---|---|---|---|
| Unit | Individual parsers, template renderers | `tests/unit/` | `npm test` |
| Integration | Stage-to-stage data flow | `tests/integration/` | `npm test` |
| E2E | Full pipeline with fixture sources | `tests/e2e/` | `npm run test:e2e` |

### Test Fixtures

Standardized test inputs in `tests/fixtures/`:

```
tests/fixtures/
├── sample.pdf              # 2-page PDF with headings, tables
├── sample.html             # HTML with nav, sidebar, code blocks
├── sample.js               # JS file with JSDoc comments
├── sample.ts               # TS file with interfaces
├── sample.md               # Markdown with frontmatter
└── multi-source/           # Directory for multi-file tests
    ├── README.md
    ├── src/
    │   └── index.ts
    └── docs/
        └── guide.md
```

### Integration Test Scenarios

1. **Happy Path**: All 6 stages complete with sample sources → valid VitePress output
2. **Partial Ingest Failure**: One corrupt PDF + valid sources → manifest shows failure, pipeline continues
3. **Plan Revision Loop**: User requests 2 revisions → plan approved on 3rd attempt
4. **Review Iterations**: 2 review cycles with fixes → approved on 3rd
5. **Max Review Iterations**: 3 cycles with remaining issues → escalation to user
6. **Resume from Stage 4**: Interrupt after Stage 3, resume with `--resume --from-stage 4`
7. **Dry Run**: `--dry-run` shows plan without execution

### Validation Checks (Post-Build)

The Build stage MUST validate and the test suite MUST assert:

- [ ] All pages in `docs/` listed in sidebar
- [ ] All internal links resolve (no 404s)
- [ ] No orphan pages (unreachable from sidebar/nav)
- [ ] All pages have valid VitePress frontmatter
- [ ] `index.md` exists with hero layout
- [ ] `.vitepress/config.js` is valid JavaScript (no syntax errors)
- [ ] `package.json` has `vitepress` in `devDependencies`
- [ ] `npm install && npm run dev` starts without errors (smoke test)

---

## 14. Future Extensibility (Non-Goals for v1)

These are explicitly OUT OF SCOPE for the current version but designed for:

| Feature | Extension Point |
|---|---|
| Custom output formats (Docusaurus, MkDocs, Hugo) | New Stage 6 builder skill + template set |
| Incremental updates (watch mode) | File watcher → re-run affected stages only |
| Multi-language docs | Extraction schema + i18n templates |
| API spec generation (OpenAPI) | New extraction category + API template |
| Authentication/private sources | Auth headers in config, OAuth flow in ingest |
| CI/CD integration | GitHub Action / GitLab CI template in output |
| Plugin marketplace | Skill registry + versioning |

---

## 15. Version History

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-08-14 | Initial design spec |
| v2 | 2026-08-14 | Added: orchestrator resilience, CLI args, config file, progress reporting, detailed plan approval loop, dry-run format, testing strategy, validation checks, extensibility hooks |