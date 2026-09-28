# Insightify v6.4.1

Generate artifact-style documentation and a Product Knowledge Base from source code, URLs, and files.

## Installation

```bash
/plugin marketplace add aorysan/marketplace
/plugin install insightify@aorysan-marketplace
```

## Usage

```bash
# Full pipeline
/insightify:insightify

# Individual stages
/insightify:planner  # Ingest → Extract → Plan (with approval)
/insightify:writer  # Generate markdown docs from plan
/insightify:reviewer # Review docs, send revisions back to writer
/insightify:builder # Render index.html + Product-Knowledge-Base.md from markdown
```

## Output Structure

```
insights/<project-name>/
├── index.html              # Single artifact-style page (open in browser)
├── Product-Knowledge-Base.md  # PRIMARY output — consolidated knowledge
├── docs/
│   ├── intake/             # Ingested sources
│   ├── plan/               # Approved documentation plan
│   ├── markdown/           # Writer output (documentation.md)
│   ├── final/              # Finalized documentation (final-documentation.md)
│   └── review/             # Review reports
└── .insightify/            # Internal workspace (knowledge/, sources/, review/)
```

**No npm install required for output.** Just open `index.html`.

## Verifying a generated output

Check any run against the pipeline contract (artifacts, knowledge citations, section parity, self-contained HTML):

```bash
npm install
npm run verify:output -- insights/<project-name>
```

Exit code is `0` when every required check passes. A reference-quality build passes all 19 checks.

## Skills

- `insightify` — orchestrator (full pipeline)
- `planner` — ingest + extract + plan
- `writer` — generate markdown docs
- `reviewer` — review & iterate
- `builder` — render HTML + assemble knowledge base