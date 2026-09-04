---
name: insightify
description: Generate comprehensive technical specification documentation (artifact-style HTML + knowledge-base.md) from an unstructured code repository.
---

# Insightify v6.4.1 Pipeline Orchestrator

When the user runs this skill, execute the 4-stage documentation pipeline sequentially. Do NOT skip any steps unless explicitly requested by the user.

## CLI Argument Parsing & Invocation

Support the following invocation patterns:
- `/insightify:insightify` -> Interactive:
  - You MUST stop execution and prompt the user for project name AND sources. Do NOT infer, reuse, or auto-detect sources from conversation history, existing [OUT_DIR], or workspace files. Only --resume, --sync, or --update allow reusing previous state.
  - If no --source, --config, --resume, --sync, or --update flag is provided, the agent MUST use the ask_question tool (or equivalent interactive prompt) to collect at least one source path/URL before proceeding to Planner.
- `/insightify:insightify <url>` -> Use URL as first source, prompt for project name, then prompt for additional sources
- `/insightify:insightify --project <name> --source <path>` -> Non-interactive
- `/insightify:insightify --config <path>` -> Read from `insightify.config.json`
- `/insightify:insightify --dry-run` -> Show execution plan without running
- `/insightify:insightify --resume [--from-step N]` -> Resume from last completed step or specified step (1=planner, 2=writer, 3=reviewer, 4=builder)
- `/insightify:insightify --sync` -> Incremental update: re-run pipeline against an existing [OUT_DIR], re-ingesting sources and updating only stale/affected knowledge + pages. Prompt for OUT_DIR/project if not resolvable.
- `/insightify:insightify --update <path-or-url>` -> Add/update a single source, then refresh dependent pages.

### Incremental Update Modes (--sync / --update)

- `[OUT_DIR]/.insightify/sources/manifest.md` is the source of truth for incremental runs.
- `--sync`: re-ingest only sources whose content/churn changed since the manifest; re-extract affected knowledge categories; pass the affected-pages list downstream.
- `--update <source>`: upsert a single manifest entry, re-extract its categories, refresh dependent pages.
- Writer/Reviewer operate on the affected-pages list when invoked in sync/update mode; run the full pipeline otherwise.

## Pipeline Execution (4 Stages)

1. **Planner:** Run `insightify:planner`.
   - Progress: `⏳ Planner: ingesting sources, extracting knowledge categories for detected archetype, generating plan...`
   - Error: If partial failure, log in manifest as `failed` and continue.
2. **Writer:** Run `insightify:writer`. Generate document sections independently in parallel.
   - Progress: `⏳ Writer: [======--] A/B sections (max 5 parallel)`
   - Error: If single section fails, log error, continue other sections, report failed sections.
3. **Reviewer:** Run `insightify:reviewer`.
   - Progress: `⏳ Reviewer: [========] X/10 dimensions (iteration 1/3)`
   - Error: If review loop exceeds 3 iterations, stop and report to user.
4. **Builder:** Run `insightify:builder`. Print success summary.
   - Progress: `⏳ Builder: rendering artifact-style index.html and knowledge-base.md...`

## Workspace Constraints

- Output directory: `OUT_DIR = "insights/<project-name>/"`. All pipeline stages MUST operate within this `OUT_DIR`.
- All intermediate data in `[OUT_DIR]/.insightify/`.
- Final output: `[OUT_DIR]/index.html`, `[OUT_DIR]/knowledge-base.md`, `[OUT_DIR]/docs/` (archive), `[OUT_DIR]/.insightify/` (workspace).
- On fresh run (no --resume, --sync, or --update), if [OUT_DIR]/.insightify/ already exists, warn the user and ask: 'Previous data found at [OUT_DIR]. Overwrite? [Y/n]'. Only proceed after confirmation. (--sync and --update target an existing OUT_DIR and refresh it incrementally without the overwrite prompt.)
- Detect missing `[OUT_DIR]/.insightify/` on resume and offer to restart or resume from last completed step.

## Output Specification (v6.4.1)

The pipeline generates a **Technical Specification** matching the reference artifact structure:

| Output | Description |
|--------|-------------|
| `index.html` | Single artifact-style HTML with CSS-only sidebar, Mermaid diagrams, dark/light mode, print support |
| `knowledge-base.md` | All knowledge categories emitted by Planner for the detected archetype, with source citations |

**Documentation Sections:** Planner emits the category set for the detected archetype (see Planner Phase 0); Builder concatenates exactly those category files under `(Categories)` headings.

