# Insightify Plugin Optimization — Design Spec

**Date:** 2026-08-18
**Status:** Draft
**Scope:** Plugin rename, structure standardization, metadata enrichment, skill instruction enrichment, HTML parser improvement

---

## 1. Overview

This spec covers five improvements to make the Insightify plugin more robust, discoverable, and aligned with Claude Code plugin conventions. The changes span config, file structure, skill content depth, and parser quality.

---

## 2. Change 1: Plugin Rename

### Problem
The plugin name `insightify-plugin` creates awkward invoke names. Skills appear as `insightify-plugin:insightify`, `insightify-plugin:insightify-ingest`, etc.

### Solution
Rename `"name"` field from `"insightify-plugin"` to `"insightify"` in all config files:

| File | Field |
|------|-------|
| `.claude-plugin/plugin.json` | `"name"` |
| `.gemini-plugin/plugin.json` | `"name"` |
| `.opencode/plugin.json` | `"name"` |
| `package.json` | `"name"` |

### Result
- Main skill: `/insightify` (was `insightify-plugin:insightify`)
- Stage skills: `/insightify-ingest`, `/insightify-extract`, etc.

---

## 3. Change 2: Skill File Naming Convention

### Problem
Skill entry files use inconsistent, non-standard names (`ingest.md`, `extract.md`, etc.). The Claude Code plugin convention established by superpowers and sitegen uses `SKILL.md` (uppercase) as the entry point file in each skill folder.

The orchestrator skill `insightify.md` also sits directly in `skills/` root instead of its own subfolder.

### Solution
Rename all skill entry files to `SKILL.md` and move orchestrator into its own folder:

| Current Path | New Path |
|---|---|
| `skills/insightify.md` | `skills/insightify/SKILL.md` |
| `skills/ingest/ingest.md` | `skills/ingest/SKILL.md` |
| `skills/extract/extract.md` | `skills/extract/SKILL.md` |
| `skills/plan/plan.md` | `skills/plan/SKILL.md` |
| `skills/write/write.md` | `skills/write/SKILL.md` |
| `skills/review/review.md` | `skills/review/SKILL.md` |
| `skills/build/build.md` | `skills/build/SKILL.md` |

Frontmatter `name` fields stay the same — these control the invoke name and are already correct.

### Migration
- Move orchestrator's parsers reference: parsers stay at `skills/ingest/parsers/` (no change needed, ingest skill references them relatively)
- Update any relative path references within skill files if they exist
- No impact on `CLAUDE.md` documentation since it references skill names, not file paths

---

## 4. Change 3: Plugin Metadata Enrichment

### Problem
`.claude-plugin/plugin.json` is bare-minimum. Missing `$schema`, `displayName`, `author`, `homepage`, `repository`, `license`, `keywords` — all standard fields for publishable plugins.

### Solution
Enrich `.claude-plugin/plugin.json` (primary) and keep other platform configs in sync where applicable:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-plugin-manifest.json",
  "name": "insightify",
  "displayName": "Insightify",
  "version": "1.0.0",
  "description": "Generate documentation website and knowledge base from files and URLs",
  "author": {
    "name": "Aryo Adi Putro"
  },
  "homepage": "https://github.com/aorysan/insightify",
  "repository": "https://github.com/aorysan/insightify",
  "license": "MIT",
  "keywords": [
    "documentation",
    "vitepress",
    "knowledge-base",
    "doc-generator",
    "insightify"
  ],
  "skills": ["./"]
}
```

Also update `package.json` with matching `author`, `license`, `repository`, and `keywords` fields.

---

## 5. Change 4: Skill Instruction Enrichment

### Problem
Each stage skill has only 4-5 lines of instructions. This provides insufficient guidance for the LLM, leading to inconsistent output quality and poor edge case handling.

### Approach
Add **moderate detail** to each skill — edge cases, error handling guidance, output format examples. Target ~30-50 lines per skill. Keep instructions prescriptive but not over-constraining.

### Per-Skill Enrichment Plan

**Ingest (`insightify-ingest`):**
- Supported input types and file extensions mapping
- URL fetching: timeout (30s), retry (1x), user-agent header
- Max file size guidance (warn >5MB, skip >20MB)
- Unsupported file type handling: log warning, skip, note in manifest
- Normalized output format specification: YAML frontmatter fields, heading normalization (start at H2), image/link handling
- Manifest entry format with status field (`success`, `failed`, `skipped`)

**Extract (`insightify-extract`):**
- How to handle conflicting facts between sources: keep both, flag in `unanswered.md`
- Confidence scoring criteria: `high` (explicit statement), `medium` (inferred), `low` (ambiguous/single source)
- What to do when source doesn't fit any category: note in `unanswered.md` with suggested category
- Minimum viable output: even if sources are thin, produce at least `product.md` and `unanswered.md`
- Citation format: blockquote with source ID and section reference

**Plan (`insightify-plan`):**
- Page sizing guidance: 500-2000 words per page ideal, split if >3000
- When to merge vs split pages
- Priority assignment criteria: `high` = core/getting-started, `medium` = feature docs, `low` = reference/FAQ
- Dependency graph rules: no circular deps, max 3 waves recommended

**Write (`insightify-write`):**
- Writing tone: technical but approachable, second person ("you"), active voice
- Cross-reference format: use relative markdown links `[Link Text](./other-page.md)`
- Code example requirements: every API endpoint and workflow needs at least one example
- Heading hierarchy: H1 = page title (from frontmatter), content starts at H2
- Template selection logic: which template to use based on page type from plan

**Review (`insightify-review`):**
- Scoring rubric per dimension: what constitutes pass/fail for each
- Threshold: `changes_needed` if any dimension scores below 3/5 or if critical issues found
- Issue format for sending back to Writer: `{page, dimension, issue, suggestion}`
- What counts as "critical" vs "minor" issue

**Build (`insightify-build`):**
- VitePress config generation: sidebar structure from dependency graph, nav from top-level pages
- Frontmatter transformation: add VitePress-specific fields (`outline`, `aside`)
- Validation checklist: broken internal links, orphan pages, missing frontmatter fields
- `package.json` generation: include `docs:dev`, `docs:build`, `docs:preview` scripts

---

## 6. Change 5: HTML Parser Improvement

### Problem
Current `html-parser.js` flattens all HTML structure into a single text blob:
```js
const bodyText = $('main, article, body').first().text().replace(/\s+/g, ' ').trim();
```

This loses headings, lists, code blocks, links, and formatting — critical structure for a documentation generator.

### Solution
Rewrite `parseHtml()` to produce **structure-preserving markdown**:

- **Headings**: `<h1>`-`<h6>` → `#`-`######`
- **Lists**: `<ul>/<ol>` → `-` / `1.` (including nested lists)
- **Code blocks**: `<pre><code>` → fenced code blocks with language detection from `class="language-*"`
- **Inline code**: `<code>` (not inside `<pre>`) → backtick
- **Links**: `<a href>` → `[text](url)`
- **Bold/Italic**: `<strong>/<b>` → `**`, `<em>/<i>` → `*`
- **Paragraphs**: `<p>` → double newline separation
- **Images**: `<img>` → `![alt](src)`
- **Tables**: `<table>` → markdown table format

### Implementation Approach
Use Cheerio's DOM traversal to walk the content tree recursively, converting each element type to its markdown equivalent. This is more reliable than regex-based conversion.

### Test Updates
Add test cases for:
- Headings preservation
- Nested list conversion
- Code block extraction with language class
- Link conversion
- Mixed content (headings + paragraphs + code + lists)
- Edge case: deeply nested elements
- Edge case: empty elements

---

## 7. Files Changed Summary

| Category | Files | Action |
|----------|-------|--------|
| Config rename | 4 files | Edit `name` field |
| Skill rename | 7 files | Rename (move) to `SKILL.md` |
| Plugin metadata | 2 files | Edit `.claude-plugin/plugin.json`, `package.json` |
| Skill enrichment | 6 files | Expand skill instructions |
| Parser | 1 file | Rewrite `html-parser.js` |
| Tests | 1 file | Expand `ingest-parsers.test.js` |
| Docs | 1 file | Update `CLAUDE.md` if needed |

**Total: ~22 file operations across 5 workstreams.**

---

## 8. Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| Rename breaks cached plugin resolution | User must re-install/refresh plugin after rename |
| `SKILL.md` rename breaks skill discovery | Frontmatter `name` field is unchanged; discovery should be unaffected |
| HTML parser rewrite breaks existing tests | Run tests after rewrite; expand test coverage |
| Enriched instructions over-constrain LLM | Use "should" not "must" for guidance, keep prescriptive only for format/structure |
