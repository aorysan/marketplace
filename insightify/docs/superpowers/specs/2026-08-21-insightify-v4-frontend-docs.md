# Insightify v4 — Frontend Technical Documentation Generator

**Date:** 2026-08-21  
**Status:** Draft (v4.0 Breaking Change)  
**Author:** Aryo Adi Putro  
**Based on:** Artifact `d4a1b3fd-2069-437c-822d-5df697a97e3d` reference structure

---

## 1. Overview

### Problem
Current Insightify generates generic VitePress documentation. Users want **comprehensive technical specifications** for frontend applications — specifically React/TypeScript projects — with:
- Directory structure (feature-based modular)
- TypeScript data models & interfaces
- Component architecture trees
- State management patterns (Zustand/Redux)
- Routing & layout structures
- API interaction patterns (custom hooks)

### Solution
Redesign Insightify's extraction schema, planner, writer, and builder to output a **single artifact-style HTML document** that serves as a complete technical specification for frontend projects — matching the reference artifact structure exactly.

### Target Output
**One self-contained `index.html`** (artifact-style, no JS framework) + **`knowledge-base.md`** containing:

```
# Technical Specification: [Project Name]

## 1. Executive Summary
## 2. Directory Structure (Feature-based Modular)
## 3. Global Data Models (TypeScript Interfaces)
## 4. Component Architecture Tree
## 5. State Management
## 6. Routing & Layout Structure
## 7. UI Component Library
## 8. API Interaction Patterns
## 9. Cross-Cutting Concerns
## 10. Appendix (Glossary, References)
```

---

## 2. Architecture Changes

### 2.1 Skill Restructure (5 Skills → 4 Stage Skills + 1 Orchestrator)

| New Skill | Replaces | Folder | Command |
|-----------|----------|--------|---------|
| `insightify` (orchestrator) | `insightify` | `skills/insightify/SKILL.md` | `/insightify` |
| `planner` | `ingest` + `extract` + `plan` | `skills/planner/` | `/planner` |
| `writer` | `write` | `skills/writer/` | `/writer` |
| `reviewer` | `review` | `skills/reviewer/` | `/reviewer` |
| `builder` | `build` | `skills/builder/` | `/builder` |

### 2.2 Pipeline Flow (4 Stages)

```
/insightify
   ├─ 1. planner    → sources + 14 knowledge categories + approved plan
   ├─ 2. writer     → docs/markdown/*.md (14 pages)
   ├─ 3. reviewer   → review report → targeted fixes (max 3 iterations)
   └─ 4. builder    → index.html + knowledge-base.md + docs/ archive
```

### 2.3 Output Structure

```
insight/<project-name>/
├── index.html                    # Single artifact-style document
├── knowledge-base.md             # PRIMARY: 14 categories concatenated
├── docs/
│   ├── intake/                   # Copy of .insightify/sources/
│   ├── plan/                     # Copy of approved plan.md
│   ├── markdown/                 # Writer pages (render source)
│   └── review/                   # Copy of review reports
└── .insightify/                  # Internal workspace
    ├── sources/                  # source-XXX.md + manifest.md
    ├── knowledge/                # 14 category files
    ├── plan.md
    └── review/
```

---

## 3. Enhanced Extraction Schema (14 Categories)

### 3.1 Category Definitions

| # | File | Purpose | Source Signals |
|---|------|---------|----------------|
| 1 | `product.md` | Product name, description, audience, value prop | README, package.json, docs |
| 2 | `directory-structure.md` | Feature-based folder tree | File system scan, import paths |
| 3 | `data-models.md` | TypeScript interfaces (BaseEntity, ApiResponse, User, etc.) | `*.ts`, `*.tsx`, `types/`, `interfaces/` |
| 4 | `component-architecture.md` | Component tree: PublicLayout, AuthLayout, ProtectedLayout | `components/`, `layouts/`, `pages/`, JSX imports |
| 5 | `state-management.md` | Stores (auth, app, feature), hooks, selectors | `stores/`, `hooks/`, Zustand/Redux patterns |
| 6 | `routing-structure.md` | Routes, layouts, guards (PublicRoute, PrivateRoute) | `routes/`, `App.tsx`, router config |
| 7 | `ui-component-library.md` | UI primitives: Button, Input, Modal, Table, Card, Toast | `components/ui/`, Storybook, design tokens |
| 8 | `api-patterns.md` | API client, interceptors, custom hooks (useFetchData) | `services/`, `hooks/use*.ts`, axios/fetch config |
| 9 | `features.md` | Business features with descriptions | Feature folders, domain logic |
| 10 | `terminology.md` | Domain-specific glossary | Code comments, docs, types |
| 11 | `workflows.md` | Step-by-step user procedures | README, docs, code comments |
| 12 | `constraints.md` | Technical limitations, dependencies | package.json, config, docs |
| 13 | `unanswered.md` | Gaps, contradictions, ambiguities | Conflicts, missing info |
| 14 | `cross-cutting.md` | Auth, theming, i18n, error handling, logging | Global providers, middleware |

### 3.2 YAML Frontmatter (Per Category)

```yaml
---
category: "data-models"
extracted_from:
  - source-001.md
  - source-005.md
confidence: "high"
extracted_at: "2026-08-21T10:35:00Z"
tags:
  - "typescript"
  - "interfaces"
  - "api-types"
---
```

---

## 4. Enhanced Plan Template

### 4.1 Plan Frontmatter

```yaml
---
project: "<Project Name>"
generated_at: "<ISO Timestamp>"
status: "approved"
total_pages: 14
audience: "frontend-developers"
doc_type: "frontend-technical-specification"
output_format: "artifact-html"
---
```

### 4.2 Plan Sections (14 Pages)

```markdown
# Documentation Plan: <Project Name>

## Overview
<Generated from product.md + cross-cutting.md>

## Audience
- **Primary:** Frontend Developers (React/TypeScript)
- **Secondary:** Full-stack Developers, Tech Leads
- **Tertiary:** QA, DevOps, Product Managers

## Pages (Writing Order = Dependency Order)

### 1. Executive Summary
- **Purpose:** High-level project overview for stakeholders
- **Audience:** All
- **Sources:** product.md, features.md
- **Dependencies:** None
- **Priority:** high

### 2. Directory Structure
- **Purpose:** Feature-based modular folder architecture
- **Audience:** Developers
- **Sources:** directory-structure.md
- **Dependencies:** None
- **Priority:** high

### 3. Global Data Models
- **Purpose:** TypeScript interfaces for entities, API responses, pagination
- **Audience:** Developers
- **Sources:** data-models.md, api-patterns.md
- **Dependencies:** None
- **Priority:** high

### 4. Component Architecture
- **Purpose:** Component tree with layouts (Public, Auth, Protected)
- **Audience:** Developers
- **Sources:** component-architecture.md, ui-component-library.md
- **Dependencies:** Page 2 (Directory Structure)
- **Priority:** high

### 5. State Management
- **Purpose:** Global stores (auth, app), custom hooks, selectors
- **Audience:** Developers
- **Sources:** state-management.md
- **Dependencies:** Page 3 (Data Models - User type)
- **Priority:** high

### 6. Routing & Layout Structure
- **Purpose:** Route configuration, layouts, guards
- **Audience:** Developers
- **Sources:** routing-structure.md, component-architecture.md
- **Dependencies:** Page 4 (Component Architecture)
- **Priority:** high

### 7. UI Component Library
- **Purpose:** Reusable UI primitives inventory
- **Audience:** Developers, Designers
- **Sources:** ui-component-library.md
- **Dependencies:** Page 2
- **Priority:** medium

### 8. API Interaction Patterns
- **Purpose:** API client, interceptors, custom hooks (useFetchData)
- **Audience:** Developers
- **Sources:** api-patterns.md, data-models.md
- **Dependencies:** Page 3 (Data Models - ApiResponse)
- **Priority:** high

### 9. Features & Business Logic
- **Purpose:** Domain features with procedures
- **Audience:** Developers, PMs
- **Sources:** features.md, workflows.md
- **Dependencies:** Pages 3, 4, 5
- **Priority:** medium

### 10. Cross-Cutting Concerns
- **Purpose:** Auth, theming, i18n, error handling, logging
- **Audience:** Developers, DevOps
- **Sources:** cross-cutting.md
- **Dependencies:** Pages 5, 6
- **Priority:** medium

### 11. Terminology & Glossary
- **Purpose:** Domain-specific terms
- **Audience:** All
- **Sources:** terminology.md
- **Dependencies:** None
- **Priority:** low

### 12. Constraints & Limitations
- **Purpose:** Technical constraints, known issues
- **Audience:** Developers, Architects
- **Sources:** constraints.md, unanswered.md
- **Dependencies:** None
- **Priority:** low

### 13. Workflows & Procedures
- **Purpose:** Step-by-step operational procedures
- **Audience:** Developers, QA, Support
- **Sources:** workflows.md
- **Dependencies:** Pages 4, 5, 8
- **Priority:** low

### 14. Appendix
- **Purpose:** References, changelog, links
- **Audience:** All
- **Sources:** appendix.md (generated)
- **Dependencies:** All previous
- **Priority:** low

## Page Dependency Graph
```
Wave 1 (Parallel): Pages 1, 2, 3, 11, 12
Wave 2 (After 2,3): Pages 4, 5, 7
Wave 3 (After 3,4,5): Pages 6, 8
Wave 4 (After 4,5,6,8): Pages 9, 10, 13
Wave 5 (After all): Page 14
```

## Writing Order
1. Executive Summary
2. Directory Structure
3. Global Data Models
4. Terminology & Glossary
5. Constraints & Limitations
6. Component Architecture
7. State Management
8. UI Component Library
9. Routing & Layout Structure
10. API Interaction Patterns
11. Features & Business Logic
12. Cross-Cutting Concerns
13. Workflows & Procedures
14. Appendix
```

---

## 5. Writer Templates (New Templates Required)

### 5.1 Template Files to Create

| Template | Output Page | Key Elements |
|----------|-------------|--------------|
| `executive-summary-template.md` | Page 1 | Product cards, feature highlights, tech stack badges |
| `directory-structure-template.md` | Page 2 | Collapsible tree view, folder purpose descriptions |
| `data-models-template.md` | Page 3 | TypeScript code blocks, interface tables, inheritance diagrams |
| `component-architecture-template.md` | Page 4 | JSX tree diagram, layout breakdown, component responsibilities |
| `state-management-template.md` | Page 5 | Store code, state flow diagrams, hook usage examples |
| `routing-structure-template.md` | Page 6 | Route table, guard logic, layout composition |
| `ui-component-library-template.md` | Page 7 | Component inventory table, props interface, usage examples |
| `api-patterns-template.md` | Page 8 | Hook code, interceptor patterns, error handling flows |
| `features-template.md` | Page 9 | Feature cards, acceptance criteria, related components |
| `cross-cutting-template.md` | Page 10 | Provider tree, middleware chain, config tables |
| `terminology-template.md` | Page 11 | Glossary table with definitions & sources |
| `constraints-template.md` | Page 12 | Constraint cards with severity & workarounds |
| `workflows-template.md` | Page 13 | Numbered procedures, decision trees, rollback steps |
| `appendix-template.md` | Page 14 | Reference links, changelog, contributor guide |

### 5.2 Template Design Principles

- **Code-first**: Every technical concept shown as syntax-highlighted code
- **Visual diagrams**: Mermaid.js for trees, flows, state machines
- **Tabbed examples**: TypeScript / JavaScript / React variants where applicable
- **Source citations**: Every fact traced to `> **Source:** source-XXX.md § Section`
- **Progressive disclosure**: Collapsible sections for detail-heavy content

---

## 6. Builder: Artifact-Style HTML Renderer

### 6.1 HTML Structure (Single Page)

```html
<!DOCTYPE html>
<html lang="en" data-theme="system">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PROJECT_NAME}} — Technical Specification</title>
  <!-- Google Fonts: Space Grotesk, Inter, JetBrains Mono -->
  <style>{{INLINE_CSS}}</style>
</head>
<body>
  <div class="page-wrapper">
    <!-- Masthead -->
    <header class="masthead">
      <div class="kicker">Insightify Generated Specification · v{{VERSION}}</div>
      <h1 class="title">{{PROJECT_NAME}}</h1>
      <p class="tagline">{{TAGLINE}}</p>
      <div class="meta">
        <span class="badge">{{PRIMARY_AUDIENCE}}</span>
        <span class="badge">{{DOC_TYPE}}</span>
        <time>{{GENERATED_AT}}</time>
      </div>
    </header>

    <!-- Sidebar Navigation (CSS-only, collapsible) -->
    <nav class="sidebar" id="sidebar">
      <button class="sidebar-toggle" aria-label="Toggle navigation">☰</button>
      <ul class="toc">
        <li><a href="#executive-summary">1. Executive Summary</a></li>
        <li><a href="#directory-structure">2. Directory Structure</a></li>
        <li><a href="#data-models">3. Global Data Models</a></li>
        <!-- ... all 14 sections -->
      </ul>
    </nav>

    <!-- Main Content -->
    <main class="content" id="content">
      {{SECTION_1_EXECUTIVE_SUMMARY}}
      {{SECTION_2_DIRECTORY_STRUCTURE}}
      {{SECTION_3_DATA_MODELS}}
      <!-- ... all 14 sections rendered in order -->
    </main>

    <!-- Footer -->
    <footer>
      <span>Generated by Insightify v{{VERSION}}</span>
      <span>{{COMPANY}} · {{LAST_UPDATED}}</span>
    </footer>
  </div>

  <!-- Mermaid CDN for diagrams -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({startOnLoad: true, theme: 'neutral'});</script>
  
  <!-- Minimal JS: sidebar toggle, copy code buttons, theme toggle -->
  <script>{{MINIMAL_JS}}</script>
</body>
</html>
```

### 6.2 Key Rendering Features

| Feature | Implementation |
|---------|----------------|
| **Directory Tree** | `<details>/<summary>` collapsible tree with folder icons |
| **TypeScript Code** | Prism.js-style highlighting (inline CSS, no JS) |
| **Mermaid Diagrams** | Client-side render via CDN (component tree, state flow, routing) |
| **Interface Tables** | HTML tables with `interface` badge, property rows |
| **Feature Cards** | Grid layout with tags, priority, status badges |
| **Tabbed Code** | CSS-only tabs for TS/JS/React variants |
| **Dark/Light Mode** | CSS custom properties + `prefers-color-scheme` + manual toggle |
| **Copy Code Buttons** | Minimal JS (Clipboard API) |
| **Anchor Links** | Hover-reveal on headings |
| **Print/PDF Ready** | `@media print` styles for clean export |

### 6.3 Styling Tokens

```css
:root {
  /* Fonts */
  --font-heading: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Colors (Light) */
  --bg: #ffffff;
  --bg-elevated: #fafafa;
  --text: #1a1a2e;
  --text-muted: #6b6b80;
  --border: #e4e4eb;
  --primary: #16705e;
  --primary-hover: #0f5a4a;
  --code-bg: #f3f4f6;
  --code-text: #1f2937;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Layout */
  --max-width: 960px;
  --sidebar-width: 280px;
  --header-height: auto;
  
  /* Radius & Shadows */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0d0d14;
    --bg-elevated: #14141f;
    --text: #e8e8f0;
    --text-muted: #9aa0b0;
    --border: #2a2a3e;
    --primary: #4ade80;
    --primary-hover: #86efac;
    --code-bg: #16161f;
    --code-text: #e0e0e8;
  }
}

[data-theme="light"] { /* light overrides */ }
[data-theme="dark"] { /* dark overrides */ }
```

---

## 7. Knowledge Base Output (`knowledge-base.md`)

Single concatenated file with all 14 categories:

```markdown
# Knowledge Base: <Project Name>

## Product
<content from product.md>

## Directory Structure
<content from directory-structure.md>

## Data Models
<content from data-models.md>

## Component Architecture
<content from component-architecture.md>

## State Management
<content from state-management.md>

## Routing Structure
<content from routing-structure.md>

## UI Component Library
<content from ui-component-library.md>

## API Patterns
<content from api-patterns.md>

## Features
<content from features.md>

## Terminology
<content from terminology.md>

## Workflows
<content from workflows.md>

## Constraints
<content from constraints.md>

## Unanswered
<content from unanswered.md>

## Cross-Cutting Concerns
<content from cross-cutting.md>
```

**Preserves**: All YAML frontmatter (stripped), all `> **Source:**` citations, all confidence markers.

---

## 8. Parser Enhancements Needed

### 8.1 HTML Parser (`skills/planner/parsers/html-parser.js`)
- Already supports headings, lists, code, tables, links ✅
- **Add**: Mermaid diagram extraction (`<pre class="mermaid">`)

### 8.2 Code Parser (`skills/planner/parsers/code-parser.js`)
**Extend to extract:**
- TypeScript interfaces & types
- React component props interfaces
- Zustand/Redux store definitions
- Custom hook signatures
- API client configurations
- Route configurations
- Component import/export graphs

### 8.3 New: Directory Scanner
**Add to planner ingest phase:**
- Walk `src/` directory
- Generate feature-based tree
- Detect: `features/`, `components/ui/`, `stores/`, `hooks/`, `services/`, `types/`

---

## 9. Reviewer Enhancements

### 9.1 New Review Dimensions (7 total)

| Dimension | Checks |
|-----------|--------|
| **Accuracy** | Code snippets compile, types match sources |
| **Completeness** | All 14 sections present per plan |
| **Consistency** | Naming conventions, code style, terminology |
| **Structure** | Heading hierarchy, cross-references valid |
| **Usability** | Copyable code, clear diagrams, actionable |
| **Type Safety** | TypeScript interfaces valid, no `any` abuse |
| **Architecture Alignment** | Component tree matches actual imports |

### 9.2 Severity Thresholds
- **Critical**: Invalid TypeScript, broken component references, missing core section
- **Major**: Inconsistent patterns, incomplete interfaces, missing diagrams
- **Minor**: Formatting, missing citations, typo

---

## 10. Configuration (`insightify.config.json`)

```json
{
  "projectName": "my-frontend-app",
  "outputDir": "./insight/my-frontend-app",
  "sources": [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./package.json",
    "./README.md",
    "./docs/**/*.md"
  ],
  "docType": "frontend-technical-specification",
  "outputFormat": "artifact-html",
  "extraction": {
    "categories": "all",
    "parallel": true,
    "confidenceThreshold": "medium"
  },
  "planner": {
    "pageSizing": { "min": 500, "ideal": 1500, "max": 3000 },
    "maxWaves": 5,
    "revisionCycles": 3
  },
  "builder": {
    "theme": "auto",
    "includeMermaid": true,
    "includeCopyButtons": true,
    "generatePDF": false
  }
}
```

---

## 11. CLI Interface (Unchanged)

```bash
# Interactive
/insightify

# With URL
/insightify https://github.com/user/repo

# Non-interactive
/insightify --project my-app --source ./src --source ./package.json

# Config file
/insightify --config ./insightify.config.json

# Dry run
/insightify --dry-run

# Resume
/insightify --resume --from-step 3
```

---

## 12. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Update extraction schema (14 categories)
- [ ] Update planner skill for new categories
- [ ] Add directory scanner to ingest
- [ ] Enhance code parser for TS/React patterns

### Phase 2: Templates (Week 2)
- [ ] Create 14 writer templates
- [ ] Enhance plan template with 14 pages + dependency graph
- [ ] Add Mermaid diagram helpers to templates

### Phase 3: Builder (Week 3)
- [ ] Rewrite `build-html.mjs` for artifact HTML
- [ ] Implement CSS-only sidebar, collapsible tree, tabs
- [ ] Add Mermaid CDN integration
- [ ] Implement dark/light mode + print styles

### Phase 4: Integration & Testing (Week 4)
- [ ] End-to-end test with sample React project
- [ ] Validate all 14 sections render correctly
- [ ] Test review loop with new dimensions
- [ ] Performance: large codebases (1000+ files)

---

## 13. Breaking Changes from v3

| v3 | v4 |
|----|----|
| 6 skills | 5 skills (4 stages + orchestrator) |
| 7 knowledge categories | 14 knowledge categories |
| VitePress output | Single artifact HTML + knowledge-base.md |
| Generic templates | Frontend-specific templates (14) |
| `package.json` + `npm run dev` | Zero-dep, open `index.html` directly |
| Sidebar navigation (VitePress) | CSS-only collapsible sidebar |
| No diagrams | Mermaid diagrams rendered in-browser |

---

## 14. Migration Guide (v3 → v4)

1. **Re-run** `/insightify` on existing projects — new output structure
2. **Update** `insightify.config.json` with `docType: "frontend-technical-specification"`
3. **Delete** old output folder — v4 uses `insight/<project-name>/`
4. **No npm install needed** for generated output

---

## 15. Success Criteria

- [ ] Generates complete 14-section spec for any React/TypeScript project
- [ ] `index.html` opens directly in browser — no build step
- [ ] All code snippets are valid TypeScript (copy-paste compilable)
- [ ] Mermaid diagrams render correctly (component tree, state flow, routing)
- [ ] Dark/light mode works without JS
- [ ] Print to PDF produces clean documentation
- [ ] Review loop catches TypeScript errors, missing sections
- [ ] Pipeline completes in <60s for 500-file project

---

## 16. Appendix: Reference Artifact Structure Mapping

| Reference Artifact Section | Insightify v4 Output |
|----------------------------|----------------------|
| 1. Struktur Direktori | Page 2: Directory Structure (collapsible tree) |
| 2. Model Data Global | Page 3: Global Data Models (TS interfaces + tables) |
| 3. Pohon Komponen Global | Page 4: Component Architecture (JSX tree + Mermaid) |
| 4. Base State Management | Page 5: State Management (store code + flow diagram) |
| 5. Standardisasi Interaksi API | Page 8: API Interaction Patterns (hook code + examples) |
| Implicit: Routing & Layouts | Page 6: Routing & Layout Structure |
| Implicit: UI Components | Page 7: UI Component Library |
| Implicit: Features | Page 9: Features & Business Logic |
| Implicit: Cross-cutting | Page 10: Cross-Cutting Concerns |

---

**Next Steps:** Begin Phase 1 implementation — update extraction schema and planner skill.