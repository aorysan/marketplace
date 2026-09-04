# Compro Workflow Plugin Specification

## Overview

The `compro` project is being rewritten from a single monolithic skill into a multi-agent orchestrated plugin structure. The new architecture breaks the company profile generation process into distinct, isolated stages, allowing for better quality control, specialized prompt focus (writing vs. building vs. SEO), and automated feedback loops.

The plugin is primarily designed for Claude (via Claude Code) but maintains compatibility with other agents like Gemini or OpenCode. The orchestrator (`compro`) manages the state machine through prompt-based instructions, while specialized skills (`writer`, `reviewer`, `seo`, `builder`, `publisher`, `deploy-to-vercel`) execute the actual work.

## Architecture & Data Flow

The system uses a prompt-based orchestrator. The `compro` skill is the entry point, and it dictates the sequence of operations by instructing the LLM (Claude, Gemini, or OpenCode) to invoke other skills in a specific order.

State and artifacts are passed strictly via the filesystem to ensure compatibility across different LLM environments. Each skill reads specific input files and writes specific output files.

### The Pipeline

1. **Intake & Validation**: `compro` checks the `input/` folder for required data (`business-knowledge-base.md`, `brand-story-guide.md`, logo, assets). If missing, it halts and prompts the user.
2. **Drafting**: `compro` invokes `/writer`.
   - **Reads**: `input/*`
   - **Writes**: `artifacts/01-company-profile-draft.md`
3. **Review Loop**: `compro` invokes `/reviewer`.
   - **Reads**: `artifacts/01-company-profile-draft.md`, `input/*`
   - **Writes**: `artifacts/02-review-report.md`
   - **Logic**: If status is `REVISION_REQUIRED`, `compro` feeds the report back to `/writer` to update the draft. This repeats until `APPROVED`.
4. **Content SEO**: `compro` invokes `/seo` (content mode).
   - **Reads**: `artifacts/02-company-profile-final.md` (the approved draft), `input/*`
   - **Writes**: `artifacts/03-seo-brief.md`
5. **Building**: `compro` invokes `/builder`.
   - **Reads**: `artifacts/02-company-profile-final.md`, `artifacts/03-seo-brief.md`, templates.
   - **Writes**: HTML/CSS/JS artifacts into the `site/` folder.
6. **Technical SEO Loop**: `compro` invokes `/seo` (technical mode).
   - **Reads**: `site/*`, `artifacts/03-seo-brief.md`
   - **Writes**: `qa/seo-report.md`
   - **Logic**: If status is `FIX_REQUIRED`, `compro` feeds the report back to `/builder` to fix the HTML. Repeats until `PASSED`.
7. **Publish QA**: `compro` invokes `/publisher`.
   - **Reads**: `site/*`, `qa/seo-report.md`, `input/deployment-config.md`
   - **Writes**: `qa/publish-report.md`, `deploy/deployment-status.md`
8. **Deployment (Optional)**: If the target is Vercel and status is `READY_TO_DEPLOY`, `compro` invokes `/deploy-to-vercel`.
   - **Action**: Uses Bash tool to execute Vercel CLI commands.
   - **Writes**: URLs to `deploy/vercel-preview-url.txt` and `deploy/vercel-production-url.txt`.

## Component & File Structure

The project structure will be reorganized to support the plugin model:

```text
compro/
├── .codex-plugin/
│   └── plugin.json                     # Registers all skills (compatible format)
├── skills/
│   ├── compro/SKILL.md                 # The orchestrator state machine
│   ├── writer/SKILL.md                 # Copywriting & structure generation
│   ├── reviewer/SKILL.md               # QA checklist, fact-checking, narrative flow
│   ├── seo/SKILL.md                    # Dual-mode (content & technical)
│   ├── builder/SKILL.md                # HTML/CSS assembly & visual identity
│   ├── publisher/SKILL.md              # Pre-flight checks
│   └── deploy-to-vercel/SKILL.md       # Vercel CLI execution instructions
├── templates/
│   └── deck/                           # Moved from root
│       ├── deck-template.html
│       ├── core.css
│       ├── deck.css
│       ├── deck.js
│       └── layouts/
├── scripts/                            # QC and validation scripts
│   ├── render-all-slides.js
│   ├── validate-content.js
│   ├── validate-seo.js
│   └── optimize-assets.js
├── assets/
│   └── plugin-icon.png
└── README.md
```

## Error Handling & Edge Cases

1. **Missing Intake Data**: The `compro` orchestrator will strictly enforce the presence of required input files. It will explicitly halt the pipeline and ask the user for the missing data via chat.
2. **Infinite Loops**: The prompt-based orchestrator must be instructed to limit revision loops (e.g., max 3 attempts) before halting and asking for human intervention to prevent infinite loops between `writer` and `reviewer` or `builder` and `seo`.
3. **Vercel CLI Issues**: `deploy-to-vercel` will capture stderr from bash commands.
   - If unauthenticated, it will prompt the user to run `! vercel login` (or equivalent command based on the environment).
   - If the project isn't linked, it will guide the user through linking or run `vercel link`.
   - Production deployments (`vercel --prod`) require explicit user confirmation.
4. **Agent Compatibility**: Skill prompts must avoid Claude-specific features (like `<ant_...>` tags) and rely on standard markdown and clear conversational instructions to ensure Gemini and OpenCode can execute them reliably.

## Testing Strategy

Since this relies on LLM orchestration, testing involves verifying the state machine transitions:
1. Provide valid inputs and verify the pipeline runs through to completion using Claude.
2. Introduce a deliberate error in the draft to verify the `reviewer` catches it and the `writer` fixes it.
3. Remove a required input file to verify `compro` halts at Gate 0.
4. Cross-platform check: Manually verify the orchestrator prompt can be interpreted correctly by Gemini/OpenCode.
