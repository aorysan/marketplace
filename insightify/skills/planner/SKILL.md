---
name: planner
description: Stage 1 - Ingest sources, extract knowledge into categories based on detected archetype, and generate documentation plan with user approval.
---

# Planner Skill (Ingest → Extract → Plan)

## Instructions

### Phase 1: Ingest

1. Accept input files or URLs from parameters or prompt. Ensure ingest scripts and parsers strictly use relative paths or config variables instead of absolute paths.
2. For each source, execute the appropriate parser (HTML, Code, PDF, Native Schema, or Markdown/Text direct copy).
3. Generate normalized `[OUT_DIR]/.insightify/sources/source-XXX.md` with YAML metadata frontmatter.
4. For each source that lives in a git repository, run `git log --name-only --pretty=format:` to compute file volatility/churn (commit frequency per path); record churn counts as metadata in source frontmatter and the manifest for extraction prioritization. Non-git sources: skip churn silently.
5. Write master source index `[OUT_DIR]/.insightify/sources/manifest.md`.

**Supported Input Types:**

| Extension | Parser | Notes |
|-----------|--------|-------|
| `.html`, `.htm` | `parsers/html-parser.js` | Strips nav/footer/scripts, preserves content structure |
| `.js`, `.ts`, `.py`, `.java`, `.go`, `.rs`, `.rb`, `.php`, `.c`, `.cpp`, `.cs` | `parsers/code-parser.js` | Extracts JSDoc/docstrings; falls back to raw code |
| `.pdf` | `parsers/pdf-parser.js` | Binary buffer input via `pdf-parse` |
| `.json`, `.yaml`, `.yml` (`openapi.json`, `swagger.yaml`) | Native schema parser | OpenAPI/Swagger specs (detect `openapi`/`swagger` root key): parse endpoints/models directly instead of raw-text ingestion; non-spec `.json`/`.yaml` → Direct copy |
| `.sql` (`schema.sql`) | Native schema parser | SQL DDL: parse tables/columns/entities directly instead of raw-text ingestion |
| `.md`, `.txt`, `.rst` | Direct copy | Copy content as-is with frontmatter added |
| URLs (`http://`, `https://`) | Fetch → HTML parser | Fetch page, then process as HTML |
| Other extensions | Skip | Log warning, mark as `skipped` in manifest |

**URL Fetching:** Timeout 30s, 1 retry on 5xx, User-Agent `Insightify/1.0`.
**File Size Limits:** >5MB warning, >20MB skip as `file_too_large`.

**Normalized Output Frontmatter:**
```yaml
---
source_id: "source-001"
original_path: "path/to/file.js"
type: "code"
parser: "code-parser"
status: "success"
ingested_at: "YYYY-MM-DDTHH:mm:ssZ"
word_count: 1234
churn: 42
---
```

Content headings normalized to start at H2 (`##`). Manifest format: table with Source ID, Path, Type, Status, Words, Churn.

### Phase 0: Project Type Detection

1. Analyze the ingested sources to detect the project archetype.
2. Supported archetypes: `frontend-spa`, `backend-api`, `system-design`, `general`.
3. Map the detected archetype to its corresponding knowledge categories:
   - `frontend-spa`: 9 default categories (product, directory-structure, architecture, state-and-data, design-system, api-patterns, features-and-journeys, business-policies, constraints-and-limits).
   - `backend-api`: product, directory-structure, architecture, api-patterns, features-and-journeys, business-policies, constraints-and-limits.
   - `system-design`: product, architecture, features-and-journeys, business-policies, constraints-and-limits.
   - `general`: product, directory-structure, features-and-journeys, business-policies, constraints-and-limits.

### Phase 2: Extract

1. Read all `[OUT_DIR]/.insightify/sources/*.md` files.
2. For each of the required categories for the detected archetype (defined in Phase 0; field-level schema in `references/extraction-schema.md`), analyze sources and extract structured facts.
   - **Parallel Extraction:** Assign sub-agents in parallel to extract the various knowledge categories from the available sources.
   - **Concurrency Limit:** Maintain a maximum concurrency limit of 5 sub-agents at a time.
3. Include blockquote source citations (`> **Source:** source-XXX.md § Section Name`) for every fact.
4. Write output to `[OUT_DIR]/.insightify/knowledge/`.

**Map-Reduce / Context Filtering:** Chunk large sources into segments; extract facts per chunk (map), then merge per category (reduce). Per category, feed only relevant chunks as context — filtered by category keywords and churn priority — instead of all content.

**Knowledge Categories:**
*(Note: The following 9 categories are defaults for `frontend-spa`. Other archetypes use different categories depending on Phase 0).*
1. `product.md` — Product identity, version, audience, tagline
2. `directory-structure.md` — Folder tree, module boundaries, import conventions
3. `architecture.md` — High-level architecture, module boundaries, layout wrappers, routing structure, entity names + purpose only (not full field listings)
4. `state-and-data.md` — Stores, selectors, data models, persistence, cache/sync patterns
5. `design-system.md` — UI component registry, design tokens, accessibility
6. `api-patterns.md` — Client config, hooks, endpoints, error flow, mapping
7. `features-and-journeys.md` — Feature catalog, personas, end-to-end user journeys, acceptance criteria
8. `business-policies.md` — Business rules, validation policies, cross-cutting concerns, domain glossary
9. `constraints-and-limits.md` — Technical limits, performance budgets, security, known issues

**Conflict Handling:** Keep both facts, flag in `unanswered.md`.
**Confidence:** `high` (explicit), `medium` (inferred), `low` (ambiguous).
**Edge Cases:** Uncategorized → `unanswered.md`; thin sources → min `product.md` + `unanswered.md`; empty → skip, log.

**Citation Format:**
```markdown
The API supports up to 1000 concurrent connections.

> **Source:** source-003.md § API Limits
```

### Phase 3: Plan

1. Read `[OUT_DIR]/.insightify/knowledge/*.md` (all extracted categories).
2. Generate a single comprehensive Documentation Plan that outlines the structure of the unified Product Knowledge Base using `templates/plan-template.md` (saved to `[OUT_DIR]/.insightify/plan.md`).
3. Display summary:
   ```
   📝 Documentation Plan: [Project Name]
   🎯 Audience: [Primary & Secondary]
   📄 Document: Product Knowledge Base ([Section count] sections)
   📊 Est. words: [Estimation]
   ```
4. Automatically save the plan as `approved` and proceed to Writer. Do NOT ask the user for plan approval here.

**Ambiguity Resolution:** During planning, compile unresolved questions from extraction into `[OUT_DIR]/.insightify/knowledge/unanswered.md`. Interactively prompt the user to answer high-impact ambiguities (those that change plan structure or document content); record answers as cited facts in affected knowledge files and mark them resolved in `unanswered.md`.

**Document Structure:**
- The plan outlines a single unified Product Knowledge Base document containing structured sections corresponding to the extracted knowledge categories for the detected archetype.
- Each section specifies its purpose, target audience, key topics, and source knowledge files mapped from `[OUT_DIR]/.insightify/knowledge/`.
- **CRITICAL**: Each section MUST include a 1-2 sentence core summary of the main findings from the source files. The plan should describe *what* the section covers, rather than just listing source file names.
- **CRITICAL**: Automatically generate architecture and relationship diagrams (using Mermaid) from the extracted file relationships to be included in the final output.

### Progress & Error Handling

- Ingest: `⏳ Ingesting: [===----] X/Y sources`; partial failure → log `failed`, continue.
- Extract: `⏳ Extracting: [======-] X/Y categories`; category failure → empty file, note in `unanswered.md`.
- Plan: `⏳ Planning: generating plan...`; no response 5min → re-prompt; 10min → save as `draft`, exit.
