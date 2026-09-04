# Insightify Plugin V4 Fixes Design

## Overview
This design addresses 4 key areas of improvement identified in the Insightify plugin repository (`.claude/plugins/insightify`):
1. Code Bugs (Parsers & Builder)
2. Documentation Inconsistencies
3. Dead Code & Hygiene
4. Test Gaps

## Area 1: Code Bugs

### 1. JSON Parser Data Loss
- **Problem**: `skills/planner/parsers/json-parser.js` currently looks only for specific `package.json` and `tsconfig.json` keys. If it encounters a generic JSON file (e.g., `openapi.json`), it returns an empty string, causing silent data loss in the ingestion pipeline.
- **Solution**: If no specific keys (`dependencies`, `scripts`, etc.) are found, the parser will fall back to formatting the entire parsed JSON payload as a `## JSON Data` Markdown code block.

### 2. Duplicate Heading in HTML Builder
- **Problem**: `skills/builder/templates/build-html.mjs` wraps each page's content in an `<h2>${title}</h2>`. However, the ingested Writer templates also begin with `# ${Title}`, resulting in duplicate headings (an `<h2>` followed immediately by an `<h1>`) in the final output.
- **Solution**: `build-html.mjs` will intercept the `content` and strip any leading `# Heading` using a Regex before rendering it, ensuring the injected `<h2>` is the only heading at the section root.

### 3. Code Parser Raw Duplication
- **Problem**: `skills/planner/parsers/code-parser.js` uses a fallback `let output = comments.join('\n\n') || codeString;`. This means if there are no JSDoc comments, the *entire* raw code is included. Later in the function, extracted interfaces/components are appended. This causes the entire file to be duplicated.
- **Solution**: Only fallback to `codeString` if the file has *no* comments AND *no* extracted interfaces, types, enums, components, or hooks.

### 4. HTML Parser Table Escaping
- **Problem**: Tables containing pipe characters `|` inside cells break the Markdown table generator in `html-parser.js`.
- **Solution**: Escape pipe characters as `\|` when pushing cell text.

## Area 2: Documentation Inconsistencies
- **AGENTS.md**: Outdated. Still references V2/V3 VitePress architecture (6 stages, 5 review dimensions). Update to V4 (4 stages, HTML artifact, 7 dimensions).
- **README.md**: Standardize output path to `insights/<project-name>/` (plural). Change manual invocation command to `/insightify-planner`.
- **SKILL.md (Insightify)**: Update category 14 name from `appendix` to `unanswered` to align with the extraction schema.

## Area 3: Dead Code & Hygiene
- **Legacy VitePress Files**: Delete `index-template.md`, `sidebar-template.js`, and `vitepress-config.js` from `skills/builder/templates/` since V4 outputs a single HTML artifact.
- **gitignore**: Add `.claude/settings.local.json`.
- **Writer Templates**: Remove the leading `# H1` from all 14 markdown templates in `skills/writer/templates/` to adhere to the SKILL.md rule that content starts at H2.

## Area 4: Test Suite Gaps
- **`ingest-parsers.test.js`**: 
  - Add test for arbitrary JSON parsing.
  - Add test executing `parsePdf` against the existing `sample.pdf` fixture.