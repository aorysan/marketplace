# AST Parsing Integration for Insightify

## Overview
This design outlines the integration of `tree-sitter` into the Insightify plugin to perform accurate Abstract Syntax Tree (AST) parsing of code sources. This will drastically improve the precision of structural extraction (imports, exports, class architectures) and reduce hallucination from LLM-based parsing, specifically improving the `modularization.md`, `data-models.md`, and `component-architecture.md` knowledge categories.

## Architecture & Dependencies
The Insightify plugin will introduce a new parser dependency for AST analysis.
- **Core Dependency**: `tree-sitter` (via `web-tree-sitter` or native Node bindings, depending on the environment support for the IDE). Given the Node.js environment, we will use `tree-sitter` and standard language bindings.
- **Language Bindings**: 
  - `tree-sitter-javascript`
  - `tree-sitter-typescript`
  - `tree-sitter-python`
  - (Others can be added modularly)

## Component Design

### 1. Ingest Phase (`code-parser.js`)
When `insightify:planner` processes a file matching supported code extensions (`.js`, `.ts`, `.py`, etc.), it currently extracts docstrings and raw code.
**Changes:**
- The parser will instantiate the appropriate `tree-sitter` language parser.
- It will parse the file content into an AST.
- A new extraction layer will traverse the AST to pull:
  - **Imports**: Which files/modules does this file depend on?
  - **Exports**: What public APIs (functions, classes, variables) does this file expose?
  - **Declarations**: Signatures of main classes and functions.
- This structured AST data will be injected into the output markdown, likely within a fenced section (e.g., `<ast-dependencies>...</ast-dependencies>`) or directly into the YAML frontmatter of `source-XXX.md`.

### 2. Extract Phase (LLM Sub-agents)
During the parallel map-reduce extraction, the LLM sub-agents tasked with generating `modularization.md` and `component-architecture.md` will now receive these highly accurate AST summaries.
**Changes:**
- The extraction prompts will be updated to prioritize the `<ast-dependencies>` blocks over guessing from raw code when constructing relationships and Mermaid diagrams.

## Data Flow
1. **Source File** -> `code-parser.js`
2. `code-parser.js` -> `tree-sitter` -> **AST**
3. `code-parser.js` -> Query AST for Imports/Exports -> **AST Metadata**
4. **AST Metadata** + Raw Code -> `source-XXX.md`
5. `source-XXX.md` -> **Phase 2 Sub-agents** -> Accurate Knowledge Categories.

## Constraints & Error Handling
- **Fallback**: If `tree-sitter` fails to parse a file (due to severe syntax errors or unsupported language), the system must gracefully fall back to the existing regex/docstring extraction without failing the pipeline.
- **Performance**: AST parsing is fast, but the initialization of WebAssembly or native binaries should be done once per session/worker to avoid overhead.

## Testing Strategy
- Add unit tests for `code-parser.js` ensuring that given a TypeScript file with complex imports, the parser accurately returns the dependency list.
- Ensure the extraction prompts actually utilize the AST data to build proper Mermaid graphs.
