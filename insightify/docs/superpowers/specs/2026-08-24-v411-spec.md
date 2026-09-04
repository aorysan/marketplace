# Insightify v4.1.1 Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix bugs, remove dead code, add error handling, and make architecture highlights dynamic (driven by knowledge base, not hardcoded React).

**Architecture:** All changes modify existing files. No new files. The biggest change is `build-html.mjs` where a new `extractArchitectureHighlights()` function replaces the hardcoded React `<li>` block with KB-driven content. Reviewer criteria also shift from hardcoded patterns to "matches extracted knowledge base."

**Tech Stack:** Node.js, `node:test` runner, `marked`, `cheerio`, `pdf-parse`

## Global Constraints

- Maintain backward compatibility — all existing callers must work without changes
- `npm test` must reach 113/113 PASS after all tasks
- No new dependencies
- Conventional commit messages

---

### Task 1: Scaffold Test Fix + Code Parser Dead Code

**Files:**
- Modify: `tests/scaffold.test.js:7-19`
- Modify: `skills/planner/parsers/code-parser.js:309`

**Interfaces:**
- Consumes: Nothing
- Produces: Passing scaffold test; cleaner `parseCode()` return

- [ ] **Step 1: Fix scaffold test version and remove missing manifest assertions**

```js
// tests/scaffold.test.js — replace entire test (lines 7-19)
describe('Project Scaffolding', () => {
  test('plugin manifests exist and have correct structure', () => {
    const claudeManifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../.claude-plugin/plugin.json'), 'utf8'));
    assert.strictEqual(claudeManifest.name, 'insightify');
    assert.strictEqual(claudeManifest.version, '4.1.0');
  });
});
```

- [ ] **Step 2: Remove dead `extracted.components` reference in code-parser**

```js
// skills/planner/parsers/code-parser.js — line 308-310
// Before:
  const hasDefinitions = extracted.interfaces.length > 0 || extracted.types.length > 0 || 
                         extracted.enums.length > 0 || (extracted.jsxComponents?.length > 0 || extracted.components?.length > 0) || 
                         extracted.hooks.length > 0;

// After:
  const hasDefinitions = extracted.interfaces.length > 0 || extracted.types.length > 0 || 
                         extracted.enums.length > 0 || extracted.jsxComponents.length > 0 || 
                         extracted.hooks.length > 0;
```

- [ ] **Step 3: Run tests**

Run: `cd d:\AryokPunya\Magang\insight\.claude\plugins\insightify && npm test`
Expected: 113/113 PASS (scaffold test now passes, all parser tests still pass)

- [ ] **Step 4: Commit**

```bash
git add tests/scaffold.test.js skills/planner/parsers/code-parser.js
git commit -m "fix: update scaffold test version to 4.1.0 and remove dead code reference"
```

---

### Task 2: PDF Parser Error Handling

**Files:**
- Modify: `skills/planner/parsers/pdf-parser.js`
- Modify: `tests/ingest-parsers.test.js` (add error handling test)

**Interfaces:**
- Consumes: `parsePdf(buffer)` — existing async function
- Produces: `parsePdf(buffer)` — same signature, now returns error markdown string instead of throwing

- [ ] **Step 1: Add failing test for corrupted PDF input**

Append to `tests/ingest-parsers.test.js` inside the `Ingest Parsers` describe block, after the existing pdf tests:

```js
  test('pdf-parser returns error markdown on invalid input instead of throwing', async () => {
    const { parsePdf } = require('../skills/planner/parsers/pdf-parser');
    const invalidBuffer = Buffer.from('not a valid pdf content');
    const result = await parsePdf(invalidBuffer);
    assert.ok(typeof result === 'string', 'Must return string, not throw');
    assert.ok(result.includes('PDF Parse Error'), 'Must contain error heading');
    assert.ok(result.includes('Error:'), 'Must contain error message');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd d:\AryokPunya\Magang\insight\.claude\plugins\insightify && npm test 2>&1 | Select-String "pdf-parser returns error"`
Expected: FAIL — currently `parsePdf` throws on invalid input

- [ ] **Step 3: Wrap parsePdf in try/catch**

```js
// skills/planner/parsers/pdf-parser.js — replace entire file
const pdfParse = require('pdf-parse');

async function parsePdf(buffer) {
  try {
    const normalizedBuffer = buffer && buffer.byteOffset !== undefined && buffer.buffer
      ? new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))
      : buffer;
    const data = await pdfParse(normalizedBuffer);
    return data.text;
  } catch (e) {
    return `# PDF Parse Error\n\nFailed to extract text from PDF.\n\nError: ${e.message}`;
  }
}

module.exports = { parsePdf };
```

- [ ] **Step 4: Run tests**

Run: `cd d:\AryokPunya\Magang\insight\.claude\plugins\insightify && npm test`
Expected: All PASS including new pdf error test. Existing valid-pdf test still passes.

- [ ] **Step 5: Commit**

```bash
git add skills/planner/parsers/pdf-parser.js tests/ingest-parsers.test.js
git commit -m "fix: pdf-parser returns error markdown instead of crashing on invalid input"
```

---

### Task 3: HTML Parser Header Preservation

**Files:**
- Modify: `skills/planner/parsers/html-parser.js:5`
- Modify: `tests/ingest-parsers.test.js` (add header preservation test)

**Interfaces:**
- Consumes: `parseHtml(htmlString)` — existing function
- Produces: `parseHtml(htmlString)` — same signature, now preserves `<header>` inside `<article>`/`<section>`

- [ ] **Step 1: Add failing test for content-level header preservation**

Append to `tests/ingest-parsers.test.js` inside the `Ingest Parsers` describe block:

```js
  test('html-parser preserves content-level headers inside article but strips body-level header', () => {
    const { parseHtml } = require('../skills/planner/parsers/html-parser');
    const html = `<html><body>
      <header><nav>Site Nav</nav><span>Logo</span></header>
      <article>
        <header><h2>Article Header</h2><p>By Author</p></header>
        <p>Article content here.</p>
      </article>
    </body></html>`;
    const result = parseHtml(html);
    assert.ok(!result.includes('Site Nav'), 'Body-level header content stripped');
    assert.ok(!result.includes('Logo'), 'Body-level header content stripped');
    assert.ok(result.includes('Article Header'), 'Content-level header preserved');
    assert.ok(result.includes('By Author'), 'Content-level header content preserved');
    assert.ok(result.includes('Article content'), 'Article body preserved');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd d:\AryokPunya\Magang\insight\.claude\plugins\insightify && npm test 2>&1 | Select-String "html-parser preserves content"`
Expected: FAIL — current code removes ALL `<header>` tags

- [ ] **Step 3: Change header removal to body-level only**

```js
// skills/planner/parsers/html-parser.js — line 5
// Before:
  $('nav, footer, header, script, style, .ads, .sidebar').remove();

// After:
  $('nav, footer, script, style, .ads, .sidebar').remove();
  $('body > header').remove();
```

- [ ] **Step 4: Run tests**

Run: `cd d:\AryokPunya\Magang\insight\.claude\plugins\insightify && npm test`
Expected: All PASS. New header test passes. Existing HTML tests still pass (they test `<nav>` removal, not `<header>`).

- [ ] **Step 5: Commit**

```bash
git add skills/planner/parsers/html-parser.js tests/ingest-parsers.test.js
git commit -m "fix: html-parser preserves content-level headers, only strips body > header"
```

---

### Task 4: Dynamic Version + Architecture Highlights + Dead Variable

This is the biggest task — covers `build-html.mjs`, `index-html-template.html`, and tests.

**Files:**
- Modify: `skills/builder/templates/build-html.mjs:84,111,145-227,429-472,498-538`
- Modify: `skills/builder/templates/index-html-template.html:27`
- Modify: `tests/build-templates.test.js` (add dynamic highlights tests)

**Interfaces:**
- Consumes: `parseMarkdownWithFrontmatter(md)` — existing internal function
- Produces:
  - `extractArchitectureHighlights(kbDir, techStack)` → `string` (HTML `<li>` items)
  - `assembleKnowledgeBase(kbDir, options?)` → `string` (now accepts optional version)
  - `buildArtifact(options)` — now passes `INSIGHTIFY_VERSION` to template

- [ ] **Step 1: Add failing tests for dynamic architecture highlights**

Append to `tests/build-templates.test.js` at the end of the main describe block:

```js
  test('buildProductOverview renders dynamic highlights from KB files, not hardcoded React', async () => {
    const { buildProductOverview } = await import('../skills/builder/templates/build-html.mjs');
    const result = buildProductOverview(fixture14KbDir);
    // Should NOT contain hardcoded React patterns
    assert.ok(!result.html.includes('Zustand for global state'), 'Must not hardcode Zustand');
    assert.ok(!result.html.includes('React Router v6'), 'Must not hardcode React Router');
    assert.ok(!result.html.includes('TanStack Query v5'), 'Must not hardcode TanStack');
    assert.ok(!result.html.includes('Tailwind CSS + CVA'), 'Must not hardcode Tailwind');
    // Should contain Architecture Highlights section with dynamic content
    assert.ok(result.html.includes('Architecture Highlights'), 'Must have highlights section');
    assert.ok(result.html.includes('highlight-list'), 'Must have highlight list');
  });

  test('buildProductOverview renders fallback when KB dir is empty/missing', async () => {
    const { buildProductOverview } = await import('../skills/builder/templates/build-html.mjs');
    const result = buildProductOverview('/nonexistent/path');
    assert.ok(result.html.includes('Architecture Highlights'), 'Fallback must have highlights section');
    assert.ok(result.html.includes('See documentation sections below'), 'Fallback message shown');
  });

  test('assembleKnowledgeBase accepts optional version parameter', async () => {
    const { assembleKnowledgeBase } = await import('../skills/builder/templates/build-html.mjs');
    const kb = assembleKnowledgeBase(fixture14KbDir, { insightifyVersion: '9.9.9' });
    assert.ok(kb.includes('Insightify v9.9.9'), 'Custom version in KB header');
    assert.ok(!kb.includes('v4.0.0'), 'Old hardcoded version gone');
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd d:\AryokPunya\Magang\insight\.claude\plugins\insightify && npm test 2>&1 | Select-String "hardcoded|fallback|version parameter"`
Expected: FAIL — highlights are hardcoded, `assembleKnowledgeBase` doesn't accept options

- [ ] **Step 3: Remove unused `inArray` variable from `parseYaml()`**

```js
// skills/builder/templates/build-html.mjs
// Line 84: remove `let inArray = false;`
// Line 111: remove `inArray = true;`

// parseYaml function (lines 79-139) becomes:
function parseYaml(yaml) {
  const result = {};
  if (!yaml) return result;
  const lines = yaml.split('\n');
  let currentKey = null;

  for (let rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line || line.startsWith('#')) continue;

    // Check array item
    if (line.trim().startsWith('- ') && currentKey) {
      let item = line.trim().substring(2).trim();
      if ((item.startsWith('"') && item.endsWith('"')) || (item.startsWith("'") && item.endsWith("'"))) {
        item = item.slice(1, -1);
      }
      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = [];
      }
      result[currentKey].push(item);
      continue;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      if (!value) {
        currentKey = key;
        result[key] = [];
        continue;
      }

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      // Handle inline arrays [a, b, c]
      else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value);
        } catch {
          value = value.slice(1, -1).split(',').map(v => {
            let item = v.trim();
            if ((item.startsWith('"') && item.endsWith('"')) || (item.startsWith("'") && item.endsWith("'"))) {
              item = item.slice(1, -1);
            }
            return item;
          });
        }
      }

      result[key] = value;
      currentKey = key;
    }
  }
  return result;
}
```

- [ ] **Step 4: Add `extractArchitectureHighlights()` function**

Add this new function right before `buildProductOverview()` (before line 145):

```js
/**
 * Extract architecture highlights dynamically from knowledge base files
 */
function extractArchitectureHighlights(kbDir, techStack) {
  const highlights = [];

  if (!kbDir || !fs.existsSync(kbDir)) {
    return '<li>See documentation sections below for architecture details</li>';
  }

  const kbSources = [
    { file: 'component-architecture.md', label: 'Component Architecture' },
    { file: 'state-management.md', label: 'State Management' },
    { file: 'routing-structure.md', label: 'Routing' },
    { file: 'api-patterns.md', label: 'API Patterns' },
    { file: 'cross-cutting.md', label: 'Cross-Cutting Concerns' }
  ];

  for (const { file, label } of kbSources) {
    const filePath = path.join(kbDir, file);
    if (!fs.existsSync(filePath)) continue;

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { content: body } = parseMarkdownWithFrontmatter(content);
      if (!body || !body.trim()) continue;

      // Extract first H2 heading and its first paragraph as description
      const h2Match = body.match(/^##\s+(.+)$/m);
      const heading = h2Match ? h2Match[1].trim() : label;

      // Get first paragraph after H2
      const afterH2 = h2Match ? body.substring(body.indexOf(h2Match[0]) + h2Match[0].length) : body;
      const paraMatch = afterH2.trim().match(/^([^\n#][^\n]*)/);
      let description = paraMatch ? paraMatch[1].trim() : '';
      if (description.length > 120) {
        description = description.substring(0, 117) + '...';
      }

      if (description) {
        highlights.push(`<li><strong>${escapeHtml(heading)}</strong> — ${escapeHtml(description)}</li>`);
      } else {
        highlights.push(`<li><strong>${escapeHtml(heading)}</strong></li>`);
      }
    } catch {
      // Skip unreadable files silently
    }
  }

  if (techStack.length > 0 && highlights.length > 0) {
    highlights.unshift(`<li><strong>Tech Stack</strong> — ${techStack.map(t => escapeHtml(t)).join(', ')}</li>`);
  }

  if (highlights.length === 0) {
    return '<li>See documentation sections below for architecture details</li>';
  }

  return highlights.join('\n          ');
}
```

- [ ] **Step 5: Replace hardcoded highlights block in `buildProductOverview()`**

```js
// skills/builder/templates/build-html.mjs — inside buildProductOverview()
// Replace lines 213-223 (the hardcoded <div class="architecture-highlights">...</div>)

// Before:
      <div class="architecture-highlights">
        <h3>Architecture Highlights</h3>
        <ul class="highlight-list">
          <li><strong>Feature-based modular architecture</strong> — Components, hooks, stores, and types co-located by domain</li>
          <li><strong>Zustand for global state</strong> — With persist, immer, and devtools middleware</li>
          <li><strong>React Router v6</strong> — Layout-driven routing with Public/Auth/Protected layouts and guards</li>
          <li><strong>TanStack Query v5</strong> — Custom hooks for data fetching, mutations, and optimistic updates</li>
          <li><strong>Tailwind CSS + CVA</strong> — Design tokens with class-variance-authority for component variants</li>
          <li><strong>TypeScript strict mode</strong> — BaseEntity, ApiResponse, PaginatedResponse patterns</li>
        </ul>
      </div>

// After:
      <div class="architecture-highlights">
        <h3>Architecture Highlights</h3>
        <ul class="highlight-list">
          ${extractArchitectureHighlights(kbDir, techStack)}
        </ul>
      </div>
```

- [ ] **Step 6: Add version parameter to `assembleKnowledgeBase()`**

```js
// skills/builder/templates/build-html.mjs — line 429
// Before:
export function assembleKnowledgeBase(kbDir) {

// After:
export function assembleKnowledgeBase(kbDir, options = {}) {

// Line 457:
// Before:
  kbMd += `*Generated by Insightify v4.0.0*\n\n`;

// After:
  const pluginVersion = options.insightifyVersion || '4.1.0';
  kbMd += `*Generated by Insightify v${pluginVersion}*\n\n`;
```

- [ ] **Step 7: Add `INSIGHTIFY_VERSION` to template and `buildArtifact()`**

Template change:
```html
<!-- skills/builder/templates/index-html-template.html — line 27 -->
<!-- Before: -->
      <span>Generated by Insightify v4.0.0</span>

<!-- After: -->
      <span>Generated by Insightify v{{INSIGHTIFY_VERSION}}</span>
```

`buildArtifact()` change:
```js
// skills/builder/templates/build-html.mjs — inside buildArtifact(), line 515
// Add INSIGHTIFY_VERSION to the render() data object:

  const insightifyVersion = options.insightifyVersion || '4.1.0';
  const renderedHtml = render(htmlTemplate, {
    TITLE: `${overview.name} - Technical Specification`,
    PRODUCT_NAME: overview.name,
    TAGLINE: overview.tagline,
    VERSION: overview.version,
    GENERATED_AT: new Date().toISOString().split('T')[0],
    SIDEBAR_NAV: sidebarNav,
    PRODUCT_OVERVIEW: overview.html,
    DOC_SECTIONS: docSections,
    PROCESS_DIAGRAM: processDiagram,
    STYLE: `<style>\n${styles}\n</style>`,
    SCRIPTS: `<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>\n<script>\n${scripts}\n</script>`,
    INSIGHTIFY_VERSION: insightifyVersion
  });

  const knowledgeBase = assembleKnowledgeBase(kbDir, { insightifyVersion });
```

- [ ] **Step 8: Run tests**

Run: `cd d:\AryokPunya\Magang\insight\.claude\plugins\insightify && npm test`
Expected: All PASS including 3 new tests for dynamic highlights, fallback, and version parameter.

- [ ] **Step 9: Commit**

```bash
git add skills/builder/templates/build-html.mjs skills/builder/templates/index-html-template.html tests/build-templates.test.js
git commit -m "feat: dynamic architecture highlights from KB and configurable version strings"
```

---

### Task 5: Reviewer Dynamic Architecture Alignment

**Files:**
- Modify: `skills/reviewer/references/review-criteria.md:9,50-53`
- Modify: `skills/reviewer/SKILL.md:47-49`

**Interfaces:**
- Consumes: Nothing (skill instruction files, not code)
- Produces: Updated review dimension wording — no hardcoded React patterns

- [ ] **Step 1: Update review-criteria.md**

```markdown
# In skills/reviewer/references/review-criteria.md

# Line 9 — replace:
# Before:
7. **Architecture Alignment**: Matches reference artifact patterns — feature-based modular React, Zustand with persist/immer/devtools, React Router v6 with layout-driven routing and guards, TanStack Query v5 custom hooks, Tailwind CSS with design tokens and CVA variants.

# After:
7. **Architecture Alignment**: Documentation accurately reflects the project's actual architectural patterns as extracted in the knowledge base (state management, routing, API layer, component structure, cross-cutting concerns).

# Lines 50-53 — replace scoring rubric:
# Before:
**Architecture Alignment** (matches reference artifact patterns):
- 5: Follows all patterns (Zustand, TanStack Query, React Router v6, Tailwind, feature-based)
- 3: Most patterns followed, minor deviations
- 1: Major pattern violations, wrong architecture

# After:
**Architecture Alignment** (matches extracted knowledge base):
- 5: All documented patterns match the extracted knowledge base; no fabricated or assumed patterns
- 3: Most patterns accurately reflected, minor gaps or slight assumptions
- 1: Documentation describes patterns not found in the codebase, or misrepresents the architecture
```

- [ ] **Step 2: Update reviewer SKILL.md**

```markdown
# In skills/reviewer/SKILL.md

# Lines 47-49 — replace scoring rubric:
# Before:
**Architecture Alignment** (matches reference artifact patterns):
- 5: Follows all patterns (Zustand, TanStack Query, React Router v6, Tailwind, feature-based)
- 3: Most patterns followed, minor deviations
- 1: Major pattern violations, wrong architecture

# After:
**Architecture Alignment** (matches extracted knowledge base):
- 5: All documented patterns match the extracted knowledge base; no fabricated or assumed patterns
- 3: Most patterns accurately reflected, minor gaps or slight assumptions
- 1: Documentation describes patterns not found in the codebase, or misrepresents the architecture
```

- [ ] **Step 3: Run tests**

Run: `cd d:\AryokPunya\Magang\insight\.claude\plugins\insightify && npm test`
Expected: All PASS. Review criteria test checks dimensions exist but not exact wording, so it still passes.

- [ ] **Step 4: Commit**

```bash
git add skills/reviewer/references/review-criteria.md skills/reviewer/SKILL.md
git commit -m "refactor: reviewer architecture alignment uses extracted KB patterns, not hardcoded React"
```

---

### Task 6: Documentation Sync

**Files:**
- Modify: `CLAUDE.md:10,25`
- Modify: `package.json:5`

**Interfaces:**
- Consumes: Nothing
- Produces: Accurate documentation matching code behavior

- [ ] **Step 1: Fix CLAUDE.md version and output path**

```markdown
# CLAUDE.md

# Line 10:
# Before:
## Architecture Overview (v4.0.0)

# After:
## Architecture Overview (v4.1.0)

# Line 25 (in Writer description):
# Before:
   - Generates markdown documentation pages under `docs/` in 5 dependency-aware waves using 14 specialized templates.

# After:
   - Generates markdown documentation pages under `docs/markdown/` in 5 dependency-aware waves using 14 specialized templates.
```

- [ ] **Step 2: Remove misleading `main` field from package.json**

```json
// package.json — remove line 5
// Before:
  "main": "index.js",

// After:
  (line removed)
```

- [ ] **Step 3: Run tests (sanity check)**

Run: `cd d:\AryokPunya\Magang\insight\.claude\plugins\insightify && npm test`
Expected: All PASS — doc changes don't affect tests.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md package.json
git commit -m "docs: sync CLAUDE.md version/paths and remove nonexistent main entry"
```

---

## Self-Review Checklist

| Spec Requirement | Task |
|------------------|------|
| Scaffold test version fix | Task 1, Step 1 |
| Remove scaffold assertions for missing manifests | Task 1, Step 1 |
| Dead code `extracted.components` | Task 1, Step 2 |
| PDF parser error handling | Task 2 |
| HTML parser header preservation | Task 3 |
| Dynamic version in KB header | Task 4, Step 6 |
| Dynamic version in HTML footer | Task 4, Step 7 |
| `inArray` unused variable | Task 4, Step 3 |
| Dynamic architecture highlights | Task 4, Steps 4-5 |
| `extractArchitectureHighlights()` function | Task 4, Step 4 |
| Fallback when KB empty | Task 4, Step 4 (built into function) |
| `assembleKnowledgeBase` backward compat | Task 4, Step 6 (`options = {}` default) |
| `buildArtifact` passes version | Task 4, Step 7 |
| Reviewer criteria dynamic wording | Task 5 |
| CLAUDE.md version sync | Task 6, Step 1 |
| CLAUDE.md output path sync | Task 6, Step 1 |
| package.json main field removal | Task 6, Step 2 |

**Placeholder scan:** ✅ No TBDs, TODOs, or "fill in later" anywhere.
**Type consistency:** ✅ `extractArchitectureHighlights(kbDir, techStack)` defined in Task 4 Step 4, called in Task 4 Step 5. `assembleKnowledgeBase(kbDir, options)` defined in Task 4 Step 6, called in Task 4 Step 7. All consistent.
