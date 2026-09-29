---
name: builder
description: Stage 4 - Assemble Product-Knowledge-Base.md and render single artifact-style HTML preview.
---

# Builder Skill

## Interfaces

- **Consumes:** `[OUT_DIR]/docs/final/final-documentation.md`, `[OUT_DIR]/.insightify/knowledge/*.md`, `[OUT_DIR]/.insightify/plan.md`
- **Produces:** `[OUT_DIR]/Product-Knowledge-Base.md` (primary output) and `[OUT_DIR]/index.html` (preview)

## Instructions

1. Read `[OUT_DIR]/docs/final/final-documentation.md` (the finalized documentation emitted by Reviewer).
2. Read `[OUT_DIR]/.insightify/knowledge/*.md` (all category files emitted by Planner).
3. Read `[OUT_DIR]/.insightify/plan.md` for metadata (title, audience, section order).
4. Assemble `[OUT_DIR]/Product-Knowledge-Base.md` as the primary output consisting only of the finalized documentation (`final-documentation.md`), with an added Table of Contents at the top. The raw knowledge categories must remain untouched in their original `knowledge/` directory.
5. Render `[OUT_DIR]/index.html` as an HTML preview of the single `Product-Knowledge-Base.md` using `templates/layouts/base.html` (composed with `templates/components/*`) and `templates/build-html.mjs`'s `buildArtifact()`. **CRITICAL**: When writing the `build.mjs` script, you MUST import `build-html.mjs` using the absolute path to this local workspace plugin directory, NEVER from a global `plugins/cache` directory.
6. Copy `[OUT_DIR]/.insightify/sources/` → `[OUT_DIR]/docs/intake/`.
7. Copy `[OUT_DIR]/.insightify/plan.md` → `[OUT_DIR]/docs/plan/plan.md`.
8. Copy `[OUT_DIR]/.insightify/review/` → `[OUT_DIR]/docs/review/`.
9. Validate internal links (anchors within single document); warn on orphans.
10. Print completion summary:
    ```
    ✅ Insightify Build Complete!
    📚 Primary Output: [OUT_DIR]/Product-Knowledge-Base.md
    📁 Preview: [OUT_DIR]/index.html (single artifact-style page)
    📂 Archive: [OUT_DIR]/docs/ (intake, plan, markdown, final, review)
    To view preview: open index.html in browser
    ⚠️  Warnings: [any validation issues]
    ```

## index.html Structure (Artifact-Style, Single HTML File)

```html
<!DOCTYPE html>
<html lang="en" data-theme="system">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}}</title>
  {{STYLE}}  <!-- Inline CSS with design tokens -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
  {{> site-header}}        <!-- templates/components/site-header/header.html: {{PRODUCT_NAME}}, {{TAGLINE}}, theme toggle, print -->

  {{> section-indicators}}  <!-- templates/components/section-indicators/indicators.html: {{SIDEBAR_NAV}} -->

  <main class="site-main">
    <div class="doc-container">
      <article class="doc-content">
        <div class="artifact-container">
          <!-- Product Overview -->
          <section id="overview" class="doc-section">
            <span class="section-label">Overview</span>
            <h1>{{PRODUCT_NAME}}</h1>
            <p class="tagline">{{TAGLINE}}</p>
            {{PRODUCT_OVERVIEW}}
          </section>

          <!-- Documentation Sections (Rendered from Product-Knowledge-Base.md) -->
          {{DOC_SECTIONS}}
        </div>
      </article>
    </div>
  </main>

  {{SCRIPTS}}
</body>
</html>
```

## Rendering Rules

- **Markdown → HTML**: headings, paragraphs, code blocks, inline code, tables, lists, links, blockquotes (source citations suppressed).
- **Mermaid Diagrams**: Render via `mermaid.initialize({startOnLoad: true, theme: 'base', securityLevel: 'loose'})` - diagrams in `<pre class="mermaid">` blocks. *Note: Loaded from external CDN (jsDelivr); offline environments display pre-formatted diagrams or require a locally bundled script.*
- **Collapsible Trees**: Directory structure as nested `<details>/<summary>` with `open` on first level.
- **Tabs**: Component registry with tabbed interface (Component | Props | Usage) using CSS-only `:checked` hack.
- **Product Overview**: Grid cards from `product.md`; feature badges from `features-and-journeys.md` with source citations.
- **Doc Sections**: Render the single `Product-Knowledge-Base.md` with section navigation generated from H2/H3 headings, structuring sections as `<section id="slug" class="doc-section">` with label + heading + content.
- **Styling**: 
  - Design tokens as CSS custom properties (`--color-bg`, `--color-text`, `--color-primary`, etc.)
  - Light/dark via `prefers-color-scheme` AND `[data-theme="light"]` / `[data-theme="dark"]`
  - Google Fonts: IBM Plex Sans (headings and body), IBM Plex Mono (code), JetBrains Mono (secondary mono)
  - Print stylesheet: hides sidebar, expands all details, shows URLs
- **Minimal JavaScript** (only):
  - Theme toggle with localStorage persistence
  - Mermaid initialization
  - Smooth scroll to anchor
  - Copy code button (optional, progressive enhancement)
- **Product-Knowledge-Base.md**: Assemble as the primary output. Generate a Table of Contents at the top, followed by the finalized documentation. Do not concatenate raw knowledge categories. Strip YAML frontmatter, and strip all `> **Source:**` citations.

## Blueprint-Style Preview (index.html Only)

When generating the HTML preview (`index.html`), the Builder agent applies high-density blueprint skeleton styling to render key structural diagrams and workflows.

> [!IMPORTANT]
> **Scope & Isolation Rule:**
> - Blueprint styles and inline HTML components apply **ONLY** to `index.html` (the HTML preview).
> - `Product-Knowledge-Base.md` must remain clean, standard GitHub-flavored Markdown and must NOT contain these inline HTML layout blocks or inline CSS.
> - All styles must use CSS custom properties / inline styles that work self-contained with no new external CSS or JS dependencies.

### Diagram & Flow Transformations
Where applicable in `index.html`, transform standard linear prose or basic Mermaid flowcharts/stateDiagrams into the following high-density inline-styled blueprint components:

#### 1. Journey Matrix (`.bp-journey-matrix` style)
Used for multi-phase, multi-actor lifecycle journeys (e.g. End-to-End User & System workflows).
```html
<div class="bp-journey-matrix" style="display: grid; grid-template-columns: 140px repeat(auto-fit, minmax(180px, 1fr)); gap: 1px; background-color: var(--color-surface, #fff); border: 1px solid var(--color-border, #ddd9d0); border-radius: 6px; padding: 20px; overflow-x: auto; margin-bottom: 24px;">
  <!-- Header Row: Phases -->
  <div style="grid-column: 1 / -1; display: grid; grid-template-columns: 140px repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border-light, #eee); margin-bottom: 14px;">
    <div></div>
    <div style="font-family: var(--font-mono, monospace); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-muted, #736e65); font-weight: 500;">Phase 1 • Intake</div>
    <div style="font-family: var(--font-mono, monospace); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-muted, #736e65); font-weight: 500;">Phase 2 • Processing</div>
    <div style="font-family: var(--font-mono, monospace); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-muted, #736e65); font-weight: 500;">Phase 3 • Execution</div>
    <div style="font-family: var(--font-mono, monospace); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-muted, #736e65); font-weight: 500;">Phase 4 • Delivery</div>
  </div>
  <!-- Actor Row -->
  <div style="grid-column: 1 / -1; display: grid; grid-template-columns: 140px repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; align-items: stretch; padding: 12px 0; border-bottom: 1px dashed var(--color-border-light, #eee);">
    <div style="display: flex; flex-direction: column; justify-content: center; gap: 4px; padding-right: 12px;">
      <div style="font-size: 14px; font-weight: 600;">User Client</div>
      <div style="font-size: 11px; color: var(--color-text-muted, #736e65); font-family: var(--font-mono, monospace);">Web / Mobile</div>
    </div>
    <div style="background: var(--color-surface-highlight, #f8f6f0); border: 1px solid var(--color-border, #ddd9d0); border-left: 3px solid var(--color-primary, #2563eb); border-radius: 4px; padding: 10px 12px; font-size: 12.5px; line-height: 1.45; display: flex; flex-direction: column; gap: 4px;">
      <b>Submit Action</b>
      <span>User initiates request via form</span>
    </div>
    <div style="background: var(--color-surface-highlight, #f8f6f0); border: 1px solid var(--color-border, #ddd9d0); border-left: 3px solid var(--color-primary, #2563eb); border-radius: 4px; padding: 10px 12px; font-size: 12.5px; line-height: 1.45; display: flex; flex-direction: column; gap: 4px;">
      <b>Review Status</b>
      <span>Poll or await confirmation</span>
    </div>
    <div style="background: var(--color-surface-highlight, #f8f6f0); border: 1px solid var(--color-border, #ddd9d0); border-left: 3px solid var(--color-primary, #2563eb); border-radius: 4px; padding: 10px 12px; font-size: 12.5px; line-height: 1.45; display: flex; flex-direction: column; gap: 4px;">
      <b>Receive Token</b>
      <span>Authentication / session established</span>
    </div>
    <div style="background: var(--color-surface-highlight, #f8f6f0); border: 1px solid var(--color-border, #ddd9d0); border-left: 3px solid var(--color-primary, #2563eb); border-radius: 4px; padding: 10px 12px; font-size: 12.5px; line-height: 1.45; display: flex; flex-direction: column; gap: 4px;">
      <b>Access Service</b>
      <span>Final payload delivered</span>
    </div>
  </div>
</div>
```

#### 2. State Chain (`.bp-state-chain` style)
Used for entity state machines, status lifecycles, and transition exception rules.
```html
<div class="bp-state-container" style="display: flex; flex-direction: column; gap: 16px; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #ddd9d0); border-radius: 6px; padding: 20px; margin-bottom: 24px;">
  <div class="bp-state-chain" style="display: flex; align-items: center; gap: 0; overflow-x: auto; padding: 8px 0;">
    <div style="flex: 1; min-width: 110px; border: 2px solid var(--color-primary, #2563eb); border-radius: 4px; padding: 10px; text-align: center; font-family: var(--font-mono, monospace); font-size: 12px; font-weight: 600; background: var(--color-surface-highlight, #f8f6f0); white-space: nowrap;">STATE_INIT</div>
    <div style="width: 36px; flex-shrink: 0; display: flex; align-items: center;"><div style="flex: 1; height: 1px; background: var(--color-border-strong, #aaa);"></div><div style="width: 0; height: 0; border-left: 6px solid var(--color-border-strong, #aaa); border-top: 4px solid transparent; border-bottom: 4px solid transparent;"></div></div>
    <div style="flex: 1; min-width: 110px; border: 2px solid var(--color-primary, #2563eb); border-radius: 4px; padding: 10px; text-align: center; font-family: var(--font-mono, monospace); font-size: 12px; font-weight: 600; background: var(--color-surface-highlight, #f8f6f0); white-space: nowrap;">STATE_QUEUED</div>
    <div style="width: 36px; flex-shrink: 0; display: flex; align-items: center;"><div style="flex: 1; height: 1px; background: var(--color-border-strong, #aaa);"></div><div style="width: 0; height: 0; border-left: 6px solid var(--color-border-strong, #aaa); border-top: 4px solid transparent; border-bottom: 4px solid transparent;"></div></div>
    <div style="flex: 1; min-width: 110px; border: 2px solid var(--color-primary, #2563eb); border-radius: 4px; padding: 10px; text-align: center; font-family: var(--font-mono, monospace); font-size: 12px; font-weight: 600; background: var(--color-surface-highlight, #f8f6f0); white-space: nowrap;">STATE_ACTIVE</div>
    <div style="width: 36px; flex-shrink: 0; display: flex; align-items: center;"><div style="flex: 1; height: 1px; background: var(--color-border-strong, #aaa);"></div><div style="width: 0; height: 0; border-left: 6px solid var(--color-border-strong, #aaa); border-top: 4px solid transparent; border-bottom: 4px solid transparent;"></div></div>
    <div style="flex: 1; min-width: 110px; border: 2px solid var(--color-primary, #2563eb); border-radius: 4px; padding: 10px; text-align: center; font-family: var(--font-mono, monospace); font-size: 12px; font-weight: 600; background: var(--color-surface-highlight, #f8f6f0); white-space: nowrap;">STATE_COMPLETED</div>
  </div>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; padding-top: 12px; border-top: 1px dashed var(--color-border, #ddd9d0);">
    <div style="background: var(--color-surface-alt, #f2f0eb); padding: 10px 14px; border-radius: 4px; font-size: 12px; line-height: 1.5;">
      <b>Branch Exception:</b> On validation failure, reverts to <code>STATE_INIT</code> with error logged.
    </div>
    <div style="background: var(--color-surface-alt, #f2f0eb); padding: 10px 14px; border-radius: 4px; font-size: 12px; line-height: 1.5;">
      <b>Auto-Expire Policy:</b> Unclaimed items expire after TTL (15 mins) to <code>STATE_CANCELLED</code>.
    </div>
  </div>
</div>
```

#### 3. Numbered Timeline (`.bp-timeline-chain` style)
Used for operational step-by-step procedures, execution workflows, and SOP checklists.
```html
<div class="bp-timeline-chain" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
  <!-- Step 1 -->
  <div style="display: flex; gap: 14px; align-items: stretch;">
    <div style="width: 28px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 4px;">
      <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--color-text, #1a1917); color: var(--color-bg, #fff); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono, monospace); font-size: 11px; font-weight: 600;">1</div>
      <div style="flex: 1; width: 1px; background: var(--color-border, #ddd9d0);"></div>
    </div>
    <div style="flex: 1; border: 1px solid var(--color-border-light, #eee); border-radius: 4px; padding: 12px 16px; background: var(--color-surface-alt, #f2f0eb); margin-bottom: 8px;">
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Intake & Validation</div>
      <div style="font-size: 12.5px; color: var(--color-text-secondary, #555); line-height: 1.5;">Inspect incoming payload schemas and sanitize input params.</div>
    </div>
  </div>
  <!-- Step 2 -->
  <div style="display: flex; gap: 14px; align-items: stretch;">
    <div style="width: 28px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 4px;">
      <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--color-text, #1a1917); color: var(--color-bg, #fff); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono, monospace); font-size: 11px; font-weight: 600;">2</div>
      <div style="flex: 1; width: 1px; background: var(--color-border, #ddd9d0);"></div>
    </div>
    <div style="flex: 1; border: 1px solid var(--color-border-light, #eee); border-radius: 4px; padding: 12px 16px; background: var(--color-surface-alt, #f2f0eb); margin-bottom: 8px;">
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Execution & Processing</div>
      <div style="font-size: 12.5px; color: var(--color-text-secondary, #555); line-height: 1.5;">Execute core domain logic and persist transaction state.</div>
    </div>
  </div>
  <!-- Step 3 -->
  <div style="display: flex; gap: 14px; align-items: stretch;">
    <div style="width: 28px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 4px;">
      <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--color-text, #1a1917); color: var(--color-bg, #fff); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono, monospace); font-size: 11px; font-weight: 600;">3</div>
    </div>
    <div style="flex: 1; border: 1px solid var(--color-border-light, #eee); border-radius: 4px; padding: 12px 16px; background: var(--color-surface-alt, #f2f0eb); margin-bottom: 8px;">
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Confirmation & Emission</div>
      <div style="font-size: 12.5px; color: var(--color-text-secondary, #555); line-height: 1.5;">Emit outbound events and return response to client.</div>
    </div>
  </div>
</div>
```

#### 4. Architecture Grid (`.bp-arch-grid` style)
Used for multi-tier architecture, system layers, and ingress/gateway topologies.
```html
<div class="bp-arch-grid" style="display: flex; flex-direction: column; gap: 16px; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #ddd9d0); border-radius: 6px; padding: 20px; margin-bottom: 24px;">
  <!-- Tier 1: Ingress -->
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div style="font-family: var(--font-mono, monospace); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted, #736e65);">Tier 1 • Client & Ingress Channels</div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
      <div style="border: 1px solid var(--color-border, #ddd9d0); background: var(--color-surface-highlight, #f8f6f0); border-radius: 4px; padding: 12px; display: flex; flex-direction: column; gap: 4px;">
        <div style="font-size: 14px; font-weight: 600;">Web & Mobile App</div>
        <div style="font-size: 12px; color: var(--color-text-muted, #736e65);">Client user interface</div>
        <div style="margin-top: 4px;"><span style="display: inline-flex; align-items: center; padding: 2px 7px; border-radius: 3px; font-family: var(--font-mono, monospace); font-size: 11px; background: var(--color-surface-highlight, #f8f6f0); color: var(--color-primary, #2563eb); border: 1px solid var(--color-border, #ddd9d0);">REST / WebSocket</span></div>
      </div>
    </div>
  </div>
  <div style="text-align: center; font-family: var(--font-mono, monospace); font-size: 11px; color: var(--color-text-muted, #736e65);">↓ HTTP / API Gateway ↓</div>
  <!-- Tier 2: Core Domain Logic -->
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div style="font-family: var(--font-mono, monospace); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted, #736e65);">Tier 2 • Core Engine & Services</div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
      <div style="border: 1px solid var(--color-border, #ddd9d0); background: var(--color-surface-alt, #f2f0eb); border-radius: 4px; padding: 12px; display: flex; flex-direction: column; gap: 4px;">
        <div style="font-size: 14px; font-weight: 600;">Application Logic</div>
        <div style="font-size: 12px; color: var(--color-text-muted, #736e65);">Domain rules & request handlers</div>
      </div>
    </div>
  </div>
  <div style="text-align: center; font-family: var(--font-mono, monospace); font-size: 11px; color: var(--color-text-muted, #736e65);">↓ Storage / Events ↓</div>
  <!-- Tier 3: Persistence & Integrations -->
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div style="font-family: var(--font-mono, monospace); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted, #736e65);">Tier 3 • Persistence & External Services</div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
      <div style="border: 1px solid var(--color-border, #ddd9d0); background: var(--color-surface-dark, #1a1917); color: #fff; border-radius: 4px; padding: 12px; display: flex; flex-direction: column; gap: 4px;">
        <div style="font-size: 14px; font-weight: 600;">Database & Cache</div>
        <div style="font-size: 12px; color: #aaa;">Persistence layer and caching store</div>
      </div>
    </div>
  </div>
</div>
```

## Templates

- `templates/layouts/base.html` (with modular `templates/components/`) — Modular HTML template with placeholders: `{{TITLE}}`, `{{PRODUCT_NAME}}`, `{{TAGLINE}}`, `{{VERSION}}`, `{{GENERATED_AT}}`, `{{SIDEBAR_NAV}}`, `{{PRODUCT_OVERVIEW}}`, `{{DOC_SECTIONS}}`, `{{STYLE}}`, `{{SCRIPTS}}`
- `templates/build-html.mjs` — Exports: `renderMarkdown(md)`, `buildProductOverview(kbDir)`, `buildDocSections(docPath)`, `buildSidebarNav(docPath)`, `assembleKnowledgeBase(finalDocPath, options)`, `render(template, data)`, `readTemplate(templateName)`, `buildArtifact(options)`
- `templates/layouts/styles-base.css` (plus component CSS under `templates/components/`) — Complete inline CSS (design tokens, layout, components, print, dark/light themes)
- `templates/layouts/scripts-base.js` — Minimal JS bundle (theme toggle with localStorage, Mermaid init with theme sync, smooth scroll, copy code button, sidebar mobile toggle, active nav highlight)