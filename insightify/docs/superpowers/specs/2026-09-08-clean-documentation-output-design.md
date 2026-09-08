# Clean Documentation Output & Pipeline Section Removal Design

- **Date:** 2026-09-08
- **Topic:** Remove Source Citations and Documentation Pipeline Section from Output
- **Target Plugin:** `insightify` (`.claude/plugins/insightify`)
- **Status:** Approved for Implementation

---

## 1. Background & Problem Statement

Insightify generates a comprehensive technical specification from a project repository across a 4-stage pipeline (Planner → Writer → Reviewer → Builder).

Two issues currently degrade the professionalism and user-readability of the generated deliverables:
1. **Pervasive Source Citations (`> **Source:** source-XXX.md § ...`)**:
   Underneath nearly every paragraph in `documentation.md`, `final-documentation.md`, `Product-Knowledge-Base.md`, and inside `<blockquote class="source-citation">` in `index.html`, raw file citations appear. While helpful during internal extraction, they clutter the final client-facing deliverables.
2. **Meta "Documentation Pipeline" Section at the End**:
   At the bottom of generated artifacts, a section titled "Documentation Pipeline" (or `#pipeline`) displays the internal 4-step generator flow (Planner → Writer → Reviewer → Builder). This is internal plugin meta-information and is completely irrelevant to the actual software product being documented.

In addition, unit tests in `tests/write-templates.test.js` and `tests/build-templates.test.js` are currently failing (14 failures) because they still assert the presence of these deprecated citations and pipeline diagrams.

---

## 2. Scope & Design Decision

Based on user review and selection (Option 1):
- **User-Facing Deliverables Cleaned**: `documentation.md`, `final-documentation.md`, `Product-Knowledge-Base.md`, and `index.html` will NOT contain source citations (`> **Source:**`) or the "Documentation Pipeline" process diagram.
- **Internal Knowledge Extraction Preserved**: Citations remain in `.insightify/knowledge/*.md` so the Planner and Reviewer can still audit fact origins internally.
- **Defense-in-Depth Sanitization**: In addition to instructing the LLM Writer not to generate citations, `build-html.mjs` acts as an automated safety gate by stripping any stray `> **Source:**` patterns when assembling `Product-Knowledge-Base.md` and by suppressing them when rendering `index.html`.
- **Test Suite Healing**: All tests are updated to assert the clean output structure, bringing `npm test` back to 100% passing.

---

## 3. Detailed Specifications by Component

### 3.1 Writer Skill (`skills/writer/SKILL.md`)

- **Instruction Updates**:
  - Add explicit rule under **Writing Style / Content Structure**:
    ```markdown
    - **NO Source Citations in Final Documentation**: Do NOT output `> **Source:** ...` or any blockquote source citations in the rendered documentation text. The user-facing documentation must be clean, readable, and client-ready. Source citations belong strictly to the internal extraction knowledge base (`.insightify/knowledge/`).
    ```
  - Verify that examples in `SKILL.md` do not demonstrate `> **Source:**` in documentation sections.

### 3.2 Reviewer Skill (`skills/reviewer/SKILL.md`)

- **Issue Classification & Scoring**:
  - Remove `"missing citation"` from line 84 (*Minor Issues*).
  - Add explicit guideline:
    ```markdown
    - Source citations (`> **Source:**`) are intentionally omitted from user-facing documentation (`documentation.md`). Do NOT flag missing citations as an issue or defect.
    ```

### 3.3 Builder Skill (`skills/builder/SKILL.md`)

- **Process Diagram Removal**:
  - Remove line 113: `- **Process Diagram**: 4-step flexbox (Planner → Writer → Reviewer → Builder) with In/Out labels.`
  - Remove references to `buildProcessDiagram()` and `{{PROCESS_DIAGRAM}}` in template descriptions (lines 282-283).
- **Citations Handling**:
  - Update line 107: `- Markdown → HTML: headings, paragraphs, code blocks, inline code, tables, lists, links, blockquotes (source citations suppressed).`
  - Update line 111: `- Product Overview: Grid cards from product.md; feature badges from features.md (no raw source citations).`
  - Update line 124: `- Product-Knowledge-Base.md: Assemble as the primary output. Generate a Table of Contents at the top, followed by the finalized documentation. Strip YAML frontmatter, and ensure all '> **Source:**' citations are stripped.`
- **Template Reference Sync**:
  - Update references from legacy `templates/index-html-template.html` to modular `templates/layouts/base.html` and `templates/components/`.

### 3.4 Builder Engine Script (`skills/builder/templates/build-html.mjs`)

- **Remove Pipeline Generator**:
  - Remove the exported function `buildProcessDiagram()`.
  - Remove `const processDiagram = buildProcessDiagram();` and `PROCESS_DIAGRAM: processDiagram` from `buildArtifact()`.
- **Sanitize Blockquote Citations in HTML Renderer**:
  - In `renderer.blockquote`:
    ```javascript
    renderer.blockquote = (quote) => {
      const quoteText = typeof quote === 'object' ? (quote.text || '') : quote;
      if (quoteText.includes('**Source:**') || quoteText.includes('<strong>Source:</strong>') || quoteText.includes('Source:')) {
        return '';
      }
      return `<blockquote>${quoteText}</blockquote>\n`;
    };
    ```
- **Sanitize Citations in Markdown Assembly (`assembleKnowledgeBase`)**:
  - In `assembleKnowledgeBase(finalDocPath, options)`:
    ```javascript
    // Strip frontmatter...
    // Strip any stray source citation lines
    body = body.replace(/^>\s*\*\*Source:\*\*.*(?:\r?\n)?/gm, '').replace(/\n{3,}/g, '\n\n');
    ```

### 3.5 Test Suite Alignment (`tests/`)

- **`tests/write-templates.test.js`**:
  - Remove line 77 (`assert.ok(content.includes('> **Source:**'))`) which previously enforced citations in writer templates.
  - Assert that templates have valid H1, H2, and frontmatter without demanding source citations in the markdown body.
- **`tests/build-templates.test.js`**:
  - Remove test `builder builds process diagram with 4 steps`.
  - In artifact integration tests, replace positive pipeline assertions with negative assertions:
    ```javascript
    assert.strictEqual(artifact.html.includes('id="pipeline"'), false, 'HTML artifact must not contain pipeline section');
    assert.strictEqual(artifact.html.includes('Documentation Pipeline'), false, 'HTML artifact must not contain Documentation Pipeline header');
    ```
  - Add unit tests verifying:
    1. `assembleKnowledgeBase` strips lines starting with `> **Source:**`.
    2. `renderer.blockquote` returns empty string for blockquotes containing `**Source:**`.

---

## 4. Verification Plan

1. **Automated Tests**:
   - Run `npm test` inside `.claude/plugins/insightify`.
   - Expected result: All 133 tests pass with 0 failures.
2. **Local Regression Verification**:
   - Run `buildArtifact` against fixture data and inspect generated HTML and Markdown strings.
   - Confirm no occurrence of `> **Source:**` in Markdown and no `<blockquote class="source-citation">` or `id="pipeline"` in HTML.
3. **Artifact Verification against `congen10`**:
   - Verify that running builder on `insights/congen10` generates clean `Product-Knowledge-Base.md` and `index.html`.
