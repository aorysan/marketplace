# Insightify Improvements Design

## Goal
Improve the `insightify` plugin to produce clearer, more client-friendly documentation and add automated diagramming.

## 1. Planner Improvements (Phase 3: Plan)
- Update `skills/planner/SKILL.md`.
- Ensure each section in the generated Documentation Plan includes a 1-2 sentence core summary of the main findings from the source files.
- The plan should describe *what* the section covers, rather than just listing source file names.

## 2. Auto-Diagramming (Planner/Builder)
- Add capability to automatically generate architecture and relationship diagrams (using Mermaid) from the extracted file relationships.
- These diagrams will be included in the final output to make the structure easier to understand visually.

## 3. Client-Friendly Tone (Writer Phase)
- Update `skills/writer/SKILL.md`.
- Keep all technical categories (e.g., state management, routing) but translate the explanation to be "client-friendly" and business-oriented.
- Focus on "What it does" and "Business Value" (What & Why), avoiding excessive technical jargon or deep code implementation details (How).
- This will naturally result in shorter, more concise, and accessible documentation sections without losing the overall architectural categories.
