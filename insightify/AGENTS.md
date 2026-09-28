# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Commands

- **Run tests**: `npm test` (runs `node --test`, discovers `tests/**/*.test.js`)
- **Install dependencies**: `npm install` (no flags needed; `package.json` `overrides` reconciles the stale `tree-sitter-typescript` peer range — see below)
- **Verify a generated output**: `npm run verify:output -- insights/<project>` (see Output verification below)
- No lint, typecheck, or format commands exist. No CI workflows.

### Output verification

`scripts/verify-output.mjs` checks a generated `insights/<project>/` against the pipeline contract: required artifacts, knowledge frontmatter plus source citations, client-facing output free of citations and YAML, Table of Contents ordering, document/KB/HTML section parity, and a self-contained HTML surface. It mirrors the builder's own slug and skip rules, so any run that drifts below the reference build fails the check (`insights/congen10` passes 19/19). `tests/verify-output.test.js` covers a clean output plus three corrupted variants so the verifier itself cannot silently pass everything.

### Dependency note: tree-sitter peer range

`tree-sitter-typescript@0.23.2` (latest) still declares `peerDependencies: tree-sitter ^0.21.0`, while `tree-sitter-javascript`/`tree-sitter-python` `@0.25.0` require `^0.25.0`. The ranges are mutually exclusive, so npm's resolver rejects the install without help. The package is compiled against ABI 14 and runs fine on `tree-sitter@0.25.1`, so `package.json` pins it via `overrides` instead of using `--legacy-peer-deps` or downgrading `tree-sitter` (which would break the other two grammars).

## What This Is

Insightify is a **Claude Code plugin** (v6.4.1) that generates technical documentation from codebases. It produces two outputs in `[OUT_DIR]`: a self-contained HTML spec page (`index.html`) and the consolidated `Product-Knowledge-Base.md`.

The "pipeline" is not runtime code — it's **AI agent instructions** (SKILL.md files) that an LLM executes step-by-step. The only executable JS code is parsers and the builder template engine.

## Architecture

4-stage sequential pipeline orchestrated by `skills/insightify/SKILL.md`:

1. **Planner** (`skills/planner/SKILL.md`) — Ingests sources, extracts knowledge, generates plan (ends with a `[HARD STOP]` for explicit user approval of the plan — no auto-approve)
2. **Writer** (`skills/writer/SKILL.md`) — Renders sections from the extracted knowledge base into a single markdown doc
3. **Reviewer** (`skills/reviewer/SKILL.md`) — Reviews across 10 quality dimensions, max 3 iterations
4. **Builder** (`skills/builder/SKILL.md`) — Renders the final HTML artifact and assembles `Product-Knowledge-Base.md`

Each stage has a standalone invocation (e.g., `/insightify:planner`) and an orchestrated mode.

## Key Structural Facts

- **Skill definitions** (`skills/*/SKILL.md`) are the primary source of truth. Tests validate their content structure extensively.
- **10 merged knowledge categories** (product, directory-structure, architecture, state-and-data, design-system, api-patterns, features-and-journeys, business-policies, constraints-and-limits, workflows) plus `unanswered`.
- **Parsers** (`skills/planner/parsers/*.js`) are CommonJS — `code-parser.js`, `html-parser.js`, `json-parser.js`, `pdf-parser.js`, `directory-scanner.js`, `color-extractor.js`.
- **Builder** (`skills/builder/templates/build-html.mjs`) is ESM. Tests import it via dynamic `import()`.
- **Writer sections are planned, not templated**: the writer reads `[OUT_DIR]/.insightify/plan.md` + `knowledge/*.md` and renders whatever sections the plan defines, so the plugin ships no writer-side section templates.
- **Output** goes to `insights/<project-name>/` relative to the target project.
- **Workspace** for intermediate data: `[OUT_DIR]/.insightify/`.

## Testing

- Tests validate SKILL.md content (required sections, keywords, structure) — not just behavior.
- `tests/build-templates.test.js` is the largest suite (~27 tests). Uses `jsdom` for DOM/JS runtime testing of `scripts-base.js`.
- `tests/fixtures/sample-14-kb/` is a generated fixture (14 `.md` files with frontmatter) used by build tests.
- Some tests in `build-templates.test.js` are commented out (template placeholder assertions) — these are intentional skips, not failures.

## Conventions

- This is a **plugin repo**, not a library or app. Changes to SKILL.md files change agent behavior, not runtime code.
- `.claude-plugin/plugin.json` is the only Claude Code manifest (Claude Code ignores a root-level `plugin.json`) and must stay version-synced with `package.json`.
- No TypeScript. No bundler. No dev server.
- Dependencies: `cheerio`, `pdf-parse`, `marked`, `jsdom`, `tree-sitter` (+ `tree-sitter-javascript`, `tree-sitter-typescript`, `tree-sitter-python`). Mermaid is CDN-loaded at runtime, not an npm dependency.
