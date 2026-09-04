# Insightify v6.4.1

Generate artifact-style documentation and a Product Knowledge Base from source code, URLs, and files.

## Installation

```bash
# ... existing install ...
```

## Usage

```bash
# Full pipeline
/insightify

# Individual stages
/insightify-planner # Ingest → Extract → Plan (with approval)
/writer           # Generate markdown docs from plan
/reviewer         # Review docs, send revisions back to writer
/builder          # Render index.html + knowledge-base.md from markdown
```

## Output Structure

```
insights/<project-name>/
├── index.html              # Single artifact-style page (open in browser)
├── knowledge-base.md       # PRIMARY output — consolidated knowledge
├── docs/
│   ├── intake/             # Ingested sources
│   ├── plan/               # Approved documentation plan
│   ├── markdown/           # Generated markdown pages
│   └── review/             # Review reports
└── .insightify/            # Internal workspace
```

**No npm install required for output.** Just open `index.html`.

## Skills

- `insightify` — orchestrator (full pipeline)
- `planner` — ingest + extract + plan
- `writer` — generate markdown docs
- `reviewer` — review & iterate
- `builder` — render HTML + assemble knowledge base