---
name: writer
description: Stage 2 - Execute documentation plan by generating a single comprehensive markdown document.
---

# Writer Skill

## Instructions

1. Read `[OUT_DIR]/.insightify/plan.md` to get document structure, sections, and topics.
2. Read extracted knowledge categories in `[OUT_DIR]/.insightify/knowledge/*.md` for source facts, citations, and context.
3. Assign sub-agents to render sections/parts of the document independently in parallel based on the plan (maximum concurrency of 5).
4. Once all sections are rendered, stitch them together into a single comprehensive markdown document at `[OUT_DIR]/docs/markdown/documentation.md`.
5. Display summary to user for post-write review (total word count, section count, diagram count).
5. Handle targeted revisions if requested by user.

## Writing Style

- Tone: Client-friendly and business-oriented. Focus on "What it does" and "Business Value" (What & Why).
- Technical Depth: Avoid excessive technical jargon or deep code implementation details (How). Keep explanations short, concise, and accessible. Even for technical categories (like state management or routing), translate the explanation to be understandable for a client.
- Person: second person ("you") for instructions, third person for concepts
- Voice: active voice preferred ("Run the command" not "The command should be run")
- Avoid jargon without explanation — if a term is in `knowledge/business-policies.md` (glossary), link or define it on first use

## Conciseness & Abstraction Level

- **Target Length**: The generated documentation must be concise, targeting a maximum of ~500 lines total.
- **Product-Level Abstraction**: Focus strictly on product and business capabilities. NO full TypeScript interface/type dumps (summarize key fields only); NO localStorage or environment variable dumps.
- **No Redundant Sections**: Do NOT duplicate architecture, configuration, or data definitions across sections. Use anchor links (`[Section Title](#section-title)`) to cross-reference existing sections.
- **Concise Diagram Explanations**: Mermaid flows must be followed by at most 1 sentence per step or node—avoid long narrative paragraphs explaining diagrams.
- **Shallow Directory Trees**: Directory structures must be limited strictly to the top 2 levels max.

## Content Structure

- H1 (`#`): Reserved for the document title at the top of the file
- Content sections start at H2 (`##`) corresponding to the planned sections
- Heading levels incremental: H2 → H3 → H4, never skip levels
- Feature / sub-section headings: H3 = feature or sub-section title, H4 = detail sections; never skip levels

## Artifact HTML Formatting

- High information density: no long prose paragraphs or bullet walls. Every paragraph is at most 1 sentence. Optimize for scannability with short paragraphs, cards, grids, and tables.
- **Mandatory HTML Grid Cards for Enumerations**: When describing directory structures, features, components, architecture elements, API endpoint lists, process steps, or configuration options, you MUST use structural HTML grid cards instead of standard markdown lists.
  - `<div class="grid-2">...</div>` and `<div class="grid-3">...</div>` as layout wrappers containing two or three columns of cards
  - `<div class="artifact-card">...</div>` for each discrete item inside a grid
- **Card Content Rules**:
  - The title inside each `<div class="artifact-card">` MUST use an `<h4>` tag (e.g., `<h4>Title</h4>`).
  - File names, paths, or code terms MUST be wrapped in `<code>` tags (e.g., `<code>page.tsx</code>`).
  - Keep descriptions concise (1–2 sentences max per card).
- **Hard Anti-Pattern Rule — NO Markdown Bullets for Structures**: Explicitly forbid standard markdown lists (`-` or `*`) when describing directory structures, features, or APIs. Enforce `<div class="grid-2">` / `<div class="grid-3">` with `<div class="artifact-card">` instead.
- **Hard rule — raw HTML only inside wrappers:** Within `grid-*`, `artifact-card`, `badge`, and `status-indicator` wrappers, use raw HTML only (`<strong>`, `<h4>`, `<code>`, plain text). Markdown syntax will not be rendered inside these raw HTML elements (marked emits literal asterisks for `**bold**`, etc.) — never nest markdown syntax in them.
- **Few-Shot HTML Grid Template**:
```html
### src/app

<div class="grid-2">
  <div class="artifact-card">
    <h4>Pages</h4>
    The main app at <code>page.tsx</code> plus <code>login</code> and <code>register</code> auth screens.
  </div>
  <div class="artifact-card">
    <h4>API routes</h4>
    <code>api/chat</code> powers the live AI chatbot.
  </div>
</div>
```
- **Additional UI Components**:
  - `<span class="badge">LABEL</span>` for small labels such as HTTP methods, statuses, versions
  - `<div class="status-indicator">TEXT</div>` for state/health lists, with modifiers `status-warning` and `status-error` (e.g., `<div class="status-indicator status-error">Deprecated</div>`)
- Markdown stays the default for narrative flow; interleave the HTML wrappers above where structure beats prose — instead of raw markdown tables or bullet lists where appropriate.
- These classes are styled by the Builder CSS; do not invent other class names.
- Section heading numbers (`01`, `02`, ...) are added automatically by CSS counters — never hardcode them into headings.

## Cross-References

- Use section anchor links: `[Section Title](#section-title)`
- Only link to sections that exist in the document — do not create phantom references

## Code Examples

- Primary/critical endpoints only: provide concise request/response examples for core endpoints only, not every endpoint.
- Forbid code-block walls: avoid consecutive or overly long code blocks; keep snippets short, focused, and minimal.
- Workflows: step-by-step code or command example where necessary.
- Fenced code blocks with language tags: ` ```js `, ` ```bash `, etc.
- Mermaid diagrams (fenced with ` ```mermaid ` language tag):
  - User journey/workflow sections: ` ```mermaid flowchart ` showing steps and decision points.
  - State machine/entity lifecycle documentation: ` ```mermaid stateDiagram ` covering all states and transitions.
